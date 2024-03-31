// 클라이언트
import React, { useState } from 'react';
import '../../styles/changepw.css';

function ChangePw({ email, tempPassword }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(true);

  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('새 암호와 암호 재입력이 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/changepassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      setMessage('비밀번호를 변경하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h1>비밀번호 재설정</h1>
        <label>현재 비밀번호:</label>
        <input type="password" value={currentPassword} onChange={handleCurrentPasswordChange} />
        <label>새 암호:</label>
        <input type="password" value={newPassword} onChange={handleNewPasswordChange} />
        <label>새 암호 재입력:</label>
        <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
        <p className="message">{message}</p>
        <div className="button-container">
          <button onClick={handleCloseModal}>닫기</button>
          <button onClick={handleSubmit}>확인</button>
        </div>
      </div>
    </div>
  );
}

export default ChangePw;
