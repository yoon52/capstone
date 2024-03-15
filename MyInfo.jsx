import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MyInfo() {
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
        setShowModal(true);
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('내 정보 확인 오류:', error);
      alert('내 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      const confirm = window.confirm('회원을 탈퇴하시겠습니까?');
      if (!confirm) return;
      setConfirmDelete(true);
    } else {
      try {
        const response = await fetch('http://localhost:4000/deleteaccount', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: sessionStorage.getItem('userId'), password })
        });
        if (response.ok) {
          alert('회원 탈퇴되었습니다.');
          sessionStorage.removeItem('userId');
          navigate('/');
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
      } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        alert('회원 탈퇴 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>내 정보 확인</h1>
      <label>비밀번호: </label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleConfirm}>확인</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>내 정보</h2>
            <p>ID: {userInfo.id}</p>
            <p>이름: {userInfo.name}</p>
            <p>학년: {userInfo.grade}</p>
            <p>학과: {userInfo.department}</p>
            <p>이메일: {userInfo.email}</p>
            <button onClick={() => setShowModal(false)}>닫기</button>
            <button onClick={handleDeleteAccount}>
              {confirmDelete ? '확인' : '회원 탈퇴'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyInfo;
