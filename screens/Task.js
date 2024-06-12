import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import StepsComponent from '../components/StepsComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};
const { width, height } = Dimensions.get('window');

const Task = ({ route, navigation }) => {
  const { userId, taskId, activityName, date, startTime, endTime, location, parentId } = route.params; // getting the activity name from the route params
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState(0);
  const [isWhiteContainerVisible, setIsWhiteContainerVisible] = useState(false);
  const slideUpAnimation = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const formattedDate = moment(new Date(date)).format('dddd D. MMMM YYYY');
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  const [parentDetails, setParentDetails] = useState('');
  const [congratulationVisible, setCongratulationVisible] = useState(false);

  const [animateEmoji2, setAnimateEmoji2] = useState(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    if (animateEmoji2) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 1000, // Adjust the duration as needed
        useNativeDriver: true,
      }).start();
    }
  }, [animateEmoji2]);
  
  
  
  
  
  const fetchFirstName = async () => {
    try {
      // Logged user ID
      const userId = await AsyncStorage.getItem('userId');

      // Make a request to your API to fetch firstname based on the user ID
      const response = await fetch(`https://my-task-buddy-nu.vercel.app/users/${userId}/firstname`);
      const data = await response.json();

      if (response.ok) {
        setFirstName(data.firstName);
      } else {
        console.error('Error fetching name:', data.error);
      }
    } catch (error) {
      console.error('Error fetching name:', error);
    }
  };

  const fetchTaskStatus = async () => {
    try {
      // Make a request to your API to fetch the task status based on the task ID
      const response = await fetch(`https://my-task-buddy-nu.vercel.app/tasks/${taskId}/status`);
      const data = await response.json();

      if (response.ok) {
        const taskStatus = data.status;
        setStatus(taskStatus);
        setIsWhiteContainerVisible(taskStatus === 1 || taskStatus === 2); // Update the visibility condition
        setCongratulationVisible(taskStatus === 2);
      } else {
        console.error('Error fetching task status:', data.error);
      }
    } catch (error) {
      console.error('Error fetching task status:', error);
    }
  };

  const startTask = async () => {
    try {
      // Get the current timestamp
      const userStartTime = new Date().toLocaleString('bs-BA');
      // Make a request to your API to update task status
      await fetch(`https://my-task-buddy-nu.vercel.app/tasks/${taskId}/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 1}),
      });
      // Make a request to your API to update userStartTime
      await fetch(`https://my-task-buddy-nu.vercel.app/tasks/${taskId}/update-userStartTime`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userStartTime}),
      });

      // Set the whiteContainer visibility to true
      setStatus(1);
      setIsWhiteContainerVisible(true);

      if (status === 0) {
        // Animate the slide up for whiteContainer
        Animated.timing(slideUpAnimation, {
          toValue: 1,
          duration: 500, // Adjust the duration as needed
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const fetchParentDetails = async () => {
    try {
      const response = await fetch(`https://my-task-buddy-nu.vercel.app/parents/${parentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch parent details');
      }
      const data = await response.json();
      setParentDetails(data);
    } catch (error) {
      throw new Error('Failed to fetch parent details');
    }
  };

  useEffect(() => {
    fetchFirstName();
    fetchTaskStatus();
    fetchParentDetails();
  }, []);

  useEffect(() => {
    if (isWhiteContainerVisible) {
      Animated.timing(slideUpAnimation, {
        toValue: 1,
        duration: 500, // Adjust the duration as needed
        useNativeDriver: true,
      }).start();
    }
  }, [isWhiteContainerVisible]);

  const handleImagePress = () => {
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={require('../assets/left.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleImagePress} style={styles.menuIconContainer}>
        <Image source={require('../assets/detail.png')} style={styles.menuIcon} />
      </TouchableOpacity>
        {animateEmoji2 ? (
  
            <Animated.View
              style={[
                styles.animatedContainer,
                {
                  transform: [
                    {
                      translateY: slideAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-200, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image source={require('../assets/emoji2.png')} style={styles.topicon} />
              <Text style={styles.lets}>Bravo, uspješno ste obavili zadatak</Text>
              <Text style={styles.activityName}>{activityName}</Text>
            </Animated.View>
  
        ) : (
          <View style={styles.blueContainer}>
            <Image
              source={congratulationVisible ? require('../assets/checklist.png') : require('../assets/planning2.png')}
              style={styles.topicon}
            />
            <Text style={styles.lets}>
              {congratulationVisible ? "Završen zadatak" : `Zdravo ${firstName}, idemo raditi zadatak`}
            </Text>
            <Text style={styles.activityName}>{activityName}</Text>
          </View>
        )}
      {isWhiteContainerVisible ? (
        <Animated.View
          style={[
            styles.whiteContainer,
            {
              transform: [
                {
                  translateY: slideUpAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView>
            <StepsComponent userId={userId} taskId={taskId} onLastStepComplete={() => setAnimateEmoji2(true)} />
          </ScrollView>
        </Animated.View>
      ) : (
        <TouchableOpacity style={styles.startButton} onPress={startTask} disabled={status !== 0}>
          <Text style={styles.startButtonText}>Započni</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {/* Task details */}
      <Text style={styles.modalHeading}>{activityName}</Text>
      <View style={styles.modalDetails}>
        <View style={styles.row}>
          <Image source={require('../assets/schedule.png')} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.boldText}>Datum:</Text>
            <Text style={styles.regularText}>{formattedDate}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Image source={require('../assets/clock.png')} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.boldText}>Trajanje:</Text>
            <Text style={styles.regularText}>{formattedStartTime} - {formattedEndTime}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Image source={require('../assets/placeholder.png')} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.boldText}>Lokacija:</Text>
            <Text style={styles.regularText}>{location}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Image source={require('../assets/ancestors.png')} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.boldText}>Zadatak zadao/la:</Text>
            <Text style={styles.regularText}>{parentDetails.firstname} {parentDetails.lastname}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</TouchableWithoutFeedback>

      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  blueContainer: {
    alignItems: 'center',
    marginTop: height * 0.15,
    marginBottom: height * 0.01,
  },  
  icon: {
    position: 'absolute',
    top: height * 0.02,
    left: width * 0.02,
    width: width * 0.1,
    height: width * 0.1,
    marginTop: height * 0.04,
    marginStart: width * 0.01,
  },
  menuIconContainer: {
    position: 'absolute',
    top: height * 0.02,
    right: width * 0.02,
    marginTop: height * 0.04,
    marginEnd: width * 0.01
  },
  menuIcon: {
    width: width * 0.1,
    height: width * 0.1,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: '#e6f2ff',
    borderTopLeftRadius: width * 0.2,
    borderTopRightRadius: width * 0.2,
    marginTop: height * 0.01,
  },
  lets: {
    fontSize: width*0.035,
    color: 'grey',
    textAlign: 'center',
    paddingTop: 20,
  },
  activityName: {
    fontSize: width*0.06,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingTop: 5,
  },
  startButton: {
    backgroundColor: '#333371',
    borderRadius: width * 0.1,
    padding: width * 0.015,
    marginTop: height * 0.03,
    marginBottom: height * 0.01,
    width: width * 0.4,
    borderWidth: width * 0.01,
    borderColor: 'darkblue',
    alignSelf: 'center',
  },  
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize:width*0.045,
    textAlign: 'center',
  },
  topicon: {
    width: width * 0.2,
    height: width * 0.2,
    alignSelf: 'center',
  },  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: width * 0.75,
    borderRadius: width * 0.03,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.03,
    paddingBottom: height * 0.02,
    borderWidth: 2,
  },  
  modalHeading: {
    fontSize: width*0.05,
    fontWeight: 'bold',
    paddingBottom: 20,
    textAlign: 'center',
  },
  modalDetails: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    width: width*0.09,
    height: width*0.09,
    marginRight: 10,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: width*0.035,
  },
  regularText: {
    fontSize: width*0.03,
  },
  closeButton: {
    backgroundColor: '#66ccff',
    borderRadius: 20,
    padding: 10,
    marginTop: 20,
    alignSelf: 'flex-end',
    borderWidth:2,
    width:'30%',
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: width*0.033,
    textAlign: 'center',
  },
  animatedContainer:{
    alignItems: 'center',
    marginTop: '25%',
    marginBottom: 5,
  }
  
});

export default Task;
