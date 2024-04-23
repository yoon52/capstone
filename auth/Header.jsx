import React, { useState } from 'react';

import { FaBars, FaPlus, FaComments, FaUser, FaTimes, FaCog, FaSignOutAlt, FaHeart } from 'react-icons/fa';
import logo from '../../image/logo.png';

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
  searchInputRef 
}) => {
    const [showRecentSearches, setShowRecentSearches] = useState(false);
  // 최근 검색어 목록
  const recentSearches = ['iPhone', '갤럭시', '노트북', '키보드', '마우스'];

  const handleSearchInputFocus = () => {
    setShowRecentSearches(true);
  };

  const handleSearchInputBlur = () => {
    setShowRecentSearches(false);
  };
  
  return (
    <header className="header-main">
      <div className="header-content">
      <FaBars className="nav-menu-toggle" onClick={toggleNavMenu} />
        <a href="/Main">
          <img src={logo} id='logo' alt="로고" />
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
          <button className="header-button" onClick={handleAddProduct}><FaPlus /></button>
          <button className="header-button" onClick={handleShowChatList}><FaComments /></button>
          <button className="header-button" onClick={handleShowMyInfoPage}><FaUser /></button>
          <button className="header-button" onClick={handleShowWishlist}><FaHeart /></button> {/* 찜목록 표시 버튼 */}
        </div>
      </div>
      <div className={`sidebar ${showNavMenu ? 'show' : ''}`}>
        <nav className="main_navigation">
          <div className='sidebar-item'>
            "사용자정보"
          </div>
          <button type="button" className="close-menu-btn" onClick={closeNavMenu}><FaTimes /></button>
          <button type="button" className="main-nav-button" onClick={handleKeywordManagement}><FaCog /> 검색어 관리</button>
          <button type="button" className="main-nav-button" onClick={handleProductManagement}><FaCog /> 상품 관리</button>
          <button type="button" className="main-nav-button" onClick={handleLogout}><FaSignOutAlt /> 로그아웃</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;