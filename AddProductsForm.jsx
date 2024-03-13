import React, { useState } from 'react';
import '../../styles/main.css';

function AddProductsForm({ handleAddProduct }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null); // 이미지 추가

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // FormData 객체 생성
    const formData = new FormData();
    formData.append('name', name); // 상품명 추가
    formData.append('description', description); // 설명 추가
    formData.append('price', price); // 가격 추가
    formData.append('image', image); // 이미지 추가

    try {
      const response = await fetch('https://ec2caps.liroocapstone.shop:4000/addProduct', {
        method: 'POST',
        body: formData // FormData 객체를 요청의 본문으로 설정
      });

      if (response.ok) {
        console.log('상품이 성공적으로 추가되었습니다.');
        // 상품 추가 성공 시 부모 컴포넌트로부터 받은 핸들러 함수 호출
        handleAddProduct();
        // 입력 값 초기화
        setName('');
        setDescription('');
        setPrice('');
        setImage(null);
      } else {
        console.error('상품 추가 오류:', response.status);
      }
    } catch (error) {
      console.error('상품 추가 오류:', error);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>상품명:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>설명:</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="form-group">
        <label>가격:</label>
        <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="form-group">
        <label>이미지:</label> {/* 이미지 추가 */}
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      </div>
      <button type="submit">추가</button>
    </form>
  );
}

export default AddProductsForm;
