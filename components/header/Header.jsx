/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from 'react';

import { FaBars, FaPlus, FaComments, FaUser, FaTimes, FaCog, FaSignOutAlt, FaHeart, FaMoneyCheck, FaSearch  } from 'react-icons/fa';
import logo from '../../image/logo.png';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import serverHost from '../../utils/host';

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
  handleShowWishlist, // 찜목록 표시 핸들러 추가
  searchTerm,
  handleChangeSearchTerm,
  handleEnterKeyPress,
  searchInputRef,

}) => {
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 상태 추가
  const navigate = useNavigate(); // Get navigate function from react-router-dom

  const handleSearchInputFocus = () => {
    console.log('Input clicked'); // 검색 인풋창 클릭시 "Input clicked"를 콘솔에 출력

  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 서버에 해당 사용자 정보 요청
        const response = await fetch(`${serverHost}:4000/getUserInfo`, {
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

  // 결제 내역 관리 페이지로 이동하는 함수
  const handlePayments = () => {
    // '/payments' 경로로 이동합니다. 원하는 경로로 수정 가능합니다.
    navigate('/payments');
  };

  
  return (
    <header className="header-main">
      <div className="header-content">
        <FaBars className="nav-menu-toggle" onClick={toggleNavMenu} />
        <a href="/Main">
          <img src={logo} id="logo" alt="로고" />
        </a>
        <input
          ref={searchInputRef}
          type="search"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={handleChangeSearchTerm}
          onKeyDown={handleEnterKeyPress}
          onFocus={handleSearchInputFocus}
          className="search-input"
        />

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
                <div className="image-container">
                  <img src="https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png" />
                </div>
                <div className="user-info-container">
                  <p className="user-info">이름 : {userInfo.name}</p>
                  <p className="user-info">매너 학점 : {userInfo.rates}</p>                
                  <p className="user-info">잔액: {userInfo && parseInt(userInfo.total_sales).toLocaleString()}원</p>
  
  
                </div>
              </>
            )}
          </div>

          <button type="button" className="close-menu-btn" onClick={closeNavMenu}><FaTimes /></button>
          <button type="button" className="main-nav-button" onClick={handleKeywordManagement}><FaSearch /> 검색어 관리</button>
          <button type="button" className="main-nav-button" onClick={handleProductManagement}><FaCog /> 등록한 상품</button>
          <button type="button" className="main-nav-button" onClick={handlePayments}><FaMoneyCheck /> 구매한 상품</button>
          <button type="button" className="main-nav-button" onClick={handleLogout}><FaSignOutAlt /> 로그아웃</button>
        </nav>
      </div>
      {showNavMenu && <div className="overlay" onClick={closeNavMenu}></div>}
    </header>
  );
};

export default Header;