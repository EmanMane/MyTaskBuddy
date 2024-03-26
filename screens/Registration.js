import React, { useState, Component } from "react";
import { StyleSheet, View, TouchableOpacity, Image,Dimensions } from "react-native";
import Text from '@kaloraat/react-native-text';
import UserInput from "../components/UserInput";
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import AvatarPicker from "../components/AvatarPicker";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const avatars = [
    { id: 1, url: 'https://cdn-icons-png.flaticon.com/512/847/847969.png' },
    { id: 2, url: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png' },
    { id: 3, url: 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png' },
    { id: 4, url: 'https://cdn-icons-png.flaticon.com/512/1154/1154455.png' },
    { id: 5, url: 'https://cdn-icons-png.flaticon.com/512/706/706831.png' },
    { id: 6, url: 'https://cdn-icons-png.flaticon.com/512/1154/1154955.png' },
    { id: 7, url: 'https://cdn-icons-png.flaticon.com/512/1154/1154480.png' },
];

const { width, height } = Dimensions.get('window');

selectedAvatar = avatars[0];

const handleSelectAvatar = (avatar) => {
    console.log('Selected avatar:', avatar);
    selectedAvatar = avatar
};



class Registration extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            username: '',
            password: '',
            error:false
        };
    }
   
    setFirstName = (text) => {
        this.setState({ firstName: text });
    }
    setLastName = (text) => {
        this.setState({ lastName: text });
    }
    setUsername = (text) => {
        this.setState({ username: text });
    }
    setPassword = (text) => {
        this.setState({ password: text });
    }
    setError = (text) => {
        this.setState({ error:text });
    }

    static navigationOptions = {
        header: null
    };

    defaultScrollViewProps = {
        keyboardShouldPersistTaps: 'handled',
        contentContainerStyle: {
            flex: 1,
            justifyContent: 'center'
        }
    };

    onNextStep = () => {
        console.log('called next step');
    };

    onPrevStep = () => {
        console.log('called previous step');
    };
    onHomePage = () => {
        this.props.navigation.navigate('HomePage');
    };

    onSubmitSteps = async () => {
        console.log('called on submit step.');
        try {
            const response = await axios.post('http://10.0.2.2:3000/users/register', {
              firstname:this.state.firstName,
              lastname:this.state.lastName,
              username:this.state.username,
              password:this.state.password,
              avatar:selectedAvatar.url
            });
            if (response.status === 200) {
                // Extract the user ID from the response
                const userId = response.data.userId;
                // Store the user ID locally
                await AsyncStorage.setItem('userId', userId);
                this.setError(false);
            }
          } catch (error) {
            alert(error.response.data.error);
            this.setError(true);
        }
    };

    render() {
        const progressStepsStyle = {
            activeStepIconBorderColor: 'lightblue',
            activeLabelColor: 'black',
            activeStepNumColor: 'black',
            activeStepIconColor: 'lightblue',
            completedStepIconColor: 'lightgreen',
            completedProgressBarColor: 'lightgreen',
            completedCheckColor: 'green'
        };

        const buttonTextStyle = {
            backgroundColor: '#e6e6e6',
            borderColor: '#00004d',
            borderRadius: 20,
            borderWidth: 2,
            padding: 10,
            color: '#000000',
            fontSize:width*0.04,
            marginBottom:-30,
            marginHorizontal:-10

        };
        const handleBackButtonPress = () => {
            this.props.navigation.goBack();
          };



        return (

            <View style={styles.container}>
                <TouchableOpacity onPress={handleBackButtonPress} style={styles.backButton}>
                    <Image source={require('../assets/left.png')} style={styles.icon}></Image>
                </TouchableOpacity>
                <KeyboardAvoidingWrapper>
                <View style={styles.login}>
                    <View style={{ flex: 1 }}>
                        <ProgressSteps {...progressStepsStyle}>


                            <ProgressStep
                                label="Prvi korak"
                                onNext={this.onNextStep}
                                onPrevious={this.onPrevStep}
                                scrollViewProps={this.defaultScrollViewProps}
                                nextBtnTextStyle={buttonTextStyle}
                                nextBtnText="Nastavi"

                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={styles.textRegistration1} dark bold>Registracija</Text>
                                    <AvatarPicker avatars={avatars} onSelectAvatar={handleSelectAvatar} />
                                    <View style={styles.textImageContainer}>
                                        <View style={styles.textContainer}>
                                            <Text style={styles.text}>Listaj za odabir slike profila</Text>
                                        </View>
                                        <Image source={require('../assets/flick-to-left.png')} style={{ width: 50, height: 50 }}>

                                        </Image>
                                    </View>
                                    <UserInput name="UNESI IME:" value={this.state.firstName} setValue={this.setFirstName} autoCapitalize="words"></UserInput>
                                    <UserInput name="UNESI PREZIME:" value={this.state.lastName} setValue={this.setLastName} autoCapitalize="words"></UserInput>

                                </View>
                            </ProgressStep>



                            <ProgressStep
                                label="Drugi korak"
                                onPrevious={this.onPrevStep}
                                onNext={this.onSubmitSteps}
                                scrollViewProps={this.defaultScrollViewProps}
                                nextBtnTextStyle={buttonTextStyle}
                                nextBtnText="Registruj se"
                                previousBtnTextStyle={buttonTextStyle}
                                previousBtnText="Vrati se"
                                errors={this.state.error}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={styles.textRegistration} dark bold>Registracija</Text>
                                    <Image source={require('../assets/important.png')} style={{ marginBottom: 20, height: height * 0.25, width: width * 0.45, }}></Image>
                                    <UserInput name="UNESI KORISNIČKO IME:" value={this.state.username} setValue={this.setUsername} ></UserInput>
                                    <UserInput name="UNESI LOZINKU:" value={this.state.password} setValue={this.setPassword} secureTextEntry={true}></UserInput>

                                </View>
                            </ProgressStep>



                            <ProgressStep
                                label="Kraj"
                                onPrevious={this.onPrevStep}
                                onSubmit={this.onHomePage}
                                scrollViewProps={this.defaultScrollViewProps}
                                nextBtnTextStyle={buttonTextStyle}
                                finishBtnText="Nastavi"
                                previousBtnTextStyle={buttonTextStyle}
                                previousBtnText="Vrati se"
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={style = styles.congratsText}>Uspješno napravljen račun!</Text>

                                    <Image source={require('../assets/emoji2.png')} style={{   width: width * 0.8, height: height * 0.4,}} ></Image>
                                </View>
                            </ProgressStep>
                        </ProgressSteps>
                    </View>
                </View>
                </KeyboardAvoidingWrapper>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffdb4d'
    },
    login: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: height * 0.15,
        borderTopRightRadius: 0.15 * height,
        paddingBottom:'100%'

    },
    textRegistration1: {
        marginTop: 0.01 * height,
        fontSize: 0.06 * height,
        color: 'rgb(28,33,32)',
        marginBottom: 30

    },
    textRegistration: {
        marginBottom: 10,
        fontSize: 0.06 * height,
        color: 'rgb(28,33,32)'

    },
    icon: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: width*0.1,
        height: width*0.1,
        marginTop: 40,
        marginStart: 5
    },
    congratsText: {
        fontSize: 0.06 * height,
        textAlign: 'center',
        marginStart: 20,
        marginEnd: 20
    },
    textContainer: {
        backgroundColor: '#1c1c1c',
        borderRadius: 20,
        padding: 10,
        marginBottom: 30,
        padding: 12
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize:width*0.03
    },
    textImageContainer: {
        flexDirection: 'row'
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 10,
        zIndex: 1
      }
});

export default Registration;