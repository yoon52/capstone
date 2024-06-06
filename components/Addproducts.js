import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import serverHost from './host';
import Icon from 'react-native-vector-icons/Entypo';

function AddProducts() {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pickedImage, setPickedImage] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
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

  useFocusEffect(
    useCallback(() => {
      // 컴포넌트가 화면에 포커스를 받을 때마다 상태를 초기화
      setName('');
      setDescription('');
      setPrice('');
      setPickedImage(null);

      return () => {
        // 컴포넌트가 화면에서 벗어날 때 실행할 코드
        // console.log('Component lost focus');
      };
    }, [])
  );

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

      const response = await fetch(`${serverHost}:4000/addProduct`, {
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

        Alert.alert("상품이 추가되었습니다.");
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
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
      alert("사진 접근 권한이 필요합니다!");
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
      <View style={styles.formContainer}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {pickedImage ? (
            <Image source={{ uri: pickedImage }} style={styles.image} />
          ) : (
            <Icon name="camera" size={40} color="gray" />
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="상품명"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="상품 가격"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.textarea}
          placeholder="상품 상세 설명"
          value={description}
          onChangeText={setDescription}
          multiline={true}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>상품 등록</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingRight: 20,
    paddingLeft: 20,
    backgroundColor: 'white',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 5,
  },
  imagePicker: {
    backgroundColor: 'white',
    width: 150,
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  input: {
    backgroundColor: 'white',
    color: '#000000',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  textarea: {
    backgroundColor: 'white',
    color: '#000000',
    padding: 10,
    borderRadius: 5,
    height: 300,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  button: {
    backgroundColor: '#103260', // 버튼의 배경색
    borderRadius: 5, // 버튼의 모서리 반경
    paddingVertical: 10, // 버튼의 수직 패딩
    paddingHorizontal: 20, // 버튼의 수평 패딩
  },
  buttonText: {
    color: '#fff', // 버튼 텍스트의 색상
    fontSize: 16, // 버튼 텍스트의 크기
    fontWeight: 'bold', // 버튼 텍스트의 굵기
    textAlign: 'center', // 텍스트를 가운데 정렬
  },

});

export default AddProducts;