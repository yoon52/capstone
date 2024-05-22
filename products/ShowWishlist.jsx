import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import serverHost from '../../utils/host';
import Header from '../header/Header';

const ShowWishlist = () => {
  const userId = sessionStorage.getItem('userId');
  const [wishlistItems, setWishlistItems] = useState([]);
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

  
  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        const response = await fetch(`${serverHost}:4000/favorites`, {
          headers: {
            'user_id': userId
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setWishlistItems(data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlistItems();
  }, [userId]);

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
      {searchError && (
          <p className="search-error">{searchError}</p>
        )}
      <h1>찜목록</h1>
      <ul>
        {wishlistItems.map(item => (
          <li key={item.id}>
            <strong>{item.product_name}</strong> - {item.price ? item.price.toLocaleString() + '원' : '가격 정보 없음'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShowWishlist;