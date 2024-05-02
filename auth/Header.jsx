import React, { useState, useEffect } from 'react';
import { FaBars, FaPlus, FaComments, FaUser, FaTimes, FaCog, FaSignOutAlt, FaHeart } from 'react-icons/fa';
import logo from '../../image/logo.png';
import { useNavigate } from 'react-router-dom';
import '../../styles/main.css';

const Header = ({
  toggleNavMenu,
  showNavMenu,
  closeNavMenu,
  handleAddProduct,
  handleShowChatList,
  handleShowMyInfoPage,
  handleKeywordManagement,
  handleProductManagement,
  handleLogout,
  handleShowWishlist,
  searchTerm,
  handleChangeSearchTerm,
  handleEnterKeyPress,
  searchInputRef,
  onSearchSubmit,
  recentSearches
}) => {
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 상태 추가
  const navigate = useNavigate(); // Get navigate function from react-router-dom

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 서버에 해당 사용자 정보 요청
        const response = await fetch('http://localhost:4000/getUserInfo', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'user_id': sessionStorage.getItem('userId')
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user info from server');
        }
        const userInfo = await response.json();
        setUserInfo(userInfo);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserInfo();
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 마운트될 때만 실행되도록 설정

  const handleSearchInputFocus = () => {
    console.log('Input clicked'); // 검색 인풋창 클릭시 "Input clicked"를 콘솔에 출력
  };

  const handleSearchInputBlur = () => {
    setShowRecentSearches(false);
  };

  
  return (
    <header className="header-main">
      <div className="header-content">
        <FaBars className="nav-menu-toggle" onClick={toggleNavMenu} />
        <a href="/Main">
          <img src={logo} id="logo" alt="로고" />
        </a>
        <div className="search-container">
          <input
            ref={searchInputRef}
            type="search"
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={handleChangeSearchTerm}
            onKeyDown={handleEnterKeyPress}
            onFocus={handleSearchInputFocus}
            onBlur={handleSearchInputBlur}
            className="search-input"
          />
          {showRecentSearches && (
            <div className="recent-searches-container">
              <ul>
                {recentSearches.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="header-buttons">
          <button className="header-button" onClick={handleAddProduct}>
            <FaPlus />
          </button>
          <button className="header-button" onClick={handleShowChatList}>
            <FaComments />
          </button>
          <button className="header-button" onClick={handleShowMyInfoPage}>
            <FaUser />
          </button>
          <button className="header-button" onClick={handleShowWishlist}>
            <FaHeart />
          </button>
          {/* 찜목록 표시 버튼 */}

        </div>
      </div>
      <div className={`sidebar ${showNavMenu ? 'show' : ''}`}>
        <nav className="main_navigation">
          <div className="sidebar-item">
            {userInfo && (
              <>
                <p className="user-info">이름 : {userInfo.name}</p>
                <p className="user-info">학과 : {userInfo.department}</p>
                <p className="user-info">학년 : {userInfo.grade}</p>
              </>
            )}
          </div>
          <button type="button" className="close-menu-btn" onClick={closeNavMenu}>
            <FaTimes />
          </button>
          <button type="button" className="main-nav-button" onClick={handleKeywordManagement}>
            <FaCog /> 검색어 관리
          </button>
          <button type="button" className="main-nav-button" onClick={handleProductManagement}>
            <FaCog /> 상품 관리
          </button>
          <button type="button" className="main-nav-button" onClick={handleLogout}>
            <FaSignOutAlt /> 로그아웃
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;