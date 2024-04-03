import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/Login';
import Main from './components/Main';
import Signup from './components/Signup';
import FindId from './components/FindId';
import FindPw from './components/FindPw';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="FindId" component={FindId} />
        <Stack.Screen name="FindPw" component={FindPw} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
