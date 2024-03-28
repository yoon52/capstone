import React, { useState } from 'react';
import '../../styles/myinfo.css';
import UserEdit from './UserEdit.jsx';
import logo from '../../image/logo.png';

function MyInfo() {
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);

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
        setIsPasswordConfirmed(true);
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('내 정보 확인 오류:', error);
      alert('내 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div><img src={logo} id='logo' alt="로고" />
      <h1 className="myinfo-header">내 정보</h1>
      <div className="myinfo-container">
        {!isPasswordConfirmed && (
          <>
            <h3 className="input-password">비밀번호를 입력해주세요</h3>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="myinfo-button" onClick={handleConfirm}>확인</button>
          </>
        )}
        {isPasswordConfirmed && userInfo && (
          <UserEdit userInfo={userInfo} />
        )}
      </div>
    </div>
  );
}

export default MyInfo;