import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import SearchResults from './SearchResults';
import ProductDetail from './ProductDetail';
import ProductManagement from './ProductManagement';
import ChatListComponent from './ChatListComponent';
import ShowWishlist from './ShowWishlist';
import '../../styles/product.css';

const SearchResultsPage = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { searchTerm: urlSearchTerm } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');

  const [savedSearchTerm, setSavedSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  const searchInputRef = useRef(null);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  
  const handleProductClick = async (productId) => {
    try {
      // Update views count for the clicked product
      await fetch(`https://ec2caps.liroocapstone.shop:4000/updateViews/${productId}`, {
        method: 'POST',
      });

      // Navigate to the product detail page with the selected productId
      navigate(`/ProductDetail/${productId}`);
    } catch (error) {
      console.error('Error updating views or navigating to product detail:', error);
    }
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!urlSearchTerm) return; // URL 파라미터로 검색어가 없으면 아무 작업도 수행하지 않음

      try {
        const response = await fetch(`https://ec2caps.liroocapstone.shop:4000/products?search=${urlSearchTerm}`);
        if (response.ok) {
          const data = await response.json();
          const updatedProducts = data.map(product => ({
            ...product,
            imageUrl: `https://ec2caps.liroocapstone.shop:4000/uploads/${product.image}`
          }));

          setFilteredProducts(updatedProducts);
          setLoading(false);
        } else {
          console.error('Failed to fetch search results');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [urlSearchTerm]);

  const handleSearchProduct = async () => {
    if (!searchTerm.trim()) {
      setSearchError('검색어를 입력하세요.');
      return;
    }

    try {
      const response = await fetch(`https://ec2caps.liroocapstone.shop:4000/products?search=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        const updatedProducts = data.map(product => ({
          ...product,
          imageUrl: `https://ec2caps.liroocapstone.shop:4000/uploads/${product.image}`
        }));

        setFilteredProducts(updatedProducts);
        setLoading(false);
        navigate(`/searchResultsP/${encodeURIComponent(searchTerm)}`); // 검색 결과 페이지로 이동
      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    }
  };

  const handleEnterKeyPress = event => {
    if (event.key === 'Enter') {
      handleSearchProduct();
    }
  };

  const handleChangeSearchTerm = event => {
    setSearchTerm(event.target.value);
    setSearchError('');
  };

  const handleAddProduct = () => {
    navigate('/AddProducts');
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
    <div>
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
      
      {urlSearchTerm ? (
        <h2>검색 결과: {decodeURIComponent(urlSearchTerm)}</h2>
      ) : (
        <h2>검색어를 입력하세요.</h2>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <SearchResults filteredProducts={filteredProducts} onProductClick={handleProductClick} />
      )}
      <Routes>
        <Route path="/productDetail/:productId" element={<ProductDetail />} />
        <Route path="/ProductManagement" element={<ProductManagement />} />
        <Route path="/ChatListComponent" element={<ChatListComponent />} />
        <Route path="/showWishlist" element={<ShowWishlist />} />
        <Route path="/searchResultsP/:searchTerm/*" element={<SearchResultsPage />} />
      </Routes>
    </div>
  );
};

export default SearchResultsPage;