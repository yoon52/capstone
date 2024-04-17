import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import RecommendList from './RecommendList';
import ViewsList from './ViewsList';
import LatestList from './LatestList';
import SearchResults from './SearchResults';
import ProductDetail from './ProductDetail';
import ProductManagement from './ProductManagement';
import ChatListComponent from './ChatListComponent';
import '../../styles/main.css';
import '../../styles/product.css';
import Header from './Header';
import ShowWishlist from './ShowWishlist';

function Main() {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSearchTerm, setSavedSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
    
  const handleAddProduct = () => {
    navigate('/AddProducts');
  };

  const handleSearchProduct = async () => {
    if (!searchTerm) {
      setSearchError('검색어를 입력하세요.');
      console.log('touch'); // 검색 인풋창 클릭시 "touch"를 콘솔에 출력
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/products?search=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredProducts(data);
        setSavedSearchTerm(searchTerm);
        saveSearchTerm(searchTerm);
        setShowSearchResults(true);
        setSearchError('');
        
      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    }
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchProduct();
    }
  };

  const saveSearchTerm = async (searchTerm) => {
    try {
      const userId = sessionStorage.getItem('userId');
      const response = await fetch('http://localhost:4000/searchHistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchTerm, userId })
      });
      if (!response.ok) {
        console.error('검색어 저장 오류:', response.status);
      }
    } catch (error) {
      console.error('검색어 저장 오류:', error);
    }
  };

  const handleChangeSearchTerm = (event) => {
    setSearchTerm(event.target.value);
    setSearchError('');
  };

  const handleKeywordManagement = () => {
    navigate('/SearchKeyword');
  };

  const handleProductManagement = () => {
    navigate('/ProductManagement');
  };
  const handleShowWishlist = () => {
    navigate('/ShowWishlist');
  };
  const handleShowMyInfoPage = () => {
    navigate('/MyInfo');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    navigate('/login');
  };

  const handleShowChatList = () => {
    navigate('/ChatListComponent');
  };

  const toggleNavMenu = () => {
    setShowNavMenu(!showNavMenu);
  };

  const closeNavMenu = () => {
    setShowNavMenu(false);
  };

  

  return (
    <div className="container-main">
              <Header 
          toggleNavMenu={toggleNavMenu} 
          showNavMenu={showNavMenu} 
          closeNavMenu={closeNavMenu} 
          handleAddProduct={handleAddProduct} 
          handleShowChatList={handleShowChatList} 
          handleShowMyInfoPage={handleShowMyInfoPage} 
          handleKeywordManagement={handleKeywordManagement} 
          handleProductManagement={handleProductManagement} 
          handleLogout={handleLogout} 
          searchTerm={searchTerm} 
          handleChangeSearchTerm={handleChangeSearchTerm} 
          handleEnterKeyPress={handleEnterKeyPress} 
          searchInputRef={searchInputRef} 
          handleShowWishlist={handleShowWishlist}
          setShowRecentSearches={setShowRecentSearches} // setShowRecentSearches 함수 전달

        />
      <div className="main-container">
        {showSearchResults && (
          <SearchResults filteredProducts={filteredProducts} searchTerm={searchTerm} />
        )}
        <RecommendList />
        <h2>조회순 상품</h2>
        <ViewsList />
        <LatestList />
        <Routes>
          <Route path="/productDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
          <Route path="/ChatListComponent" element={<ChatListComponent />} />
          <Route path="/showWishlist" element={<ShowWishlist />} />
        </Routes>
        {searchError && (
          <p className="search-error">{searchError}</p>
        )}
      </div>
  
      {showNavMenu && <div className="overlay" onClick={closeNavMenu}></div>}
    </div>
  );
}

export default Main;
