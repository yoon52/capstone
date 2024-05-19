
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/product.css';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Header from '../header/Header';
import serverHost from '../../utils/host';

function AddProducts() {
  const userId = sessionStorage.getItem('userId');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null); // 이미지 파일 상태 추가
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [, setSearchError] = useState('');

  const searchInputRef = useRef(null);
  const [, setShowRecentSearches] = useState(false);

  const navigate = useNavigate();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    // 엔터키 입력 감지
    if (event.key === 'Enter') {
      event.preventDefault(); // 기본 엔터키 동작 방지
      // 현재 설명값에 엔터키 추가하여 설정
      setDescription(prevDescription => prevDescription + '\n');
    } else {
      // 엔터키가 아닌 경우에는 설명값 업데이트
      setDescription(event.target.value);
    }
  };


  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);
    // Preview image
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedImage);
  };

  const handleAddProduct = async (event) => {
    event.preventDefault(); // 폼 제출의 기본 동작 방지

    // 상품 추가 요청
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('image', image); // 이미지 파일 추가

      const response = await fetch(`${serverHost}:4000/addProduct`, {
        method: 'POST',
        headers: {
          'user_id': userId,
        },
        body: formData,
      });

      if (response.ok) {
        // 상품 추가 성공 시 폼 초기화
        setName('');
        setDescription('');
        setPrice('');
        setImage(null); // 이미지 파일 초기화
        // 상품 추가 후 메인 페이지로 이동
        navigate('/Main');
        console.log('상품이 추가되었습니다.');
      } else {
        // 상품 추가 실패 시 오류 메시지 출력
        console.error('상품 추가 실패:', response.statusText);
      }
    } catch (error) {
      // 네트워크 오류 등의 문제 발생 시 오류 메시지 출력
      console.error('상품 추가 오류:', error);
    }
  };

  const handleSearchProduct = async () => {
    if (!searchTerm) {
      setSearchError('검색어를 입력하세요.');
      console.log('touch'); // 검색 인풋창 클릭시 "touch"를 콘솔에 출력
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

        // Navigate to the search results page
        navigate(`/searchResultsP/${encodeURIComponent(searchTerm)}`);

      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    }
    // 검색어가 유효할 때 콘솔에 검색어 출력
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
      <div className="main-container">
        <h2>상품등록 페이지</h2>
        <form onSubmit={handleAddProduct}>
          <div className="image-upload">
            <label htmlFor="imageInput">
              {imagePreview ? (
                <img src={imagePreview} alt="Product Preview" className="preview-image" />
              ) : (
                <div className="no-image-preview">
                  <CameraAltIcon fontSize="large" />
                  <span>이미지를 선택하세요</span>
                </div>
              )}
            </label>
            <input type="file" onChange={handleImageChange} id="imageInput" accept="image/*" style={{ display: 'none' }} />
          </div>

          <div className="form-group">
            <label htmlFor="name">상품명 :</label>
            <input type="text" placeholder="상품명" value={name} onChange={handleNameChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">설명 :</label>
            <textarea
              id="description"
              placeholder="설명"
              value={description}
              onChange={handleDescriptionChange}
            />
            <label htmlFor="price">가격 :</label>
            <input type="text" placeholder="가격" value={price} onChange={handlePriceChange} required />
          </div>
          <button type="submit" className="add-product-button">추가</button>
        </form>
      </div>
    </div>
  );
}

export default AddProducts;