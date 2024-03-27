import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from "react-native";
import Text from '@kaloraat/react-native-text';
import UserInput from "../components/UserInput";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import AsyncStorage from '@react-native-async-storage/async-storage';
const qs = require('qs'); // Import the qs library


const { width, height } = Dimensions.get('window');



const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState('');


  const handleLogin = async () => {
    try {
      const formData = qs.stringify({ // Serialize the data object to x-www-form-urlencoded format
        username: username,
        password: password
      });
      const response = await axios.post('http://10.0.2.2:3000/users/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Set the content type header
        }
      });
      if (response.status === 200) {
        // Logged in successfully
        setMessage('');
        // Extract the user ID from the response
        const userId = response.data.userId;

        // Store the user ID locally
        await AsyncStorage.setItem('userId', userId);
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