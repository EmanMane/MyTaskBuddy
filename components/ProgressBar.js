import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const ProgressBar = ({ progress }) => {
  const [percent, setPercent] = useState(0);

  const styles = StyleSheet.create({
    container: {
      width: '80%',
      height: 15,
      borderRadius: 10,
      backgroundColor: '#ccc',
      marginVertical: width*0.03,
      alignSelf: 'center',
    },
    bar: {
      width: `${progress}%`,
      height: 15,
      borderRadius: 10,
      backgroundColor: progress === 100 ? '#66ff66' : '#66b3ff',
    },
    text: {
      color: '#0066cc',
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.bar} />
      </View>
    </View>
  );
};

export default ProgressBar;
