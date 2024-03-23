import React, { useState } from 'react';
import '../../styles/main.css';

function ChangePw({ email, tempPassword }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(true);

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
    if (newPassword !== confirmPassword) {
      setMessage('새 암호와 암호 재입력이 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('https://ec2caps.liroocapstone.shop:4000/-ChangePw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, tempPassword, newPassword })
      });

      if (response.ok) {
        setMessage('비밀번호가 성공적으로 변경되었습니다.');
      } else {
        setMessage('비밀번호를 변경할 수 없습니다.');
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
        <label>임시 비밀번호:</label>
        <input type="password" value={tempPassword} readOnly />
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