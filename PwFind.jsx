import React, { useState } from 'react';
import '../../styles/main.css';
import logo from '../../image/logo.png';

function PwFind() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch('http://localhost:4000/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      } else {
        setMessage('가입하지 않은 이메일입니다.');
      }
    } catch (error) {
      console.error('비밀번호 찾기 오류:', error);
      setMessage('서버 오류로 인해 비밀번호를 찾을 수 없습니다.');
    } finally {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const navigateToLogin = () => {
    window.location.href = '/Login';
  };

  return (
    <div className="pwfind-container">
      <img src={logo} id='pwfind-logo' alt="로고" />
      <h1 className="pwfind-header">비밀번호 찾기</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="이메일"
          required
        />
        <button type="submit" className="pwfind">비밀번호 찾기</button>
      </form>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p className="found-pw">{message}</p>
            <div className="pwfind-modal">
              {message === '가입하지 않은 이메일입니다.' ? (
                <button className="modal-close" onClick={closeModal}>닫기</button>
              ) : (
                <button className="found-id" onClick={navigateToLogin}>로그인 화면으로 이동</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PwFind;