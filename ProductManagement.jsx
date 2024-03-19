// ProductManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://ec2caps.liroocapstone.shop:4000/productsmanage?userId=${userId}', {
        headers: {
          'user_id': sessionStorage.getItem('userId')
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
      const response = await fetch(`https://ec2caps.liroocapstone.shop:4000/productsmanage/${productId}`, {
        method: 'DELETE',
        headers: {
          'user_id': sessionStorage.getItem('userId')
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

  const handleMarkAsSold = async (productId) => {
    try {
      const response = await fetch(`https://ec2caps.liroocapstone.shop:4000/productsmanage/sold/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user_id': sessionStorage.getItem('userId')
        }
      });
      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(product =>
          product.id === productId ? updatedProduct : product
        ));
      } else {
        console.error('상품 판매 완료 처리 오류:', response.status);
      }
    } catch (error) {
      console.error('상품 판매 완료 처리 오류:', error);
    }
  };

  const navigateToProductDetail = (productId) => {
    navigate(`/productDetail/${productId}`);
  };

  return (
    <div className="product-management-container">
      <h2>상품 관리</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <span onClick={() => navigateToProductDetail(product.id)} style={{ cursor: 'pointer' }}>
              {product.name}
            </span>
            <button onClick={() => handleDeleteProduct(product.id)}>삭제</button>
            <button onClick={() => handleMarkAsSold(product.id)}>판매완료</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductManagement;