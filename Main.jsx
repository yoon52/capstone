import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import SortSelect from './SortSelect';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import ProductManagement from './ProductManagement';
import '../../styles/main.css';
import logo from '../../image/logo.png';

function Main() {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSearchTerm, setSavedSearchTerm] = useState('');
  const [sortType, setSortType] = useState('recommend');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = 'http://localhost:4000/products';
        if (sortType === 'latest') {
          url = 'http://localhost:4000/products/latest';
        } else if (sortType === 'recommend') {
          url = 'http://localhost:4000/products/searchByRecent';
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
    <div>
        <img src={logo} id='logo' alt="로고" />
        <div className="navigation-buttons">
          <button type="button" className="management-button" onClick={handleKeywordManagement}>검색어 관리</button>
          <button type="button" className="product-management-button" onClick={handleProductManagement}>상품 관리</button>
          <button type="button" className="my-info-button" onClick={handleShowMyInfoPage}>내 정보</button>
          <button type="button" className="logout-button" onClick={handleLogout}>로그아웃</button>
      </div>
      <div className="search-container">
        <input
          type="search"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={handleChangeSearchTerm}
          className="search-input" />
        <button onClick={handleSearchProduct} className="search-product-button">검색</button>
      </div>
      <div className="main-container">
        <SortSelect sortType={sortType} handleSortChange={handleSortChange} />
        {savedSearchTerm && (
          <p className="saved-search-term">저장된 검색어 : {savedSearchTerm}</p>
        )}
        <ProductList filteredProducts={filteredProducts} />

        <Routes>
          <Route path="/productDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
        </Routes>
      </div>
      <button type="button" className="add-button" onClick={handleAddProduct} >상품 등록</button>
    </div>
  );
}

export default Main;
