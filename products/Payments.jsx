import React, { useState, useEffect, useRef } from 'react';
import { Container, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import serverHost from '../../utils/host';

import '../../styles/payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = sessionStorage.getItem('userId');
  const navigate = useNavigate();
  const [, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [, setSearchError] = useState('');

  const searchInputRef = useRef(null);
  const [, setShowRecentSearches] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`${serverHost}:4000/payments/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        const data = await response.json();
        setPayments(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching payments:', error.message);
      }
    };
    fetchPayments();
  }, [userId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
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


  return (
    <div className='container-main'>
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
        setShowRecentSearches={setShowRecentSearches} // setShowRecentSearches 함수 전달
        userInfo // 사용자 정보 추가

      />
      <Container className="container">
        <h1 className="my-4">결제 내역</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>상품명</th>
                <th>주문 번호</th>
                <th>금액</th>
                <th>일시</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.productName}</td>
                  <td>{payment.orderId}</td>
                  <td>{payment.amount.toLocaleString()}원</td>
                  <td>{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </div>
  );
};

export default Payments;