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

import MyInfo from './components/MyInfo';
import Setting from './components/Setting';
import WishList from './components/WishList';
import Payments from './components/Payments';
import SearchPage from './components/SearchPage';
import SearchResults from './components/SearchResults';

import KakaoLoginWebView from './components/KakaoLoginWebView';
import NaverLoginWebView from './components/NaverLoginWebView';
import Sanbox from './components/CheckoutPage';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        <Stack.Screen name="Login" component={Login}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Main" component={Main}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="AddProducts" component={AddProducts}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="ChatList" component={ChatList}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="ChatModal" component={ChatModal}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="ProductDetail" component={ProductDetail}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="ProductManagement" component={ProductManagement}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="Signup" component={Signup}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="FindId" component={FindId}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="FindPw" component={FindPw}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="MyInfo" component={MyInfo}
          options={{
            headerShown: false,
          }} />

        <Stack.Screen name="Setting" component={Setting}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="WishList" component={WishList}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="SearchPage" component={SearchPage}
          options={{
            headerShown: false,
          }} />

        <Stack.Screen name="SearchResults" component={SearchResults}
          options={{
            headerShown: false,
          }} />

        <Stack.Screen name="Payments" component={Payments}
          options={{
            headerShown: false,
          }} />

        <Stack.Screen name="KakaoLoginWebView" component={KakaoLoginWebView}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="NaverLoginWebView" component={NaverLoginWebView}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name="Sandbox" component={Sanbox}
          options={{
            headerShown: false,
          }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}