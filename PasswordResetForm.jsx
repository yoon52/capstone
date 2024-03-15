import React, { useState } from 'react';
import '../../styles/main.css';

function PasswordResetForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false); // 모달 표시 여부를 나타내는 상태 변수

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
        setShowModal(true); // 비밀번호가 성공적으로 재설정되면 모달을 표시합니다.
      } else {
        setMessage('비밀번호 재설정에 실패했습니다.');
        setShowModal(true); // 비밀번호 재설정 실패 시에도 모달을 표시합니다.
      }
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      setMessage('서버 오류로 인해 비밀번호를 재설정할 수 없습니다.');
      setShowModal(true); // 서버 오류 발생 시에도 모달을 표시합니다.
    }
  };

  const closeModal = () => {
    setShowModal(false); // 모달을 닫는 함수
  };

    // 로그인 화면으로 이동하는 함수
    const navigateToLogin = () => {
    // 로그인 화면으로의 이동 로직을 여기에 작성합니다.
        window.location.href = '/login';
      };
    

  return (
    <div>
      <h2>비밀번호 재설정</h2>
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="이메일"
        required
      />
      <button onClick={handleResetPassword}>비밀번호 재설정</button>
      {/* 모달을 표시하는 조건에 따라 JSX 변경 */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <p>{message}</p>
        {/* 로그인 화면으로 이동하는 버튼 */}
            <button onClick={navigateToLogin}>로그인 화면으로 이동</button>

          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordResetForm;
