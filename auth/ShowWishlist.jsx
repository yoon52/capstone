import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Routes, Route, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import Header from './Header';
import '../../styles/product.css';

const ShowWishlist = () => {
  const userId = sessionStorage.getItem('userId');
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
  const [isFavorite, setIsFavorite] = useState(false); // 추가: 찜 상태
  const [isFavorited, setIsFavorited] = useState(false); // 찜 상태 여부

  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        const response = await fetch(`http://localhost:4000/favorites?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setWishlistItems(data);
        } else {
          console.error('Error fetching wishlist items:', response.status);
        }
      } catch (error) {
        console.error('Error fetching wishlist items:', error);
      }
    };

    fetchWishlistItems();
  }, [userId]);

  const handleChatButtonClick = async (productId) => {
    try {
      const response = await fetch(`http://localhost:4001/api/chat-rooms?productId=${productId}&userId=${userId}`);
      if (response.ok) {
        const existingChatRoom = await response.json();
        if (existingChatRoom) {
          setIsChatModalOpen(true);
          return;
        }
      }

      const createResponse = await fetch('http://localhost:4001/api/chat-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, userId })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create chat room');
      }

      setIsChatModalOpen(true);
    } catch (error) {
      console.error('Error creating or retrieving chat room:', error);
    }
  };

  const handleProductClick = (productId) => {
    // productId를 이용하여 상품 상세 페이지로 이동
    navigate(`/productDetail/${productId}`);
  };

  const handleAddProduct = () => {
    navigate('/AddProducts');
  };

  const handleSearchProduct = async () => {
    if (!searchTerm) {
      setSearchError('검색어를 입력하세요.');
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

        // Navigate to ResultPage with encoded searchTerm
        navigate(`/SearchResultsP/${encodeURIComponent(searchTerm)}`);
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

  const [selectedItems, setSelectedItems] = useState([]);

  const isSelected = (itemId) => {
    return selectedItems.includes(itemId);
  };

  const handleCheckboxChange = (itemId) => {
    if (isSelected(itemId)) {
      setSelectedItems(selectedItems.filter(item => item !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm('선택한 상품을 삭제하시겠습니까?')) {
      try {
        const selectedItemsIds = selectedItems; // 이미 상품 ID로 구성된 배열
        const response = await fetch('http://localhost:4000/favorites/deleteSelectedItems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ selectedItems: selectedItemsIds })
        });

        if (response.ok) {
          const updatedWishlist = wishlistItems.filter(product => !selectedItemsIds.includes(product.id));
          setWishlistItems(updatedWishlist);
          setSelectedItems([]); // 선택된 상품 초기화
        } else {
          console.error('상품 삭제 오류:', response.status);
        }
      } catch (error) {
        console.error('상품 삭제 오류:', error);
      }
    }
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
      />
      <h1>찜한 상품 목록</h1>
      <div className="wishlist-container">
        {wishlistItems.map(product => (
          <div key={product.id} className="wishlist-item">
            {/* 체크박스 */}
            <input
              type="checkbox"
              onChange={() => handleCheckboxChange(product.id)}
              checked={isSelected(product.id)}
            />
            {/* 상품 이미지 */}
            <img
              src={`http://localhost:4000/uploads/${product.image}`}
              alt={product.product_name}
              className="product-image"
              onClick={() => handleProductClick(product.product_id)} // 이미지 클릭 시 상세 페이지로 이동
            />
            {/* 상품명 */}
            <span>{product.name}</span>
            {/* 가격 */}
            <span>{product.price ? `${product.price.toLocaleString()}원` : '가격 정보 없음'}</span>
          </div>
        ))}

      </div>

      {/* 선택 삭제 버튼 */}
      {selectedItems.length > 0 && (
        <Button onClick={handleDeleteSelected}>선택 삭제</Button>
      )}
    </div>
  );

};

export default ShowWishlist;