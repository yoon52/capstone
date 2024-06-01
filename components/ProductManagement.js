import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import serverHost from './host';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // 수정 상태 여부 추가
  const navigation = useNavigation();

  const fetchProducts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${serverHost}:4000/productsmanage`, {
        headers: {
          'user_id': userId
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('상품 목록 가져오기 오류:', response.status);
      }
    } catch (error) {
      console.error('상품 목록 가져오기 오류:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${serverHost}:4000/productsmanage/${productId}`, {
        method: 'DELETE',
        headers: {
          'user_id': userId
        }
      });

      if (response.ok) {
        setProducts(products.filter(product => product.id !== productId));
      } else {
        console.error('상품 삭제 오류:', response.status);
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
    setIsEditing(true); // 수정 상태로 변경
  };

  const handleSaveEdit = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${serverHost}:4000/productsmanage/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user_id': userId
        },
        body: JSON.stringify(editingProduct)
      });

      console.log("Request to server:", JSON.stringify(editingProduct));

      if (response.ok) {
        fetchProducts(); // 수정 후에 상품 목록 다시 불러오기
        setEditingProduct(null);
        setIsEditing(false); // 수정 상태 해제
      } else {
        console.error('상품 수정 실패:', response.status);
      }
    } catch (error) {
      console.error('상품 수정 실패:', error);
    }
  };

  const handleSellProduct = async (productId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${serverHost}:4000/productsmanage/sold/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user_id': userId
        }
      });

      console.log("Request to server:", { productId });

      if (response.ok) {
        fetchProducts(); // 판매 완료 후에 상품 목록 다시 불러오기
        Alert.alert('상품이 판매되었습니다.');
      } else {
        console.error('상품 판매완료 처리 실패:', response.status);
      }
    } catch (error) {
      console.error('상품 판매완료 처리 실패:', error);
    }
  };

  const handleConfirmEdit = () => {
    handleSaveEdit(); // 저장 버튼과 동일한 기능
  };

  const handleCancelEdit = () => {
    setEditingProduct(null); // 취소 버튼을 누르면 편집 상태를 초기화
    setIsEditing(false); // 취소 버튼을 누르면 수정 상태 해제
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>상품 관리</Text>
      <ScrollView style={styles.productContainer}>
        {products.map(product => (
          <View key={product.id} style={styles.productItem}>
            <Text style={styles.productName}>{product.name}</Text>
            {!isEditing && ( // 수정 중이 아닐 때만 수정 버튼 표시
              <TouchableOpacity style={styles.button} onPress={() => handleEditProduct(product)}>
                <Text style={styles.buttonText}>수정</Text>
              </TouchableOpacity>
            )}
            {!isEditing && product.status !== '판매완료' && ( // 수정 중이 아닐 때만 판매완료 버튼 표시
              <TouchableOpacity style={styles.button} onPress={() => handleSellProduct(product.id)}>
                <Text style={styles.buttonText}>판매완료</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {editingProduct && (
        <View style={styles.editContainer}>
          <TextInput
            placeholder="상품명"
            value={editingProduct.name}
            onChangeText={name => setEditingProduct(prevState => ({ ...prevState, name }))}
            style={styles.input}
          />
          <TextInput
            placeholder="설명"
            value={editingProduct.description}
            onChangeText={description => setEditingProduct(prevState => ({ ...prevState, description }))}
            style={styles.input}
          />
          <TextInput
            placeholder="가격"
            value={editingProduct.price}
            onChangeText={price => setEditingProduct(prevState => ({ ...prevState, price }))}
            keyboardType="numeric"
            style={styles.input}
          />
          {isEditing && ( // 수정 중일 때만 확인, 취소, 삭제 버튼 표시
            <>
              <TouchableOpacity style={styles.button} onPress={handleConfirmEdit}>
                <Text style={styles.buttonText}>확인</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleCancelEdit}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => handleDeleteProduct(editingProduct.id)}>
                <Text style={styles.buttonText}>삭제</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 80
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productContainer: {
    width: '100%',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'lightblue',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,

  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editContainer: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  saveButton: {
    backgroundColor: 'lightblue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default ProductManagement;