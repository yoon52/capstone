//IdFind.jsx
import React, { useState } from 'react';
import '../../styles/main.css';

function IdFind() {
  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    department: '',
    grade: ''
  });
  // 아이디 상태 관리
  const [id, setId] = useState('');
  // 결과 메시지 상태 관리
  const [message, setMessage] = useState('');

  const [showModal, setShowModal] = useState(false); // 모달 상태


  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // 아이디 찾기 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 입력값을 서버로 전송하여 아이디 찾기 요청
      const response = await fetch('http://localhost:4000/find-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // 응답을 확인하고 결과 메시지 및 아이디 업데이트
      if (response.ok) {
        const data = await response.json();
        setId(data.id);
        setMessage(`아이디는 ${data.id} 입니다.`);
        setShowModal(true); // 모달 열기

      } else {
        setMessage('아이디를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('아이디 찾기 오류:', error);
      setMessage('아이디 찾기 중 오류가 발생했습니다.');
    }
  };

  const closeModal = () => {
    setShowModal(false); // 모달 닫기
  };


  return (
    <div>
      <h2>아이디 찾기</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">이메일:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="department">학과:</label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="grade">학년:</label>
          <input
            type="text"
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">아이디 찾기</button>
      </form>
      {/* 모달 */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <p>찾은 아이디: {id}</p>
            <p>{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default IdFind;
