import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/main.css';

function AddProducts() {
  const userId = sessionStorage.getItem('userId');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null); // 이미지 추가
  const navigate = useNavigate(); 

  const handleAddProduct = async (event) => {
    event.preventDefault(); // 폼 제출의 기본 동작 방지

    // 상품 추가 요청
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('image', image); // 이미지 추가

      const response = await fetch('https://ec2caps.liroocapstone.shop:4000/addProduct', {
        method: 'POST',
        headers: {
          'user_id': userId,
        },
        body: formData, // 이미지를 포함한 FormData 전송
      });

      if (response.ok) {
        // 상품 추가 성공 시 폼 초기화
        setName('');
        setDescription('');
        setPrice('');
        setImage(null); // 이미지 초기화
        // 상품 추가 후 메인 페이지로 이동
        navigate('/Main/*');
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
    <div className="add-products-container">
      <h2>상품 추가</h2>
      <form onSubmit={handleAddProduct}>
        <div className="form-group">
          <label htmlFor="name">상품명:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">설명:</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="price">가격:</label>
          <input type="text" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="image">이미지:</label> {/* 이미지 추가 */}
          <input type="file" id="image" onChange={(e) => setImage(e.target.files[0])} required />
        </div>
        <button type="submit" className="add-product-button">추가</button>
      </form>
    </div>
  );
}

export default AddProducts;
