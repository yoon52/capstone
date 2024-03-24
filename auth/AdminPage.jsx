import React, { useState, useEffect } from 'react';
import '../../styles/admin.css'; // CSS 파일을 import합니다.

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:4000/users');
        const userData = await response.json();
        setUsers(userData);
      } catch (error) {
        console.error('사용자 목록을 가져오는 중에 오류가 발생했습니다:', error);
      }
    };

    fetchUsers();
  }, [approvalStatus]);

  const handleViewAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/users');
      const userData = await response.json();
      setUsers(userData);
    } catch (error) {
      console.error('모든 사용자 조회 중에 오류가 발생했습니다:', error);
    }
  };

  const handleViewApprovedUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/users/approved');
      const approvedUsersData = await response.json();
      setUsers(approvedUsersData);
    } catch (error) {
      console.error('승인 완료된 사용자 조회 중에 오류가 발생했습니다:', error);
    }
  };

  const handleUpdateApproval = async () => {
    try {
      const selectedUserId = selectedUser;

      const response = await fetch(`http://localhost:4000/users/${selectedUserId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvalStatus })
      });

      const responseData = await response.json();

      setMessage(responseData.message);
      setApprovalStatus('');
    } catch (error) {
      console.error('사용자 승인 상태 업데이트 오류:', error);
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Page</h1>
      <div className="button-container">
        <button onClick={handleViewAllUsers}>전체 사용자 조회</button>
        <button onClick={handleViewApprovedUsers}>승인 완료된 사용자 조회</button>
      </div>
      <ul className="user-list">
        {users.map(user => (
          <li key={user.id}>
            <input
              type="radio"
              id={user.id}
              name="user"
              value={user.id}
              checked={selectedUser === user.id}
              onChange={() => setSelectedUser(user.id)}
            />
            <label htmlFor={user.id}>{user.id}</label>
          </li>
        ))}
      </ul>
      <div className="approval-container">
        <select
          value={approvalStatus}
          onChange={(e) => setApprovalStatus(e.target.value)}
        >
          <option value="">승인 상태 선택</option>
          <option value="pending">승인 대기 중</option>
          <option value="approved">승인 완료</option>
        </select>
        <button onClick={handleUpdateApproval}>승인 상태 업데이트</button>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default AdminPage;
