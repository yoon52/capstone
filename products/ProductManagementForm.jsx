/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../../styles/product.css';
import Header from '../header/Header';
import serverHost from '../../utils/host';

Modal.setAppElement('#root');

const ProductManagementForm = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [, setSearchError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [, setFilteredProducts] = useState([]);
  const [editedProduct, setEditedProduct] = useState(null);
  const [, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`${serverHost}:4000/productsD/${productId}`, {
          headers: {
            'user_id': sessionStorage.getItem('userId')
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setEditedProduct({ ...data });
        } else {
          console.error('상품 정보 가져오기 오류:', response.status);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('상품 정보 가져오기 오류:', error);
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);
  useEffect(() => {
    sessionStorage.setItem('productId', productId);
  }, [productId]);

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

        navigate(`/SearchResultsP/${encodeURIComponent(searchTerm)}`);
      } else {
        console.error('Search error:', response.status);
      }
    } catch (error) {
      console.error('Search error:', error);
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm, userId }),
      });
      if (!response.ok) {
        console.error('Error saving search term:', response.status);
      }
    } catch (error) {
      console.error('Error saving search term:', error);
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
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

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

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`${serverHost}:4000/productsmanage/${editedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user_id': sessionStorage.getItem('userId')
        },
        body: JSON.stringify(editedProduct)
      });
      if (response.ok) {
        setProduct(editedProduct);
        alert('상품이 성공적으로 업데이트되었습니다.');
        navigate('/ProductManagement')
      } else {
        console.error('상품 업데이트 오류:', response.status);
        alert('상품 업데이트 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('상품 업데이트 오류:', error);
      alert('상품 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
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

      <div className="product-manage">
        <div style={{ display: 'flex', width: '100%' }}>
          <img
            className="product-m-image"
            src={`${serverHost}:4000/uploads/${editedProduct.image}`}
            alt={editedProduct.name}
          />
          <div className="product-content">
            <input
              type="text"
              className="product-m-name"
              name="name"
              value={editedProduct.name}
              onChange={handleInputChange}
            />
            <p className="product-m-price">
              <input
                type="number"
                style={{ fontSize: '40px', fontWeight: 450 }}
                name="price"
                value={editedProduct.price}
                onChange={handleInputChange}
              />원
            </p>
            <div className="product-info" style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
              <p className="product-m-views">
                <VisibilityIcon sx={{ fontSize: 20, marginRight: 0.5, marginBottom: -0.3 }} />
                {editedProduct.views}
              </p>
              <span>|</span>
              <p className="product-m-date">{calculateTimeAgo(editedProduct.createdAt)}</p>
              <span>|</span>
              <p className="product-m-availability">{availability}</p>
            </div>
          </div>
        </div>
        <div className="product-m-description-container">
          <p className="product-m-description-header">상품정보</p>
          <textarea
            className="product-m-description"
            name="description"
            value={editedProduct.description}
            onChange={handleInputChange}
            rows={10}
          />
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : '수정'}
        </button>
      </div>
    </div>
  );
};

export default ProductManagementForm;
