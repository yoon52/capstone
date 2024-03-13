// Main.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import SearchInput from './SearchInput';
import SortSelect from './SortSelect';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import ProductManagement from './ProductManagement'; // Import ProductManagement component with the correct path
import '../../styles/main.css';

function Main() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [savedSearchTerm, setSavedSearchTerm] = useState('');
  const [sortType, setSortType] = useState('recommend');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = 'https://ec2caps.liroocapstone.shop:4000/products';
        if (sortType === 'latest') {
          url = 'https://ec2caps.liroocapstone.shop:4000/products/latest';
        } else if (sortType === 'recommend') {
          url = 'https://ec2caps.liroocapstone.shop:4000/products/searchByRecent';
        }
        const response = await fetch(url, {
          headers: {
            'user_id': sessionStorage.getItem('userId')
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
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
    navigate('/addProducts'); 
  };

  const handleSearchProduct = async () => {
    try {
      const response = await fetch(`https://ec2caps.liroocapstone.shop:4000/products?search=${searchTerm}`);
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
      const response = await fetch('https://ec2caps.liroocapstone.shop:4000/searchHistory', {
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
    navigate('/search-keyword');
  };
  
  const handleProductManagement = () => {
    navigate('/ProductManagement');
  };


  return (
    <div className="main-container">
      <div className="navigation-buttons">
        <button onClick={handleKeywordManagement} className="management-button">
          검색어 관리
        </button>
        <button onClick={handleProductManagement} className="product-management-button">
          상품 관리
        </button>
        
      </div>
      <SearchInput
        searchTerm={searchTerm}
        handleChangeSearchTerm={handleChangeSearchTerm}
        handleSearchProduct={handleSearchProduct}
      />
      <SortSelect sortType={sortType} handleSortChange={handleSortChange} />
      {savedSearchTerm && (
        <p className="saved-search-term">저장된 검색어: {savedSearchTerm}</p>
      )}
      <ProductList filteredProducts={filteredProducts} />
      <button onClick={handleAddProduct} className="add-product-button">
        상품 등록
      </button>
      <Routes>
        <Route path="/productDetail/:productId" element={<ProductDetail />} />
        <Route path="/ProductManagement" element={<ProductManagement />} /> {/* Add this route */}
      </Routes>

    </div>
  );

}

export default Main;
