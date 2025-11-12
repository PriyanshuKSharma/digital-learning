import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import VirtualClassListScreen from '../screens/VirtualClassListScreen';
import VirtualClassRoomScreen from '../screens/VirtualClassRoomScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const VirtualClassStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="VirtualClassList" 
        component={VirtualClassListScreen}
        options={{ title: 'Virtual Classes' }}
      />
      <Stack.Screen 
        name="VirtualClassRoom" 
        component={VirtualClassRoomScreen}
        options={{ title: 'Live Class', headerShown: false }}
      />
      <Stack.Screen 
        name="Attendance" 
        component={AttendanceScreen}
        options={{ title: 'Attendance' }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'VirtualClass') {
            iconName = 'video-call';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#137fec',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="VirtualClass" 
        component={VirtualClassStack}
        options={{ title: user?.role === 'teacher' ? 'My Classes' : 'Classes' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;