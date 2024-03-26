import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import ProgressBar from './ProgressBar';

const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

const TaskCard = ({ startTime, endTime, activity, progress, location, onPress, priority }) => {
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress}>
      <View style={styles.container2}>
        <Text style={styles.activity}>{activity}</Text>
        {priority === 1 && <Text style={styles.urgentText}>HITNO</Text>}
        </View>
        <Image source={require("../assets/options.png")} style={styles.newImage} />
        <View style={styles.container}>
          <Image source={require("../assets/clock.png")} style={styles.clock} />
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{formattedStartTime} - {formattedEndTime}</Text>
            <Text style={styles.locationText}>{location}</Text>
            <Image source={require("../assets/placeholder.png")} style={styles.locationIcon} />
          </View>
        </View>

        <ProgressBar progress={progress} />
      </TouchableOpacity>
    </View>
  );
};

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: deviceWidth *0.83, // Adjust width based on the device screen width
    height: deviceHeight *0.18,
    borderColor: '#C8C8C8',
    borderWidth: 1
  },
  timeContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    flex:1,
    fontSize: deviceWidth*0.035,
    marginRight:10
  },
  activity: {
    fontSize: deviceWidth*0.05,
    fontWeight: 'bold',
    marginBottom:15
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  clock: {
    width: deviceWidth*0.06,
    height: deviceWidth*0.06,
    marginRight: 10,
  },
  newImage: {
    width: deviceWidth*0.06,
    height: deviceWidth*0.06,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  locationText: {
    fontSize: deviceWidth*0.035,
    paddingRight:10

  },
  locationIcon:{
    width: deviceWidth*0.06,
    height: deviceWidth*0.06,
  },
  urgentText: {
    color: '#e60000', 
    backgroundColor:'#ffcccc',
    padding:5,
    borderRadius:5,
    marginLeft:deviceWidth*0.25,
    fontSize:deviceWidth*0.028,
    fontWeight:'bold',
    marginTop:-10,
  },
  container2: {
    flexDirection: 'row',
    alignItems: 'center'
  },
});

export default TaskCard;
