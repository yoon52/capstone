import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Routes, Route, useParams } from 'react-router-dom';
import '../../styles/searchkeyword.css';
import serverHost from '../../utils/host';
import Header from '../header/Header';

function SearchKeyword() {
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [userId, setUserId] = useState('');
  const [wishlistItems, setWishlistItems] = useState([]);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSearchTerm, setSavedSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // 현재 로그인된 사용자의 ID를 가져오는 함수
  const fetchUserId = useCallback(() => {
    const userId = sessionStorage.getItem('userId');
    setUserId(userId);
  }, []);

  // 검색어 목록을 서버로부터 가져오는 함수
  const fetchSearchKeywords = useCallback(async () => {
    try {
      const response = await fetch(`${serverHost}:4000/SearchKeywords/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSearchKeywords(data);
      } else {
        console.error('검색어를 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('검색어를 가져오는 중 오류가 발생했습니다:', error);
    }
  }, [userId]);

  // 검색어 삭제 함수
  const deleteKeyword = async (keywordId) => {
    try {
      const response = await fetch(`${serverHost}:4000/SearchKeywords/delete/${keywordId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchSearchKeywords(); // 삭제 후 목록을 다시 가져옴
      } else {
        console.error('검색어 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('검색어를 삭제하는 중 오류가 발생했습니다:', error);
    }
  };

  const handleSearchProduct = async () => {
    if (!searchTerm) {
      setSearchError('검색어를 입력하세요.');
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

        // Navigate to ResultPage with encoded searchTerm
        navigate(`/SearchResultsP/${encodeURIComponent(searchTerm)}`);
      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
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

  const toggleNavMenu = () => {
    setShowNavMenu(!showNavMenu);
  };

  const closeNavMenu = () => {
    setShowNavMenu(false);
  };

  const handleAddProduct = () => {
    navigate('/AddProducts');
  };

  const handleShowChatList = () => {
    navigate('/ChatListComponent');
  };

  const handleKeywordManagement = () => {
    navigate('/SearchKeyword');
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

  const handleProductManagement = () => {
    navigate('/ProductManagement');
  };

  const handleChangeSearchTerm = (event) => {
    setSearchTerm(event.target.value);
    setSearchError('');
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchProduct();
    }
  };



  // 컴포넌트가 마운트되면 사용자 ID와 검색어 목록을 가져옴
  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  useEffect(() => {
    if (userId !== '') {
      fetchSearchKeywords();
    }
  }, [userId, fetchSearchKeywords]);

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
      />
      
      <h1 className="search-keyword-header">검색 기록</h1>
      <div className="search-keyword-container">
        {searchKeywords.map((keyword) => (
          <li key={keyword.id} className="keyword-item">
            <span className="keyword-text">{keyword.search_term}</span>
            <button className="delete-button" onClick={() => deleteKeyword(keyword.id)}>삭제</button>
          </li>
        ))}
      </div>
    </div>
  );
}

export default SearchKeyword;