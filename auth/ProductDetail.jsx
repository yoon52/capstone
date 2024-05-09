import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Routes, Route, useParams, Link } from 'react-router-dom';
import { Button, Modal as MuiModal, Menu, MenuItem, IconButton } from '@mui/material';
import { MoreVert, Favorite, FavoriteBorder } from '@mui/icons-material'; // 추가: Favorite 아이콘
import Modal from 'react-modal';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatComponent from './ChatComponent';
import '../../styles/product.css';
import Header from './Header';
import ViewsList from './ViewsList';

Modal.setAppElement('#root');

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const userId = sessionStorage.getItem('userId');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSearchTerm, setSavedSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false); // 추가: 찜 상태
  const [isFavorited, setIsFavorited] = useState(false); // 찜 상태 여부

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`http://localhost:4000/products/detail/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);

          // 서버에서 찜 상태 확인
          const favoriteResponse = await fetch(`http://localhost:4000/products/checkFavorite/${productId}?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${userId}` // 사용자 토큰을 헤더에 포함하여 인증
            }
          });

          if (favoriteResponse.ok) {
            const { isFavorited } = await favoriteResponse.json();
            setIsFavorite(isFavorited);
          } else {
            console.error('찜 상태 확인 실패:', favoriteResponse.status);
          }
        } else {
          console.error('상품 상세 정보 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('상품 상세 정보 가져오기 오류:', error);
      }
    };

    fetchProductDetail();
  }, [productId, userId]);

  useEffect(() => {
    sessionStorage.setItem('productId', productId);
  }, [productId]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch('http://localhost:4000/products/views');
        if (response.ok) {
          const data = await response.json();
          setRelatedProducts(data);
        } else {
          console.error('Failed to fetch related products:', response.status);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    fetchRelatedProducts();
  }, []);

  const handleChatButtonClick = async () => {
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

  const handleSendMessage = (roomId, message) => {
    // 메시지 전송 로직 추가
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch(`http://localhost:4000/products/toggleFavorite/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite); // 서버에서 받은 찜 상태로 업데이트
      } else {
        console.error('찜 상태 토글 실패:', response.status);
      }
    } catch (error) {
      console.error('찜 상태 토글 오류:', error);
    }
  };

  if (!product) {
    return <div className="loading">Loading...</div>;
  }

  const availability = product.status === 'available' ? '구매 가능' : '판매 완료';


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

  const calculateTimeAgo = (date) => {
    const today = new Date();
    const registrationDate = new Date(date);
    const diffTime = today.getTime() - registrationDate.getTime();
    const timeDifference = Math.floor(diffTime / (1000 * 60));
  
    if (timeDifference < 30) {
      return '방금 전';
    } else if (timeDifference < 60 * 24) {
      return `${Math.floor(timeDifference / 60)}시간 전`;
    } else if (timeDifference < 60 * 24 * 7) {
      return `${Math.floor(timeDifference / (60 * 24))}일 전`;
    } else if (timeDifference < 60 * 24 * 30) {
      return `${Math.floor(timeDifference / (60 * 24 * 7))}주 전`;
    } else {
      return '한달 ↑';
    }
  };

  const handleReport = () => {
    // 신고하기 핸들러
  };

  const handleDelete = async () => {
    if (userId !== product.user_id) { // userId와 상품의 작성자 ID 비교
      alert("작성자만 삭제할 수 있습니다.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/productsmanage/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user_id': userId // 사용자 ID를 헤더에 포함하여 서버로 전송
        }
      });

      if (response.ok) {
        // 삭제가 성공적으로 처리된 경우에 대한 처리
        console.log('상품이 삭제되었습니다.');
        alert("상품이 삭제되었습니다.");
        // 메인 페이지로 이동
        navigate('/Main');

      } else {
        console.error('상품 삭제 오류:', response.status);
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error);
    }
  };

  const handleClick = (event) => {
    if (anchorEl === event.currentTarget) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
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

      <div className="product-detail">
        <div style={{ display: 'flex', width: '100%' }}>
          <img
            className="product-d-image"
            src={`http://localhost:4000/uploads/${product.image}`}
            alt={product.name}
          />
          <div className="product-content">
            <p className="product-d-name">
              {product.name}
            </p>
            <p className="product-d-price">
              <span style={{ fontSize: '40px', fontWeight: 450 }}>{product.price}</span>원
            </p>
            <div className="product-info"
              style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
              <p className="product-d-views">
                <VisibilityIcon sx={{ fontSize: 20, marginRight: 0.5, marginBottom: -0.3 }} />
                {product.views}
              </p>
              <span>|</span>
              <p className="product-d-date">
                {calculateTimeAgo(product.createdAt)}
              </p>
              <span>|</span>
              <p className="product-d-availability">
                {availability}
              </p>
            </div>
            
            <Button
              onClick={handleToggleFavorite}
              variant="contained"
              color={isFavorite ? 'secondary' : 'primary'}
              className="favorite-button"
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
              {isFavorite ? '찜 해제' : '찜하기'}
            </Button>

            <Button onClick={handleChatButtonClick} className="chat-button">채팅하기</Button>
            
            <IconButton onClick={handleClick} className="more-button"><MoreVert /></IconButton> {/* 케밥 아이콘 */}
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              
              <MenuItem onClick={handleReport}>신고하기</MenuItem>
              <MenuItem onClick={handleDelete}>삭제하기</MenuItem>
            </Menu>
          </div>
        </div>
        <div className="product-d-description-container">
          <p className="product-d-description-header">상품정보</p>
          <p className="product-d-description">
            {product.description}
          </p>
        </div>

        <MuiModal
          open={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          BackdropProps={{ style: { backgroundColor: 'rgba(255, 255, 255, 0.5)' } }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(5px)',
            border: 'none',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <div>
            <ChatComponent chatRooms={chatRooms} onSendMessage={handleSendMessage} />
            <Button onClick={() => setIsChatModalOpen(false)}>닫기</Button>
          </div>
        </MuiModal>
        <div className="seller-profile">
        <div style={{ display: 'flex', width: '100%' }}>
          seller-profile
          </div>
        </div>
        
        <div className="related-products">
          <ViewsList />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;