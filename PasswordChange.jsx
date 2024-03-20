import React, { useState } from 'react';

function ChangePassword() {
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
        // 로그인 페이지로 이동
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
      <h2>비밀번호 변경</h2>
      <p>현재 비밀번호: <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></p>
      <p>새 비밀번호: <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></p>
      <p>새 비밀번호 확인: <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} /></p>
      <button onClick={handleChangePassword}>비밀번호 변경</button>
    </div>
  );
}

export default ChangePassword;
