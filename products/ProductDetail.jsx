
/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Modal as MuiModal, Menu, MenuItem, IconButton } from '@mui/material';
import { MoreVert, Favorite, FavoriteBorder } from '@mui/icons-material';
import Modal from 'react-modal';
import CloseIcon from '@mui/icons-material/Close';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatComponent from '../messages/ChatComponent';
import '../../styles/product.css';
import Header from '../header/Header';
import DetailList from './DetailList';
import serverHost from '../../utils/host';
import swal from 'sweetalert';

import Footer from '../auth/Footer';

Modal.setAppElement('#root');

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatRooms] = useState([]);
  const userId = sessionStorage.getItem('userId');
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [, setSearchError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [, setFilteredProducts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false); // 추가: 찜 상태
  const [sellerId, setSellerId] = useState(null); // 판매자 ID 상태
  const [sellerName, setSellerName] = useState(null); // 판매자 ID 상태
  const [rates, setRates] = useState(null); // 판매자 ID 상태
  const [barLength, setBarLength] = useState(0);

  // React 코드에서 수정된 부분
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        // 서버에서 찜 상태 확인
        const favoriteResponse = await fetch(`${serverHost}:4000/products/isFavorite/${userId}/${productId}`);
        if (favoriteResponse.ok) {
          const { isFavorite } = await favoriteResponse.json();
          setIsFavorite(isFavorite);
        } else {
          console.error('찜 상태 확인 실패:', favoriteResponse.status);
        }
      } catch (error) {
        console.error('찜 상태 확인 오류:', error);
      }
    };

    fetchFavoriteStatus();
  }, [productId, userId]);



  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch(`${serverHost}:4000/products/seller/${productId}`);
        if (response.ok) {
          const data = await response.json();
          // 여기서 받아온 데이터는 sellerId가 될 것입니다.
          setSellerId(data.sellerId); // 판매자 ID를 상태에 설정
          setSellerName(data.sellerName); // 판매자 ID를 상태에 설정
          setRates(data.rates); // 판매자 rates를 상태에 설정

        } else {
          console.error('판매자 정보 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('판매자 정보 가져오기 오류:', error);
      }
    };

    fetchSellerInfo();
  }, [productId]);

  useEffect(() => {
    // rates 값이 변경될 때마다 막대기 길이 업데이트
    if (rates !== null) {
      const ratesValue = parseFloat(rates);
      const newBarLength = (ratesValue / 4.5) * 100;
      setBarLength(newBarLength);
    }
  }, [rates]);


  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`${serverHost}:4000/products/detail/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);

          // 서버에서 찜 상태 확인

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

  const handleChatButtonClick = async () => {
    try {
      const response = await fetch(`${serverHost}:4001/api/chat-rooms?productId=${productId}&userId=${userId}`);
      if (response.ok) {
        const existingChatRoom = await response.json();
        if (existingChatRoom) {
          setIsChatModalOpen(true);
          return;
        }
      }

      const createResponse = await fetch(`${serverHost}:4001/api/chat-rooms`, {
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
      // 본인의 게시물인지 확인
      if (userId === product.user_id) {
        swal({
          title: "찜 실패",
          text: "본인의 게시물은 찜할 수 없습니다.",
          icon: "error",
          buttons: '확인'
        });
        return;
      }

      // 서버에 찜 상태 토글 요청
      const response = await fetch(`${serverHost}:4000/products/toggleFavorite/${productId}`, {
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

  const handleShowMyInfoPage = () => {
    navigate('/MyInfo');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    localStorage.removeItem('userId');
    navigate('/Login');
  };

  const handleShowChatList = () => {
    navigate('/ChatListComponent');
  };

  const handleShowWishlist = () => {
    navigate('/ShowWishlist');
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
    const diffMinutes = Math.floor(diffTime / (1000 * 60)); // milliseconds to minutes

    if (diffMinutes < 30) {
      return '방금 전';
    } else if (diffMinutes < 60 * 24) {
      return `${Math.floor(diffMinutes / 60)}시간 전`;
    } else if (diffMinutes < 60 * 24 * 7) {
      return `${Math.floor(diffMinutes / (60 * 24))}일 전`;
    } else if (diffMinutes < 60 * 24 * 30) {
      return `${Math.floor(diffMinutes / (60 * 24 * 7))}주 전`;
    } else {
      return '한달 ↑';
    }
  };

  const handleDelete = async () => {
    if (userId !== product.user_id) { // userId와 상품의 작성자 ID 비교
      swal("작성자만 삭제할 수 있습니다!", "", "error");
      return;
    }

    // 작성자인 경우, 정말 삭제할 것인지 확인하는 메시지 표시
    const confirmed = await swal({
      title: "정말 삭제하시겠습니까?",
      text: "한 번 삭제된 데이터는 복구할 수 없습니다.",
      icon: "warning",
      buttons: {
        cancel: "취소",
        confirm: "확인"
      },
    });

    if (confirmed) {
      try {
        const response = await fetch(`${serverHost}:4000/productsmanage/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'user_id': userId // 사용자 ID를 헤더에 포함하여 서버로 전송
          }
        });

        if (response.ok) {
          // 삭제가 성공적으로 처리된 경우에 대한 처리
          swal("상품이 삭제되었습니다.", "", "success")
          // 메인 페이지로 이동
          navigate('/Main');
        } else {
          console.error('상품 삭제 오류:', response.status);
        }
      } catch (error) {
        console.error('상품 삭제 오류:', error);
      }
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

  const getBarColorClass = (rates) => {
    const ratesValue = parseFloat(rates);
    if (ratesValue >= 0 && ratesValue < 1.0) {
      return 'bar-color-01'; // 빨간색
    } else if (ratesValue >= 1.0 && ratesValue < 2.0) {
      return 'bar-color-02'; // 주황색
    } else if (ratesValue >= 2.0 && ratesValue < 3.0) {
      return 'bar-color-03'; // 연두색
    } else if (ratesValue >= 3.0 && ratesValue < 4.0) {
      return 'bar-color-04'; // 파란색
    } else if (ratesValue >= 4.0 && ratesValue <= 4.5) {
      return 'bar-color-05'; // 남색
    } else {
      return ''; // 기본 색상
    }
  };

  const handleEdit = () => {
    // 만약 현재 사용자가 상품의 작성자가 아니라면 수정할 수 없음
    if (userId !== product.user_id) {
      swal("작성자만 수정할수있습니다!", "", "error")
      return;
    }

    // 작성자인 경우, 상품 수정 페이지로 이동
    navigate(`/ProductManagementForm/${product.id}`);
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
        onSearchSubmit={handleSearchProduct}
        recentSearches={[]}
      />

      <div className="product-detail">
        <div style={{ display: 'flex', width: '100%' }}>
          <a href={`${serverHost}:4000/uploads/${product.image}`} target="_blank" rel="noopener noreferrer">
            <img
              className="product-d-image"
              src={`${serverHost}:4000/uploads/${product.image}`}
              alt={product.name}
            />
          </a>
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
              {isFavorite ? <Favorite style={{ color: 'red' }} /> : <FavoriteBorder />}
              {isFavorite ? '찜해제' : '찜하기'}
            </Button>
            <Button onClick={handleChatButtonClick} className="chat-button">채팅하기</Button>
            <IconButton onClick={handleClick} className="more-button"><MoreVert /></IconButton> {/* 케밥 아이콘 */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleEdit}>수정하기</MenuItem>
              <MenuItem onClick={handleDelete}>삭제하기</MenuItem>
            </Menu>
          </div>
        </div>
        <div className="product-d-description-container">
          <p className="product-d-description-header">상품정보</p>
          {/* 설명칸의 내용을 div 태그로 감싸고 내용을 개행 문자(\n)를 기준으로 분할하여 각각의 div로 렌더링 */}
          {product.description.split('\n').map((line, index) => (
            <div key={index} className="product-d-description">{line}</div>
          ))}
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
          }}>
          <div>
            <ChatComponent chatRooms={chatRooms} onSendMessage={handleSendMessage} />
            <IconButton onClick={() => setIsChatModalOpen(false)} className="close-button">
              <CloseIcon />
            </IconButton>
          </div>
        </MuiModal>
        <section id="article-profile">
          <div className="seller-profile">
            <div>
              <div className="profileimage-container">
                <img
                  src="https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png"
                  className="rounded-image"
                  alt="Profile"
                />
              </div>
              <div className="article-profile-left">
                <div className="space-between">
                  <p>학번: {sellerId}</p>
                </div>
                <p>이름: {sellerName}</p>
              </div>
            </div>
            <div id="article-profile-right">
              <dl id="temperature-wrap">
                <dt>매너학점</dt>
                <dd className="text-color-03">
                  {rates}
                </dd>
              </dl>
              <div className={`meters ${getBarColorClass(rates)}`}>
                <div className={`bar ${getBarColorClass(rates)}`} style={{ width: `${barLength}%` }}></div>
              </div>
              <div className="face face-03"></div>
            </div>
          </div>
        </section>
        <div className="product-list">
          <DetailList currentProductId={product.id} />
        </div>
      </div>
      <Footer /> {/* Add Footer component here */}
    </div>
  );
};

export default ProductDetail;