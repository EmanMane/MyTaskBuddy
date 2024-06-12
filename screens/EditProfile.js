import React, { useState,useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Button,
    ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';

const { width, height } = Dimensions.get('window');

const imagePaths = {
    b1: require('../assets/rewards/b1.png'),
    b2: require('../assets/rewards/b2.png'),
    b3: require('../assets/rewards/b3.png'),
    b4: require('../assets/rewards/b4.png'),
    b5: require('../assets/rewards/b5.png'),
    b6: require('../assets/rewards/b6.png'),
    s1: require('../assets/rewards/s1.png'),
    s2: require('../assets/rewards/s2.png'),
    s3: require('../assets/rewards/s3.png'),
    s4: require('../assets/rewards/s4.png'),
    s5: require('../assets/rewards/s5.png'),
    s6: require('../assets/rewards/s6.png'),
    g1: require('../assets/rewards/g1.png'),
    g2: require('../assets/rewards/g2.png'),
    g3: require('../assets/rewards/g3.png'),
    g4: require('../assets/rewards/g4.png'),
    g5: require('../assets/rewards/g5.png'),
    g6: require('../assets/rewards/g6.png'),
    p1: require('../assets/rewards/p1.png'),
    p2: require('../assets/rewards/p2.png'),
    p3: require('../assets/rewards/p3.png'),
    p4: require('../assets/rewards/p4.png'),
    p5: require('../assets/rewards/p5.png'),
    p6: require('../assets/rewards/p6.png'),
  };
  

const EditProfile = ({navigation}) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    const [expoPushToken, setExpoPushToken] = useState('');

    const [completedTasks, setCompletedTasks] = useState(0);
    const [bronzeLevel, setBronzeLevel] = useState(0);
    const [silverLevel, setSilverLevel] = useState(0);
    const [goldLevel, setGoldLevel] = useState(0);
    const [platinumLevel, setPlatinumLevel] = useState(0);
    
    const fetchCompletedTasks = async (userId) => {
        try {
            const response = await fetch(`https://my-task-buddy-nu.vercel.app/completed-tasks?userId=${userId}`);
            const data = await response.json();
            if (data !== null && data !== undefined) {
                //console.log("completed_tasks:", data.completed_tasks);
                return data.completed_tasks;
            } else {
                return 0;
            }
        } catch (error) {
            console.error('Error fetching completed tasks:', error);
            return 0;
        }
    };
    

    const calculateRewards = (completedTasks) => {
        // Izračunajte broj svake vrste medalje na osnovu broja završenih zadataka
    
        // Prva bronzana medalja svakih 5 zadataka
        const bronzeCount = Math.floor(completedTasks / 5);

        // Prva srebrna medalja svakih 5 zadataka nakon što nestane bronzanih
        const silverCount = Math.floor((completedTasks - 30) / 5);

        // Prva zlatna medalja svakih 5 zadataka nakon što nestane srebrnih
        const goldCount = Math.floor((completedTasks - 60) / 5);

        // Prva platinum medalja svakih 5 zadataka nakon što nestane zlatnih
        const platinumCount = Math.floor((completedTasks - 90) / 5);
    
        // Postavljanje stanja nivoa medalja
        setBronzeLevel(bronzeCount > 6 ? 6 : bronzeCount); 
        setSilverLevel(silverCount > 6 ? 6 : silverCount); 
        setGoldLevel(goldCount > 6 ? 6 : goldCount); 
        setPlatinumLevel(platinumCount > 6 ? 6 : platinumCount);
    };
    



    // Fetch user details
    const fetchUserDetails = async () => {
        try {
        // Logged user ID
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('expoPushToken');
        setExpoPushToken(token);
        
        // Make a request to your API to fetch details based on the user ID
        const response = await fetch(`https://my-task-buddy-nu.vercel.app/userdetails?userId=${userId}`);
        const data = await response.json();

        // Update fields with the fetched data
        setAvatar(data.avatar);
        setUsername(data.username);
        setPassword(data.password);
        setFirstName(data.firstname);
        setLastName(data.lastname);

        const completedTasksCount = await fetchCompletedTasks(userId);
        setCompletedTasks(completedTasksCount);

        calculateRewards(completedTasksCount);

        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };
    
    const renderMedals = (level, type) => {
        if (level === 0 && type==="b") {
            return <Text style={styles.noMedalsText}>Nemate medalja</Text>;
        } else {
            const medals = [];
            for (let i = 1; i <= level; i++) {
                medals.push(<Image key={`${type}${i}`} source={imagePaths[`${type}${i}`]} style={styles.medal} />);
            }
            return medals;
        }
    };
    

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchUserDetails();
        });

        return unsubscribe;
    }, [navigation]);

    
    const handleChanges = async() => {
        // handle changing data logic
        try {
            // Logged user ID
            const userId = await AsyncStorage.getItem('userId');
            const response = await axios.put(`https://my-task-buddy-nu.vercel.app/users/${userId}/profile`, {
                username: username,
                password: password
              });
            console.log(response.data.message);
            alert('Profile updated successfully');
        }catch (error) {
            console.error('Error editing profile:', error);

        }
    }

    const handleSwitch = async () => {
        try {
          // Send a PUT request to update the user's device information with userId set to null
          await axios.put(`https://my-task-buddy-nu.vercel.app/devices/${expoPushToken}`, {
            userId: null
          });
          await AsyncStorage.removeItem('username');
          await AsyncStorage.removeItem('password');
          // Navigate to the Login screen
          navigation.navigate('Login');
        } catch (error) {
          // Handle any errors here
          console.error('Error switching account:', error);
        }
      };
      

    return (
        <KeyboardAvoidingWrapper>
            <ScrollView contentContainerStyle={styles.main}>
                <View style={styles.container}>
                    <Text style={styles.headingEdit}>Uredi profil</Text>
                </View>
                <View style={styles.userData}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.image} />
                    ) : null}
                    <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            <Icon name="user" size={width * 0.045} color="#2CB237" /> Novo korisničko ime
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={(text) => setUsername(text)}
                        />
                        <Text style={styles.label}>
                            <Icon name="lock" size={width * 0.045} color="blue" /> Nova lozinka
                        </Text>
                        <View style={styles.passwordContainer}>
                            <View style={styles.wrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    secureTextEntry={true}
                                    onChangeText={(text) => setPassword(text)}
                                />
                            </View>
                        </View>
                        <TouchableOpacity style={styles.button} onPress={handleChanges}>
                            <Text style={styles.buttonText}>Sačuvaj promjene</Text>
                        </TouchableOpacity>
                        <View style={styles.medalsContainer}>
                            <Text style={styles.medalsTitle}>Vaše medalje:</Text>
                            <View style={styles.medalsRow}>
                                {renderMedals(bronzeLevel, 'b')}
                                {renderMedals(silverLevel, 's')}
                                {renderMedals(goldLevel, 'g')}
                                {renderMedals(platinumLevel, 'p')}
                            </View>
                        </View>
                        <TouchableOpacity style={styles.switchProfile} onPress={handleSwitch}>
                            <Text style={styles.switchProfileText}>Prijavi se s drugog računa</Text>
                        </TouchableOpacity>
                    </View>
                </View>                       

            </ScrollView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#cceeff',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderColor: 'darkgray',
        borderBottomWidth: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingTop: 50,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    heading: {
        fontSize: 25

    },
    image: {
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: 50,
        marginBottom: 20,
        alignSelf: 'center'
    },
    inputContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#f2f2f2',
        borderTopRightRadius: 100,
        height: '100%',
        borderColor: '#d9d9d9',
        borderTopLeftRadius: 100,
        borderWidth: 1,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: 'black',
        fontSize: width * 0.04,
        marginLeft: 32
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        padding: 10,
        marginBottom: 10,
        fontSize: width * 0.035,
        color: '#696969',
        width: '80%',
        backgroundColor: 'white',
        marginLeft: 32,
        paddingLeft: 20
    },
    usernameContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        //alignItems: 'center',
        marginBottom: 10,
    },
    passwordContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        //alignItems: 'center',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#cceeff',
        borderRadius: 20,
        padding: 12,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'darkgray',
        marginBottom: 0
    },
    buttonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: width * 0.04
    },
    switchProfile: {
        //padding: 10,
        marginTop: 5,
    },
    switchProfileText: {
        color: '#00004d',
        fontSize: width * 0.04,
        marginTop: 5,
        textDecorationLine: 'underline',
        alignSelf: 'center'
    },
    name: {
        fontSize: width * 0.065,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
        color: 'black',
    },
    whiteContainter: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        //marginTop:280,
        borderTopRightRadius: 70,
        width: '100%',
        //paddingTop: 10
    },
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userData: {
        marginTop: height * 0.16,
    },
    headingEdit: {
        fontSize: width * 0.045,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 10,
    },
    main: {
        backgroundColor: 'white',
        height: '100%'
    },
    medalsContainer: {
        width: '100%',
        alignItems: 'left',
        marginVertical: 30,
    },
    medalsTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    medalsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    medal: {
        width: 50,
        height: 50,
        margin: 2,
        marginRight: 5, 
        marginBottom: 0
    },
    noMedalsText: {
        fontSize: 18,
        fontStyle: 'italic',
        color: 'red',
        marginTop: 10,
    },    
});

export default EditProfile;