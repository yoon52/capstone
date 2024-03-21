// MyInfo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserEdit from './UserEdit.jsx'; // UserEdit 컴포넌트를 불러옴

function MyInfo() {
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false); // 비밀번호 확인 상태 추가
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      const response = await fetch('http://localhost:4000/myinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: sessionStorage.getItem('userId'), password })
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setIsPasswordConfirmed(true); // 비밀번호 확인되면 상태 변경
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('내 정보 확인 오류:', error);
      alert('내 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  const handleChangePassword = () => {
    // 비밀번호 변경 페이지로 이동
    navigate('/change-password');
  };

  return (
    <div>
      <h1>내 정보</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/main')}>홈페이지</button>
        <button onClick={handleChangePassword}>비밀번호 변경</button>
      </div>
      {!isPasswordConfirmed && (
        <>
          <h5>고객님의 개인정보 보호를 위해 본인확인을 진행합니다.</h5>
          <h5>비밀번호를 입력해주세요: </h5>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleConfirm}>확인</button>
        </>
      )}
      {isPasswordConfirmed && userInfo && (
        <UserEdit userInfo={userInfo} />
      )}
    </div>
  );
}

export default MyInfo;