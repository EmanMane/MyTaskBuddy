import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from "react-native";
import Text from '@kaloraat/react-native-text';
import UserInput from "../components/UserInput";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get('window');

// importi za notifikacije
import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Postavke notifikacija
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Can use this function below or use Expo's Push Notification Tool from: https://expo.dev/notifications
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token.data;
}


const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState('');


  const handleLogin = async () => {
    try {
      const responseLogin = await axios.post('https://my-task-buddy-nu.vercel.app/users/login', {
        username: username,
        password: password,
      });
      if (responseLogin.status === 200) {
        // Logged in successfully
        setMessage('');
        // Extract the user ID from the response
        const userId = responseLogin.data.userId;
        
        const responseExpo = await axios.put(`https://my-task-buddy-nu.vercel.app/devices/${expoPushToken}`, {
          userId: userId
        });
        
        // Store the user ID locally
        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('expoPushToken', expoPushToken);
        navigation.navigate('HomePage');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Invalid username or password
        setMessage('Neispravno korisničko ime ili lozinka');
      } else {
        // Other errors
        setMessage('Došlo je do greške');
      }
    }
  };


  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      //console.log('Expo Push Token:', token);
      setExpoPushToken(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {});

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);


  return (
    <KeyboardAvoidingWrapper>
      <View style={styles.container}>
        <View style={styles.login}>
          <Image source={require("../assets/logo.png")} style={styles.image}></Image>
          <Text style={styles.textLogin} dark bold>Prijava</Text>
          <Text style={styles.subtitle} >Prijavi se da nastaviš.</Text>
          <UserInput name="KORISNIČKO IME" value={username} setValue={setUsername}></UserInput>
          <UserInput name="LOZINKA" value={password} setValue={setPassword} secureTextEntry={true}></UserInput>
          {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : null}
          <TouchableOpacity style={styles.buttonLogin} onPress={handleLogin}>
            <Text dark bold style={{ color: '#FFFFFF', fontSize: width * 0.04 }}>Prijavi se</Text>
          </TouchableOpacity>
          <Text bold style={{ marginTop: 20 }}>Nemate račun?</Text>
          <TouchableOpacity style={styles.buttonRegistration} onPress={() => navigation.navigate('Registration')}>
            <Text dark bold style={{ color: '#000000', fontSize: width * 0.04 }}>Registruj se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  )
}

const styles = StyleSheet.create({
  image: {
    width: width * 0.35,
    height: width * 0.35,
    marginTop: width * -0.35,
    marginBottom: height * 0.02,
  },
  container: {
    flex: 1,
    backgroundColor: '#00004d',
  },
  login: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.3,
    borderTopRightRadius: 0.15 * height
  },
  textLogin: {
    marginTop: 0.01 * height,
    fontSize: 0.06 * height,
    color: 'rgb(28,33,32)',
  },
  subtitle: {
    marginBottom: 0.06 * height,
  },
  buttonLogin: {
    backgroundColor: '#00b300',
    borderRadius: 0.03 * height,
    paddingVertical: 0.02 * height,
    paddingHorizontal: 0.08 * width,
    justifyContent: 'center',
    alignItems: 'center',
    width: 0.7 * width,
    marginTop: 0.02 * height,
  },
  buttonRegistration: {
    backgroundColor: '#ffdb4d',
    borderRadius: 0.03 * height,
    paddingVertical: 0.02 * height,
    paddingHorizontal: 0.08 * width,
    justifyContent: 'center',
    alignItems: 'center',
    width: 0.7 * width,
    marginTop: 0.01 * height,
    marginBottom: '100%'
  },
  message: {
    color: 'red',
    marginTop: 10,
  }
});

export default Login;