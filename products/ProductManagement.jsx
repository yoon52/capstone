import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import serverHost from '../../utils/host';
import Header from '../header/Header';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [, setShowRecentSearches] = useState(false);
  const [, setFormattedProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${serverHost}:4000/productsmanage`, {
        headers: {
          'user_id': sessionStorage.getItem('userId')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('상품 목록 가져오기 오류:', response.status);
      }
    } catch (error) {
      console.error('상품 목록 가져오기 오류:', error);
    }
  };





  const handleAddProduct = () => {
    navigate('/AddProducts');
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
    navigate('/Login');
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

  useEffect(() => {
    const formatDate = (createdAt) => {
      const currentTime = new Date();
      const productTime = new Date(createdAt);
      const timeDifference = Math.floor((currentTime - productTime) / (1000 * 60)); // milliseconds to minutes

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

    const formatted = products.map(product => ({
      ...product,
      formattedCreatedAt: formatDate(product.createdAt),
    }));
    setFormattedProducts(formatted);
  }, [products]);


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
      <div className='h2-font'>
        <h2>내가 등록한 상품</h2>
        <div className="cards-wrap1">
          {products.map((product) => (
            <article className="card-top" key={product.id}>
              <a className="card-link-1" href={`/ProductManagementForm/${product.id}`} data-event-label={product.id}>
                <div className="card-photo">
                  <img
                    src={`${serverHost}:4000/uploads/${product.image}`}
                    alt={product.title}
                  />
                </div>
                <div className="card-desc">
                  <h2 className="card-title">{product.name}</h2>
                  <div className="card-price">{product.price}원</div>
                  
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
      {searchError && (
        <p className="search-error">{searchError}</p>
      )}
    </div>
  );
}

export default ProductManagement;