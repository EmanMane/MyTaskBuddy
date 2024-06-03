import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import ProgressBar from './ProgressBar';
import * as Calendar from 'expo-calendar';
import moment from 'moment';
import axios from 'axios';

// Funkcija za dobijanje pristupa kalendaru
async function getCalendarPermissions() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

const addEventToCalendar = async (taskDetails) => {
  const granted = await getCalendarPermissions();

  if (!granted) {
    console.log('Calendar permissions not granted');
    return;
  }

  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendar = calendars[0];

  if (!defaultCalendar) {
    console.log('No default calendar found');
    return;
  }

  const eventDetails = {
    title: taskDetails.activity,
    startDate: taskDetails.startTime,
    endDate: taskDetails.endTime,
    timeZone: 'CET',
    location: taskDetails.location,
    alarms: [
      {
        relativeOffset: -30, // Alert 30 minutes before the event starts
        method: Calendar.AlarmMethod.ALERT,
      },
    ],
  };

  try {
    const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
    console.log(`Event created with id: ${eventId}`);
    return true; // Dodavanje događaja uspješno
  } catch (error) {
    console.error('Error creating event', error);
    return false; // Dodavanje događaja neuspješno
  }
};

const checkIfEventExists = async (taskDetails) => {
  const granted = await getCalendarPermissions();

  if (!granted) {
    console.log('Calendar permissions not granted');
    return false;
  }

  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendar = calendars[0];

  if (!defaultCalendar) {
    console.log('No default calendar found');
    return false;
  }

  const events = await Calendar.getEventsAsync(
    [defaultCalendar.id],
    taskDetails.startTime,
    taskDetails.endTime
  );

  return events.some(event =>
    event.title === taskDetails.activity &&
    moment(event.startDate).isSame(taskDetails.startTime) &&
    moment(event.endDate).isSame(taskDetails.endTime)
  );
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

const TaskCard = ({ taskId, startTime, endTime, activity, progress, location, onPress, priority, help, date }) => {
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  const [isHelpEnabled, setIsHelpEnabled] = useState(help === 1);
  const [isEventAdded, setIsEventAdded] = useState(false);

  useEffect(() => {
    const checkEvent = async () => {
      const startTaskDate = moment(date).startOf('day').set({ hour: startTime.split(':')[0], minute: startTime.split(':')[1], second: 0 }).toDate();
      const endTaskDate = moment(date).startOf('day').set({ hour: endTime.split(':')[0], minute: endTime.split(':')[1], second: 0 }).toDate();
      const eventExists = await checkIfEventExists({ activity, startTime: startTaskDate, endTime: endTaskDate });
      setIsEventAdded(eventExists);
    };

    checkEvent();
  }, []);

  const handleHelpClick = async () => {
    try {
      const newHelpValue = isHelpEnabled ? 0 : 1;
      const response = await axios.put(`https://my-task-buddy-nu.vercel.app/tasks/${taskId}/update-help`, {
        help: newHelpValue,
      });

      if (response.status === 200) {
        setIsHelpEnabled(!isHelpEnabled);
      } else {
        console.error('Failed to update help value');
      }
    } catch (error) {
      console.error('Error updating help value:', error);
    }
  };

  const handleAddEventClick = async () => {
    const startTaskDate = moment(date).startOf('day').set({ hour: startTime.split(':')[0], minute: startTime.split(':')[1], second: 0 }).toDate();
    const endTaskDate = moment(date).startOf('day').set({ hour: endTime.split(':')[0], minute: endTime.split(':')[1], second: 0 }).toDate();

    const eventAdded = await addEventToCalendar({
      startTime: startTaskDate,
      endTime: endTaskDate,
      activity,
      location,
      date
    });

    if (eventAdded) {
      setIsEventAdded(true);
    }
  };

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
        <View style={styles.buttonContainer}>
          <Text style={styles.helpText}>Da li vam je potrebna pomoć sa ovim zadatkom?</Text>
          {help !== undefined && (
            <TouchableOpacity
              style={[styles.helpButton, { opacity: help === 0 ? 0.7 : 1 }]}
              onPress={handleHelpClick}
            >
              <Text style={styles.helpButtonText}>{isHelpEnabled ? "   DA   " : "   NE   "}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.calendarButton, { opacity: isEventAdded ? 0.7 : 1 }]} 
          onPress={handleAddEventClick} 
          disabled={isEventAdded}
        >
          <Text style={styles.calendarButtonText}>
            {isEventAdded ? "DODANO U KALENDAR" : "DODAJ U KALENDAR"}
          </Text>
        </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: deviceWidth * 0.83,
    height: deviceHeight * 0.3,
    borderColor: '#C8C8C8',
    borderWidth: 1,
  },
  timeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    flex: 1,
    fontSize: deviceWidth * 0.035,
    marginRight: 10,
  },
  activity: {
    fontSize: deviceWidth * 0.05,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clock: {
    width: deviceWidth * 0.06,
    height: deviceWidth * 0.06,
    marginRight: 10,
  },
  newImage: {
    width: deviceWidth * 0.06,
    height: deviceWidth * 0.06,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  locationText: {
    fontSize: deviceWidth * 0.035,
    paddingRight: 10,
  },
  locationIcon: {
    width: deviceWidth * 0.06,
    height: deviceWidth * 0.06,
  },
  urgentText: {
    color: '#e60000',
    backgroundColor: '#ffcccc',
    padding: 5,
    borderRadius: 5,
    marginLeft: deviceWidth * 0.25,
    fontSize: deviceWidth * 0.028,
    fontWeight: 'bold',
    marginTop: -10,
  },
  container2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: deviceWidth * 0.55,
    marginTop: 10,
  },
  helpText: {
    marginRight: 10,
  },
  helpButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  calendarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskCard;