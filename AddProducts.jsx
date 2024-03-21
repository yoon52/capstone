// AddProducts.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import logo from '../../image/logo.png';

function AddProducts() {
  const userId = sessionStorage.getItem('userId');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const navigate = useNavigate();

  const handleAddProduct = async (event) => {
    event.preventDefault(); // 폼 제출의 기본 동작 방지

    // 상품 추가 요청
    try {
      const response = await fetch('http://localhost:4000/AddProduct', {
        method: 'POST',
        headers: {
          'user_id': sessionStorage.getItem('userId'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, name, description, price }),
      });

      if (response.ok) {
        // 상품 추가 성공 시 폼 초기화
        setName('');
        setDescription('');
        setPrice('');
        // 상품 추가 후 메인 페이지로 이동
        navigate('/Main');
        console.log('상품이 추가되었습니다.');
      } else {
        // 상품 추가 실패 시 오류 메시지 출력
        console.error('상품 추가 실패:', response.statusText);
      }
    } catch (error) {
      // 네트워크 오류 등의 문제 발생 시 오류 메시지 출력
      console.error('상품 추가 오류:', error);
    }
  };

  return (
    <div><img src={logo} id='logo' alt="로고" />
      <div className="add-products-container">
        <h2>상품 추가</h2>
        <form onSubmit={handleAddProduct}>
          <div className="form-group">
            <input type="text" placeholder="상품명" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="text" placeholder="설명" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="text" placeholder="가격" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <button type="submit" className="add-product-button">추가</button>
        </form>
      </div>
    </div>
  );
}

export default AddProducts;