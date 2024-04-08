import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Routes, Route, useParams, Link } from 'react-router-dom';
import Modal from 'react-modal';
import { Card, CardContent, CardMedia, Typography, Button, Modal as MuiModal } from '@mui/material';
import ChatComponent from './ChatComponent';
import '../../styles/product.css';
import Header from './Header';

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
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`http://localhost:4000/products/detail/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.error('상품 상세 정보 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('상품 상세 정보 가져오기 오류:', error);
      }
    };

    fetchProductDetail();
  }, [productId]);

  useEffect(() => {
    sessionStorage.setItem('productId', productId);
  }, [productId]);

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
        />
    
    <div className="product-detail" style={{ width: '100%', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', height: '100%' }}>
  <Card sx={{ display: 'flex', width: '100%' }}>

        <CardMedia
          component="img"
          sx={{ width: '25%', objectFit: 'cover' }}
          src={`http://localhost:4000/uploads/${product.image}`}
          alt={product.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            상품정보: {product.description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            가격: {product.price}원
          </Typography>
          <Typography variant="body2" color="text.secondary">
            등록일: {new Date(product.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            조회수: {product.views}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            판매상태: {availability}
          </Typography>
          <Button onClick={handleChatButtonClick} variant="contained">채팅하기</Button>
        </CardContent>
      </Card>
      <MuiModal
        open={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        BackdropProps={{ style: { backgroundColor: 'rgba(255, 255, 255, 0.5)' } }} // 모달 배경색 투명도 조정
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // 모달 내부 배경색 조정
          backdropFilter: 'blur(5px)', // 배경에 블러 효과 추가
          border: 'none', // 테두리 제거
          boxShadow: 24, // 그림자 추가
          p: 4, // 내부 패딩 추가
          borderRadius: 2, // 모달 테두리 둥글게 조정
        }}
      >
        <div>
          <ChatComponent chatRooms={chatRooms} onSendMessage={handleSendMessage} />
          <Button onClick={() => setIsChatModalOpen(false)}>닫기</Button>
        </div>
      </MuiModal>
      <Link to="/Main">메인으로 돌아가기</Link>
    </div>
    </div>
  );
};

export default ProductDetail;
