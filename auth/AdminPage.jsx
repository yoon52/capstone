import React, { useState, useEffect } from 'react';
import '../../styles/admin.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verificationResult, setVerificationResult] = useState('');
  const [isRejectionFormOpen, setIsRejectionFormOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/users');
      const userData = await response.json();
      setUsers(userData);
    } catch (error) {
      console.error('사용자 목록을 가져오는 중에 오류가 발생했습니다:', error);
    }
  };

  const handleUpdateApproval = async (userId, newStatus) => {
    try {
      let bodyData = { approvalStatus: newStatus };
      if (newStatus === 'rejected') {
        bodyData = { ...bodyData, rejectionReason };
      }

      const response = await fetch(`http://localhost:4000/users/${userId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      const responseData = await response.json();
      fetchUsers();
    } catch (error) {
      console.error('사용자 승인 상태 업데이트 오류:', error);
    }
  };

  const handleAdminModalOpen = (user) => {
    setSelectedUser(user);
  };

  const handleAdminModalClose = () => {
    setSelectedUser(null);
    setVerificationResult(''); // 모달이 닫힐 때 유사도 정보 초기화
  };

  const sendImageForOCR = async (userId, imageUrl) => {
    try {
      const response = await fetch('http://localhost:4000/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, imageUrl })
      });
      const result = await response.json();

      if (result && result.similarity !== undefined) {
        setVerificationResult(`유사도: ${result.similarity.toFixed(2)}%`);
      } else {
        setVerificationResult('유사도 검증 결과가 없습니다.');
      }
    } catch (error) {
      console.error('이미지 OCR 및 유사도 검증 오류:', error);
    }
  };

  const handleDetailModalOpen = async (userId, imageUrl) => {
    await sendImageForOCR(userId, imageUrl);
  };

  const handleDetailModalClose = () => {
    setVerificationResult('');
  };

  const handleRejectButton = () => {
    setIsRejectionFormOpen(true);
  };

  const handleRejectionReasonChange = (event) => {
    setRejectionReason(event.target.value);
  };

  const handleRejectFormSubmit = (event) => {
    event.preventDefault();
    handleUpdateApproval(selectedUser.id, 'rejected');
    setIsRejectionFormOpen(false);
    setRejectionReason('');
  };
  return (
    <div className="admin-container">
      <h1>회원 정보 관리</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>이메일</th>
            <th>부서</th>
            <th>학년</th>
            <th>승인 상태</th>
            <th>학생증</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.department}</td>
              <td>{user.grade}</td>
              <td>{user.admin === 'pending' ? '대기 중' : user.admin === 'approved' ? '승인됨' : '거절됨'}</td>
              <td>
                <button onClick={() => handleAdminModalOpen(user)}>보기</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && (
  <div className="admin-modal">
    <div className="modal-content">
      <img src={`http://localhost:4000/uploads_id/${selectedUser.id}.jpg`} alt="학생증 이미지" />
      {verificationResult && <p>{verificationResult}</p>}
      <button onClick={() => handleDetailModalOpen(selectedUser.id, `http://localhost:4000/uploads_id/${selectedUser.id}.jpg`)}>
        상세 정보 보기
      </button>
      <button onClick={() => handleUpdateApproval(selectedUser.id, 'approved')}>승인</button>
      <button onClick={handleRejectButton}>반려</button>
      <button onClick={handleAdminModalClose}>닫기</button>
    </div>
  </div>
)}

      
      {isRejectionFormOpen && (
        <form onSubmit={handleRejectFormSubmit}>
          <label>
            반려 사유:
            <textarea value={rejectionReason} onChange={handleRejectionReasonChange} />
          </label>
          <button type="submit">반려</button>
        </form>
      )}
    </div>
  );
  
}

export default AdminPage;