import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function UserEdit({ userInfo }) {
  const [editedUserInfo, setEditedUserInfo] = useState({ ...userInfo });
  const [password, setPassword] = useState('');
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
        alert(data.message); // 수정이 완료되었습니다. 메시지 표시
        navigate('/'); // Main 페이지로 이동
      } else {
        console.error('사용자 정보 수정 실패');
      }
    } catch (error) {
      console.error('사용자 정보 수정 오류:', error);
    }
  };
  const handleDeleteAccount = async () => {
    setIsModalOpen(true);
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
        navigate('/Login'); // main.jsx로 이동
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
      <p className="user-id">ID : {userInfo.id}</p>
      <div className="form-group">
        <input type="text"
          value={editedUserInfo.name}
          placeholder="이름"
          onChange={(e) => handleChange('name', e.target.value)} />
      </div>
      <div className="form-group">
        <input type="text"
          value={editedUserInfo.email}
          placeholder="이메일"
          onChange={(e) => handleChange('email', e.target.value)} />
      </div>
      <div className="select-group">
        <select
          name="department"
          value={editedUserInfo.department}
          onChange={(e) => handleChange('department', e.target.value)}
          style={{ color: editedUserInfo.department ? 'black' : 'gray' }}
          required
        >
          <option value="">학과를 선택하세요</option>
          <option value="computer_science">컴퓨터 공학과</option>
          <option value="software_engineering">소프트웨어 공학과</option>
          <option value="design">디자인학과</option>
          <option value="business-administration">경영학과</option>
        </select>

        <select
          name="grade"
          value={editedUserInfo.grade}
          onChange={(e) => handleChange('grade', e.target.value)}
          style={{ color: editedUserInfo.grade ? 'black' : 'gray' }}
          required
        >
          <option value="">학년을 선택하세요</option>
          <option value="1">1학년</option>
          <option value="2">2학년</option>
          <option value="3">3학년</option>
          <option value="4">4학년</option>
        </select>
      </div>

      <div>
        <button className="save-button" onClick={handleSave}> 저장</button>
      </div>
      <div className="right-align-buttons">
        <button className="changepw-button" onClick={handleChangePassword}>비밀번호 변경</button>
      </div>
      <div className="right-align-buttons">
        <button className="withdrawal" onClick={handleDeleteAccount}>회원 탈퇴</button>
      </div>


      {/* 모달 */}
      <Modal className="withdrawl-modal" isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <h2 className="withdrawl-title"> 회원 탈퇴</h2>
        <h3>회원 탈퇴와 함께 K'du-re 에 등록된 모든 개인정보는</h3>
        <h3>삭제, 폐기 처리되며 복구되지 않습니다.</h3>
        <div className="form-group">
          <input type="password"
            className='withdrawl-form'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="회원탈퇴를 원하시면 비밀번호를 입력해주시길 바랍니다."
          />

        </div>
        <button className="confirm" onClick={confirmDeleteAccount}>확인</button>
        <button className="cancel" onClick={() => setIsModalOpen(false)}>취소</button>
      </Modal>
    </div>
  );
}

export default UserEdit;