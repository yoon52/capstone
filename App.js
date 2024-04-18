import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/Login';
import Main from './components/Main';
import AddProducts from './components/Addproducts';
import ChatModal from './components/Chatmodalscreen';
import ChatList from './components/ChatList';
import ProductManagement from './components/ProductManagement';
import ProductDetail from './components/ProductDetail';
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
        <Stack.Screen name="Addproducs" component={AddProducts} />
        <Stack.Screen name="ChatList" component={ChatList} />
        <Stack.Screen name="ChatModal" component={ChatModal} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="ProductManagement" component={ProductManagement} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="FindId" component={FindId} />
        <Stack.Screen name="FindPw" component={FindPw} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}