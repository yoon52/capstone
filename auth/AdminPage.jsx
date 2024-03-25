import React, { useState, useEffect } from 'react';
import '../../styles/admin.css'; // CSS 파일을 import합니다.

function AdminPage() {
  const [users, setUsers] = useState([]);

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

  const handleViewApprovedUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/users/approved');
      const approvedUsersData = await response.json();
      setUsers(approvedUsersData);
    } catch (error) {
      console.error('승인된 사용자 목록을 가져오는 중에 오류가 발생했습니다:', error);
    }
  };

  const handleViewAllUsers = async () => {
    fetchUsers();
  };

  const handleUpdateApproval = async (userId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/users/${userId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvalStatus: newStatus })
      });

      const responseData = await response.json();

      // 사용자 목록을 다시 불러와서 최신 정보를 업데이트합니다.
      fetchUsers();
    } catch (error) {
      console.error('사용자 승인 상태 업데이트 오류:', error);
    }
  };

  return (
    <div className="admin-container">
      <h1>회원 정보 관리</h1>
        <button onClick={handleViewAllUsers} className="user-list-button">전체 사용자 보기</button>
        <button onClick={handleViewApprovedUsers} className="user-list-button">승인 완료된 사용자 보기</button>

      <table className="user-table">
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>이메일</th>
            <th>부서</th>
            <th>학년</th>
            <th>승인 상태</th>
            <th>승인 변경</th>
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
              <td>{user.admin}</td>
              <td>
                {user.admin === 'pending' && (
                  <>
                    <button className="approve" onClick={() => handleUpdateApproval(user.id, 'approved')}>승인</button>
                    <button className="reject" onClick={() => handleUpdateApproval(user.id, 'rejected')}>거절</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;
