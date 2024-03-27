import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function UserEdit({ userInfo }) {
  const [editedUserInfo, setEditedUserInfo] = useState({ ...userInfo });
  const [password, setPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setEditedUserInfo({ ...editedUserInfo, [field]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:4000/edituserinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userInfo.id, editedUserInfo })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        alert('회원정보 수정이 완료됐습니다.');
        navigate('/main');
      } else {
        console.error('사용자 정보 수정 실패');
      }
    } catch (error) {
      console.error('사용자 정보 수정 오류:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setIsModalOpen(true);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      const response = await fetch('http://localhost:4000/deleteaccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userInfo.id, password })
      });

      if (response.ok) {
        alert('회원 탈퇴되었습니다.');
        sessionStorage.removeItem('userId');
        navigate('/');
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
  };

  const handleChangePassword = () => {
    navigate('/ChangePw');
  };

  return (
    <div>
      <h2>회원 정보 수정</h2>
      <p>ID: {userInfo.id}</p>
      <p>
        이름: <input type="text" value={editedUserInfo.name} onChange={(e) => handleChange('name', e.target.value)} />
      </p>
      <p>
        학년: <input type="text" value={editedUserInfo.grade} onChange={(e) => handleChange('grade', e.target.value)} />
      </p>
      <p>
        학과: <input type="text" value={editedUserInfo.department} onChange={(e) => handleChange('department', e.target.value)} />
      </p>
      <p>
        이메일: <input type="text" value={editedUserInfo.email} onChange={(e) => handleChange('email', e.target.value)} />
      </p>
      <button onClick={handleDeleteAccount}>회원 탈퇴</button>
      <button onClick={handleSave}>저장</button>
      <button onClick={handleChangePassword}>비밀번호 변경</button>

      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <h2>비밀번호 입력</h2>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={confirmDeleteAccount}>확인</button>
        <button onClick={() => setIsModalOpen(false)}>취소</button>
      </Modal>
    </div>
  );
}

export default UserEdit;