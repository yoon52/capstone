import React, { useState, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import '../../styles/admin.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verificationResult, setVerificationResult] = useState('');
  const [isRejectionFormOpen, setIsRejectionFormOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [showApprovedUsers, setShowApprovedUsers] = useState(false);
  const [showOptionsForUser, setShowOptionsForUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchApprovedUsers();
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

  const fetchApprovedUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/users/approved');
      const approvedUserData = await response.json();
      setApprovedUsers(approvedUserData);
    } catch (error) {
      console.error('승인 완료된 사용자 목록을 가져오는 중에 오류가 발생했습니다:', error);
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
      setIsRejectionFormOpen(false);
      setRejectionReason('');
    } catch (error) {
      console.error('사용자 승인 상태 업데이트 오류:', error);
    }
  };

  const handleAdminModalOpen = (user) => {
    setSelectedUser(user);
  };

  const handleAdminModalClose = () => {
    setSelectedUser(null);
    setVerificationResult('');
    setIsRejectionFormOpen(false);
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

  const handleRejectButton = (userId) => {
    setIsRejectionFormOpen(true);
    setSelectedUser({ id: userId });
    setVerificationResult('');
  };

  const handleRejectionReasonChange = (event) => {
    setRejectionReason(event.target.value);
  };

  const handleRejectFormSubmit = (event) => {
    event.preventDefault();
    if (!selectedUser) return;
    handleUpdateApproval(selectedUser.id, 'rejected');
    setSelectedUser(null);
    setIsRejectionFormOpen(false);
    setRejectionReason('');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleApprovedUsersClick = () => {
    setShowApprovedUsers(!showApprovedUsers);
  };
  const handleToggleOptions = (userId) => {
    setShowOptionsForUser((prevUserId) => (prevUserId === userId ? null : userId));
  };


  const handleDeleteUser = (userId) => {
    const result = window.confirm('정말 삭제하시겠습니까?');
    if (result) {
      deleteUser(userId);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/deletefromadmin/${userId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchUsers(); // Update user list after deletion
      } else {
        console.error('사용자 삭제 중 오류 발생');
      }
    } catch (error) {
      console.error('사용자 삭제 중 오류 발생:', error);
    }
  };

  return (
    <div className="admin-container">
      <h1>회원 정보 관리</h1>
      <button className="sidebar-toggle-button" onClick={toggleSidebar}>
        <MenuIcon style={{ fontSize: 30 }} />
      </button>

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
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {(showApprovedUsers ? approvedUsers : users).map((user) => (
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
              <td>
                <div className="more-button-container">
                  <button className="more-button" onClick={() => handleToggleOptions(user.id)}>
                    <MoreHorizIcon />
                  </button>
                  {showOptionsForUser === user.id && (
                    <div className="options-container">

                      <button onClick={() => handleDeleteUser(user.id)}>사용자 정보 삭제</button>
                    </div>
                  )}
                </div>

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
            <button onClick={() => handleRejectButton(selectedUser.id)}>반려</button>
            <button onClick={handleAdminModalClose}>닫기</button>

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
        </div>
      )}

      {isSidebarOpen && (
        <div className="admin-sidebar">
          <button onClick={handleApprovedUsersClick}>승인 완료된 사용자 보기</button>
          {/* <button onClick={handlereportedUsersClick}>신고내역</button> */}
        </div>
      )}
    </div>
  );
}

export default AdminPage;