
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/product.css';
import logo from '../../image/logo.png';

function AddProducts() {
  const userId = sessionStorage.getItem('userId');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null); // 이미지 파일 상태 추가
  const navigate = useNavigate();


  
  
  const handleAddProduct = async (event) => {
    event.preventDefault(); // 폼 제출의 기본 동작 방지

    // 상품 추가 요청
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('image', image); // 이미지 파일 추가

      const response = await fetch('https://ec2caps.liroocapstone.shop:4000/addProduct', {
        method: 'POST',
        headers: {
          'user_id': userId,
        },
        body: formData,
      });

      

      if (response.ok) {
        // 상품 추가 성공 시 폼 초기화
        setName('');
        setDescription('');
        setPrice('');
        setImage(null); // 이미지 파일 초기화
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
    <div>
      <a href="/Main">
        <img src={logo} id='logo' alt="로고" />
      </a>
      <h1 className="add-products-header">상품 추가</h1>
      <div className="add-products-container">
        <form onSubmit={handleAddProduct}>
          <div className="form-group">
            <input type="text" placeholder="상품명" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="text" placeholder="설명" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="form-group">
            <input 
            type="text" 
            placeholder="가격" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            required />
          </div>
          <div className="form-group">
            <input type="file" onChange={(e) => setImage(e.target.files[0])} required /> {/* 이미지 파일 업로드 입력 필드 */}
          </div>
          <button type="submit" className="add-product-button">추가</button>
        </form>
      </div>
    </div>
  );
}

export default AddProducts;
