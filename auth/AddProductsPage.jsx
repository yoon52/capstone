import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/product.css';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Header from './Header';

function AddProducts() {
  const userId = sessionStorage.getItem('userId');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSearchTerm, setSavedSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [searchError, setSearchError] = useState('');
  const searchInputRef = useRef(null);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const navigate = useNavigate();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setDescription(prevDescription => prevDescription + '\n');
    } else {
      setDescription(event.target.value);
    }
  };

  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
      setImage(selectedImage);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      // 이미지가 선택되지 않은 경우
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('image', image);

      const response = await fetch('http://localhost:4000/addProduct', {
        method: 'POST',
        headers: {
          'user_id': userId,
        },
        body: formData,
      });

      if (response.ok) {
        setName('');
        setDescription('');
        setPrice('');
        setImage(null);
        navigate('/Main');
        alert('상품이 추가되었습니다.');
      } else {
        console.error('상품 추가 실패:', response.statusText);
      }
    } catch (error) {
      console.error('상품 추가 오류:', error);
    }
  };

  const handleSearchProduct = async () => {
    if (!searchTerm) {
      setSearchError('검색어를 입력하세요.');
      console.log('touch');
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

        navigate(`/searchResultsP/${encodeURIComponent(searchTerm)}`);
      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    }
    console.log("검색어:", searchTerm);
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
        setShowRecentSearches={setShowRecentSearches}
        userInfo
        onSearchSubmit={handleSearchProduct}
        recentSearches={[]}
      />
      <div className="add-container">
        <form onSubmit={handleAddProduct}>
          <div className="image-upload">
            <label htmlFor="image" style={{ marginBottom: '10px' }}>상품 이미지</label>
            <label htmlFor="imageInput">
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Product Preview" className="preview-image" />
                </div>
              ) : (
                <div className="no-image-preview">
                  <CameraAltIcon fontSize="large" />
                  <span>이미지 등록</span>
                </div>
              )}
            </label>
            <input type="file" onChange={handleImageChange} id="imageInput" accept="image/*" style={{ display: 'none' }} />
          </div>

          <div className="form-group">
            <label htmlFor="name" style={{ marginTop: '30px' }}>상품명</label>
            <input type="text" placeholder="상품명을 입력해 주세요." value={name} onChange={handleNameChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="description" style={{ marginTop: '30px' }}>설명</label>
            <textarea
              id="description"
              placeholder={"브랜드, 모델명, 구매시기, 하자 유무 등 상품 설명을 최대한 자세히 적어주세요.\n전화번호, SNS 계정 등 개인정보 입력은 제한될 수 있습니다."}
              value={description}
              onChange={handleDescriptionChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">가격</label>
            <div className="price-input">
              <input type="price" placeholder="가격을 입력해 주세요." value={price} onChange={handlePriceChange} required />
              <span>원</span>
            </div>
          </div>
          <button type="submit" className="add-product-button">추가</button>
        </form>
      </div>
    </div>
  );
}

export default AddProducts;