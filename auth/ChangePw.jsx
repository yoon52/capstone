import React, { useState } from 'react';
import '../../styles/myinfo.css';
import logo from '../../image/logo.png';

function ChangePw() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert('모든 필드를 입력해주세요.');
        return;
      }

      if (newPassword !== confirmNewPassword) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
      }

      // sessionStorage에서 사용자 아이디 가져오기
      const userId = sessionStorage.getItem('userId');

      // 사용자 아이디를 포함하여 비밀번호 변경 API 호출
      const response = await fetch('http://localhost:4000/changepassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, currentPassword, newPassword })
      });

      if (response.ok) {
        alert('비밀번호가 변경되었습니다.');
        window.location.href = '/login';
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <a href="/Main">
        <img src={logo} id='logo' alt="로고" />
      </a>
      <h1 className="changepw-header">비밀번호 변경</h1>
      <div className="changepw-container">
        <div className="form-group">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새로운 비밀번호"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="새로운 비밀번호 확인"
          />
        </div>
        <button className="changepw" onClick={handleChangePassword}>비밀번호 변경</button>
      </div>
    </div >
  );
}

export default ChangePw;