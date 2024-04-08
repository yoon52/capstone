import React from 'react';
import { FaBars, FaPlus, FaComments, FaUser, FaTimes, FaCog, FaSignOutAlt } from 'react-icons/fa';
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
  searchTerm, 
  handleChangeSearchTerm, 
  handleEnterKeyPress, 
  searchInputRef 
}) => {
  return (
    <header className="header-main">
      <div className="header-content">
        <FaBars className="nav-menu-toggle" onClick={toggleNavMenu} />
        <img src={logo} id='logo' alt="로고" />
        <div className="search-container">
          <input
            ref={searchInputRef}
            type="search"
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={handleChangeSearchTerm}
            onKeyDown={handleEnterKeyPress}
            className="search-input"
          />
        </div>
        <div className="header-buttons">
          <button className="header-button" onClick={handleAddProduct}><FaPlus /></button>
          <button className="header-button" onClick={handleShowChatList}><FaComments /></button>
          <button className="header-button" onClick={handleShowMyInfoPage}><FaUser /></button>
        </div>
      </div>
      <div className={`sidebar ${showNavMenu ? 'show' : ''}`}>
        <nav className="main_navigation">
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
