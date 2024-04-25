import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, ToastAndroid } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

function AddProducts() {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pickedImage, setPickedImage] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    AsyncStorage.getItem('userId')
      .then((value) => {
        if (value) {
          setUserId(value);
        }
      })
      .catch((error) => console.error('Error reading userId:', error));
  }, []);

  const handleAddProduct = async () => {
    try {
      if (!userId) {
        throw new Error('사용자 ID가 없습니다. 다시 시도해주세요.');
      }
      if (!name || !description || !price || !pickedImage) {
        throw new Error('모든 필드를 입력해주세요.');
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);

      const fileType = pickedImage.split('.').pop();
      formData.append('image', {
        uri: pickedImage,
        type: `image/${fileType}`,
        name: `product-image.${fileType}`,
      });

      const response = await fetch('http://192.168.219.190:4000/addProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'user_id': userId,
        },
        body: formData,
      });

      if (response.ok) {
        setName('');
        setDescription('');
        setPrice('');
        setPickedImage(null);

        // 등록 완료 메시지 표시
        ToastAndroid.show('상품이 추가되었습니다.', ToastAndroid.SHORT);

        // 메인 화면으로 이동
        navigation.navigate('Main'); // 'Main'은 메인 화면의 내비게이션 이름
      } else {
        console.error('상품 추가 실패:', response.statusText);
      }
    } catch (error) {
      console.error('상품 추가 오류:', error);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.canceled === true) {
      return;
    }

    if (pickerResult.assets && pickerResult.assets.length > 0 && pickerResult.assets[0].uri) {
      setPickedImage(pickerResult.assets[0].uri);
    } else {
      console.error('Selected image URI is undefined');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.addProductsContainer}>
        <Text style={styles.heading}>상품 추가</Text>
        <TextInput
          style={styles.input}
          placeholder="상품명"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="설명"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="가격"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        {pickedImage && (
          <Image source={{ uri: pickedImage }} style={styles.image} />
        )}
        <Button title="이미지 업로드" onPress={pickImage} />
        <Button title="추가" onPress={handleAddProduct} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addProductsContainer: {
    width: '80%',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
});

export default AddProducts;