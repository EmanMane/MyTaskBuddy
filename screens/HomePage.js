import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import Calendar from '../components/Calendar';
import TaskCard from '../components/TaskCard';
import FilterStatus from '../components/FilterStatus';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const HomePage = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState(0);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  // Fetch tasks from the database based on the logged user ID
  const fetchTasks = async () => {
    try {
      // Logged user ID
      const userId = await AsyncStorage.getItem('userId');

      // Format the selected date in the desired format
      const date = selectedDate.format('YYYY-MM-DD');

      // Make a request to your API to fetch tasks based on the user ID
      const response = await fetch(`https://my-task-buddy-nu.vercel.app/tasks?userId=${userId}&status=${filterStatus}&date=${date}`);
      const data = await response.json();
      // Sort the tasks by startTime in ascending order
      const sortedTasks = data.sort((a, b) => {
        const timeA = moment(a.startTime, 'HH:mm:ss');
        const timeB = moment(b.startTime, 'HH:mm:ss');
        const timeDiff = timeA.diff(timeB);

        // If startTime is the same, sort by activity alphabetically
        if (timeDiff === 0) {
          return a.activity.localeCompare(b.activity);
        }

        return timeDiff;
      });

      // Update the tasks state with the sorted data
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  useEffect(() => {
    // Fetch tasks when the component mounts or when the selected date changes
    fetchTasks();
  }, [selectedDate, filterStatus, tasks]);

  return (
    <View style={styles.container}>
      <Calendar onDateChange={handleDateChange} selectedDate={selectedDate}/>
      <FilterStatus setFilterStatus={setFilterStatus}/>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {tasks.map((task) => (
          <TaskCard
            key={task.id}
            taskId={task.id}
            startTime={task.startTime}
            endTime={task.endTime}
            activity={task.activity}
            progress={task.progress}
            location={task.location}
            priority={task.priority}
            onPress={() =>
              navigation.navigate('Task', {
                taskId: task.id,
                activityName: task.activity,
                date: selectedDate.format('YYYY-MM-DD'),
                startTime: task.startTime,
                endTime: task.endTime,
                location: task.location,
                parentId: task.parentId,
                userId: task.userId,
              })
            }
            help={task.help}
            date={selectedDate.format('YYYY-MM-DD')}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingHorizontal: width * 0.05,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    marginTop: height * 0.02,
  }
});

export default HomePage;
