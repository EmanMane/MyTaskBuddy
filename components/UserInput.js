import React, { useState } from "react";
import { StyleSheet, View, TextInput, Dimensions, TouchableOpacity } from "react-native";
import Text from '@kaloraat/react-native-text';
import { Ionicons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');

const UserInput = ({ name, value, setValue, secureTextEntry, autoCapitalize }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputData}>
      <Text semi style={styles.label}>{name}</Text>
      <View style={styles.inputFieldContainer}>
        <TextInput
          style={styles.inputField}
          value={value}
          onChangeText={(text) => setValue(text)}
          secureTextEntry={!showPassword && secureTextEntry}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#a6a6a6"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputData: {
    marginHorizontal: 24,
  },
  label: {
    marginBottom: 5,
    fontSize: width * 0.03,
  },
  inputFieldContainer: {
    position: 'relative',
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 10,
    width: 0.7 * width,
    marginBottom: 10,
  },
  eyeIcon: {
    position: 'absolute',
    top: 13,
    right: 10,
  },
});

export default UserInput;
