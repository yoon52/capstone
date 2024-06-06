import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Spinner, Row, Col } from 'react-bootstrap';
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
        setIsLoading(false);
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
      console.log('touch');
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
        setShowRecentSearches={setShowRecentSearches}
      />
      <Container className="my-4">
        <h1 className="mb-4">구매 내역</h1>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Row>
            {payments.map((payment) => (
              <Col md={6} lg={3} key={payment.id} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{payment.productName}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">주문 번호: {payment.orderId}</Card.Subtitle>
                    <Card.Text>금액: {parseInt(payment.amount).toLocaleString()}원</Card.Text>
                    <Card.Text>일시: {formatDate(payment.createdAt)}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

    </div>
  );
};

export default Payments;