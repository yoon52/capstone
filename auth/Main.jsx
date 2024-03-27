import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt, FaPlus, FaSearch } from 'react-icons/fa';

import RecommendList from './RecommendList';
import ViewsList from './ViewsList';
import LatestList from './LatestList';
import SearchResults from './SearchResults'; // 검색 결과를 보여주는 컴포넌트 임포트

import ProductDetail from './ProductDetail';
import ProductManagement from './ProductManagement';
import '../../styles/main.css';
import '../../styles/product.css';
import logo from '../../image/logo.png';

function Main() {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSearchTerm, setSavedSearchTerm] = useState('');
  const [sortType, setSortType] = useState('recommend');
  const navigate = useNavigate();

  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = 'http://localhost:4000/products';
        if (sortType === 'latest') {
          url = 'http://localhost:4000/products/latest';
        } else if (sortType === 'recommend') {
          url = 'http://localhost:4000/products/searchByRecent';
        } else if (sortType === 'views') {
          url = 'http://localhost:4000/products/views';
        }
        const response = await fetch(url, {
          headers: {
            'user_id': sessionStorage.getItem('userId')
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFilteredProducts(data);
        } else {
          console.error('상품 목록 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('상품 목록 가져오기 오류:', error);
      }
    };

    fetchProducts();
  }, [sortType]);

  const handleAddProduct = () => {
    navigate('/AddProducts');
  };

  const handleSearchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:4000/products?search=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredProducts(data);
        setSavedSearchTerm(searchTerm);
        saveSearchTerm(searchTerm);
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
  };

  const handleSortChange = (event) => {
    const sortTypeValue = event.target.value;
    setSortType(sortTypeValue);
  };

  const handleKeywordManagement = () => {
    navigate('/SearchKeyword');
  };

  const handleProductManagement = () => {
    navigate('/ProductManagement');
  };

  const handleShowMyInfoPage = () => {
    navigate('/MyInfo');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="container-main">
      <header className="header-main">
        <img src={logo} id='logo' alt="로고" />
        <nav className="navigation">
          <button type="button" className="nav-button" onClick={handleKeywordManagement}><FaCog /> 검색어 관리</button>
          <button type="button" className="nav-button" onClick={handleProductManagement}><FaCog /> 상품 관리</button>
          <button type="button" className="nav-button" onClick={handleShowMyInfoPage}><FaUser /> 내 정보</button>
          <button type="button" className="nav-button" onClick={handleLogout}><FaSignOutAlt /> 로그아웃</button>
        </nav>
      </header>
      <div className="search-container">
      <input
          ref={searchInputRef}
          type="search"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={handleChangeSearchTerm}
          onKeyDown={handleEnterKeyPress}
          className="search-input" />
        <button onClick={handleSearchProduct} className="search-button"><FaSearch /></button>

      </div>
        <div className="main-container">
        {/* 검색 결과 컴포넌트 */}
        <SearchResults filteredProducts={filteredProducts} searchTerm={searchTerm} />
        <RecommendList />
        <ViewsList />
        <LatestList />

        <Routes>
          <Route path="/productDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
        </Routes>
      </div>
      <button type="button" className="add-button" onClick={handleAddProduct} ><FaPlus /> 상품 등록</button>
    </div>
  );
}

export default Main;
