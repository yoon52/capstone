/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useRef } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import ViewsList from './ViewsList';
import SearchResults from './SearchResults';
import ProductDetail from './ProductDetail';
import ProductManagement from './ProductManagement';
import ChatListComponent from './ChatListComponent';
import Header from './Header';
import ShowWishlist from './ShowWishlist';
import '../../styles/main.css';
import '../../styles/product.css';
import serverHost from '../../utils/host';

function Main() {
  const [,setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [,setSavedSearchTerm] = useState('');
  const [,setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [,setShowRecentSearches] = useState(false);

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
      const response = await fetch(`${serverHost}:4000/products?search=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredProducts(data);
        setSavedSearchTerm(searchTerm);
        saveSearchTerm(searchTerm);
        setShowSearchResults(true);
        setSearchError('');

        // Navigate to the search results page
        navigate(`/searchResultsP/${encodeURIComponent(searchTerm)}`);

      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    }
    // 검색어가 유효할 때 콘솔에 검색어 출력
    console.log("검색어:", searchTerm);

  };

  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchProduct();
    }
  };

  const saveSearchTerm = async (searchTerm) => {
    try {
      const userId = sessionStorage.getItem('userId');
      const response = await fetch(`${serverHost}:4000/searchHistory`, {
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

  const handleMoreList = () => {
    navigate('/LatestList');
  }

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
        setShowRecentSearches={setShowRecentSearches}
        userInfo
        onSearchSubmit={handleSearchProduct}
        recentSearches={[]}
      />
      <div className="main">
        <section className="fleamarket-cover">
          <div className="cover-content">
            <h1 className="cover-title">믿을만한<br />대학교 교내 중고거래</h1>
            <span className="cover-description">학생들과 가깝고 따뜻한 거래를<br />지금 경험해보세요.</span>
            <div className="cover-image">
              <span className="fleamarket-cover-image">
                <img src="https://d1unjqcospf8gs.cloudfront.net/assets/home/main/3x/fleamarket-39d1db152a4769a6071f587fa9320b254085d726a06f61d544728b9ab3bd940a.webp " alt="믿을만한 이웃 간 중고거래"/>
              </span>

            </div>
          </div>
        </section>

        <div className="list-container">
          <ViewsList

          />
        </div>
        <div className="more-list">
          <button className="more-button" onClick={handleMoreList}>전체 상품 보기</button>
        </div>
        <Routes>
          <Route path="/ProductDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
          <Route path="/ChatListComponent" element={<ChatListComponent />} />
          <Route path="/showWishlist" element={<ShowWishlist />} />
          <Route path="/SearchResults/:searchTerm" element={<SearchResults />} />

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