import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AddProducts() {
  const [userId, setUserId] = useState(null); // userId 상태 추가
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pickedImage, setPickedImage] = useState(null); // 선택된 이미지 저장 상태 추가

  useEffect(() => {
    // AsyncStorage에서 userId 검색
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


      // 이미지 정보를 FormData에 추가
      formData.append('image', {
        uri: pickedImage,
        type: `image/${fileType}`,
        name: `product-image.${fileType}`,
        
      });
      console.log('FormData:', formData); // 추가: FormData 출력

      const response = await fetch('http://172.30.1.96:4000/addProduct', {
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

        
        console.log('상품이 추가되었습니다.');
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
    console.log('Picker Result:', pickerResult); // 콘솔 로그 추가
    if (pickerResult.cancelled === true) {
      return;
    }
  
    // 이미지 URI가 유효한지 확인
    if (pickerResult.assets && pickerResult.assets.length > 0 && pickerResult.assets[0].uri) {
      setPickedImage(pickerResult.assets[0].uri); // 선택된 이미지 저장
      console.log('Selected image:', pickerResult.assets[0].uri);
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
      
        {/* 선택된 이미지 미리보기 */}

  
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
