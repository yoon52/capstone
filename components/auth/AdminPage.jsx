import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardActions,
  Button,
  Modal,
  Box,
  TextField,
  Menu,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close'; // CloseIcon 추가
import serverHost from '../../utils/host';
import '../../styles/admin.css';

const drawerWidth = 240;

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
  const [showNavMenu, setShowNavMenu] = useState(false); // State for controlling overlay
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchApprovedUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/users`);
      if (response.status === 204) {
        console.log('No pending users found.');
        setUsers([]);
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch users.');
      }
      const userData = await response.json();
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/users/approved`);
      const approvedUserData = await response.json();
      setApprovedUsers(approvedUserData);
    } catch (error) {
      console.error('Error fetching approved users:', error);
    }
  };

  const handleUpdateApproval = async (userId, newStatus) => {
    try {
      let bodyData = { approvalStatus: newStatus };
      if (newStatus === 'rejected') {
        bodyData = { ...bodyData, rejectionReason };
      }

      const response = await fetch(`${serverHost}:4000/users/${userId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      await response.json();
      fetchUsers();
      setIsRejectionFormOpen(false);
      setRejectionReason('');

      // 사용자 승인 후 알람 표시 및 모달 닫기
      if (newStatus === 'approved') {
        alert('사용자가 승인되었습니다.');
        handleAdminModalClose();
      } else if (newStatus === 'rejected') {
        alert('사용자가 거부되었습니다.');
        handleAdminModalClose();
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
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
      const response = await fetch(`${serverHost}:4000/api/verify`, {
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
        setVerificationResult('학생증 확인중에 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error in OCR verification:', error);
    }
  };

  const handleDetailModalOpen = async (userId, imageUrl) => {
    await sendImageForOCR(userId, imageUrl);
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
    setShowNavMenu(!showNavMenu); // Toggle overlay
  };

  const handleApprovedUsersClick = () => {
    setShowApprovedUsers(!showApprovedUsers);
  };

  const handleToggleOptions = (userId, event) => {
    setShowOptionsForUser((prevUserId) => (prevUserId === userId ? null : userId));
    setAnchorEl(event.currentTarget);
  };


  const handleCloseOptions = () => {
    setAnchorEl(null);
  };


  const handleDeleteUser = (userId) => {
    const result = window.confirm('정말로 이 사용자를 삭제하시겠습니까?');
    if (result) {
      deleteUser(userId);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${serverHost}:4000/deletefromadmin/${userId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchUsers(); // 사용자 목록을 업데이트함
        window.location.reload(); // 페이지 새로고침
      } else {
        console.error('Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };



  return (
    <div className="admin-container">
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            관리자 페이지
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        anchor="left"
        open={isSidebarOpen}
        sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={handleApprovedUsersClick}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="승인된 사용자 보기" />
          </ListItem>
        </List>
      </Drawer>
      {showNavMenu && <div className="overlay" onClick={toggleSidebar}></div>} {/* Overlay for closing sidebar */}
      <main style={{ flexGrow: 1, padding: '20px', marginLeft: `${isSidebarOpen ? drawerWidth : 0}px`, transition: 'margin 0.3s' }}>
        <Toolbar />
        <Typography variant="h4" gutterBottom>사용자 관리</Typography>
        <div className="admin-card-grid">
          {(showApprovedUsers ? approvedUsers : users).map((user) => (
            <Card key={user.id} className="admin-user-card">
              <CardContent>
                <Typography variant="h5" component="div">{user.name}</Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">ID: {user.id}</Typography>
                <Typography variant="body2">이메일 : {user.email}</Typography>
                <Typography variant="body2">학과 : {user.department}</Typography>
                <Typography variant="body2">학년 : {user.grade}</Typography>
                <Typography variant="body2" className={`admin-status ${user.admin}`}>
                  {user.admin === 'pending' ? '승인 대기중' : user.admin === 'approved' ? '승인 완료' : '승인 거절'}
                </Typography>
              </CardContent>
              <CardActions>
                <div className="admin-options-container">
                  <IconButton onClick={(event) => handleToggleOptions(user.id, event)} style={{ position: 'absolute', top: 8, right: 8 }}>
                    <MoreHorizIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl && showOptionsForUser === user.id)}
                    onClose={handleCloseOptions}
                  >
                    <MenuItem onClick={() => handleAdminModalOpen(user)}>학생증 확인</MenuItem>
                    <MenuItem onClick={() => { handleDeleteUser(user.id); handleCloseOptions(); }}>유저 삭제</MenuItem>
                  </Menu>
                </div>


              </CardActions>
            </Card>
          ))}
        </div>
      </main>
      {selectedUser && (
        <Modal
          open={Boolean(selectedUser)}
          onClose={handleAdminModalClose}
          aria-labelledby="admin-modal-modal-title"
          aria-describedby="admin-modal-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <IconButton
              aria-label="close"
              onClick={handleAdminModalClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <img
              src={`${serverHost}:4000/uploads_id/${selectedUser.id}.jpg`}
              alt="Student ID"
              style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
            />
            {verificationResult && <Typography id="admin-modal-modal-description" sx={{ mt: 2 }}>{verificationResult}</Typography>}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <Button variant="contained" onClick={() => handleDetailModalOpen(selectedUser.id, `${serverHost}:4000/uploads_id/${selectedUser.id}.jpg`)}>상세 정보 보기</Button>
              <Button variant="contained" color="success" onClick={() => handleUpdateApproval(selectedUser.id, 'approved')}>승인</Button>
              <Button variant="contained" color="error" onClick={() => handleRejectButton(selectedUser.id)}>반려</Button>
            </div>
            {isRejectionFormOpen && (
              <div style={{ position: 'absolute', right: -330, top: 0, width: '300px', padding: '15px', backgroundColor: '#ffffff' }}>
                <form onSubmit={handleRejectFormSubmit}>
                  <TextField
                    label="반려 사유"
                    multiline
                    rows={4}
                    value={rejectionReason}
                    onChange={handleRejectionReasonChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                  <div style={{ marginTop: '10px', marginLeft: '110px' }}>
                    <Button type="submit" variant="contained" color="error">반려 하기</Button>
                  </div>
                </form>
              </div>
            )}
          </Box>
        </Modal>
      )}
    </div>
  );
}

export default AdminPage;