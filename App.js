import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import Login from './screens/Login';
import Registration from './screens/Registration';
import HomePage from './screens/HomePage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EditProfile from './screens/EditProfile';
import { Ionicons } from '@expo/vector-icons';
import Task from './screens/Task';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function getTabBarIcon(iconName) {
  return ({ focused, color, size }) => (
    <Ionicons
      name={iconName}
      size={size}
      color={focused ? color : 'gray'}
    />
  );
}

function Home() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Planer') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return getTabBarIcon(iconName)({ focused, color, size });
        },
        headerShown: false,
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 13
        }
      })}
    >
      <Tab.Screen name="Planer" component={HomePage} />
      <Tab.Screen name="Profil" component={EditProfile} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
     <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="HomePage" component={Home} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Task" component={Task} />
      </Stack.Navigator>
    </NavigationContainer> 
  );
}