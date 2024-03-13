// ProductManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:4000/productsmanage?userId=${userId}', {
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
      const response = await fetch(`http://localhost:4000/productsmanage/${productId}`, {
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

  const navigateToProductDetail = (productId) => {
    navigate(`/productDetail/${productId}`);
  };

  return (
    <div className="product-management-container">
      <h2>상 품 관 리</h2>
      <ul className="management-list">
        {products.map(product => (
          <li key={product.id} className="management-item">
            <span className="management-text">{() => navigateToProductDetail(product.id)}{product.name}</span>
            <button className="delete-button" onClick={() => handleDeleteProduct(product.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductManagement;
