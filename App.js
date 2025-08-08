import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './screens/HomeScreen';
import CheckInScreen from './screens/CheckInScreen';
import StatusScreen from './screens/StatusScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'SafeCheck',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CheckIn" 
          component={CheckInScreen}
          options={{
            title: 'Safety Check-In',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen 
          name="Status" 
          component={StatusScreen}
          options={{
            title: 'Check-In Status',
            headerBackTitle: 'Back',
            headerLeft: null,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
