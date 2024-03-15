import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../components/auth/Login'; // 상대 경로 수정
import NaverLogin from '../components/auth/NaverLogin';
import NaverCallback from '../components/auth/NaverCallback';
import Signup from '../components/auth/Signup'; // 상대 경로 수정
import Main from '../components/auth/Main';
import AddProducts from '../components/auth/AddProducts';
import ProductDetail from '../components/auth/ProductDetail'; // 상품 상세보기 컴포넌트 경로 추가
import SearchKeywordPage from '../components/auth/SearchKeywordPage';
import ProductManagement from '../components/auth/ProductManagement';
import IdFind from '../components/auth/IdFind';
import PwFind from '../components/auth/PwFind';
import MyInfo from '../components/auth/MyInfo';
import '../styles/main.css'; // 상대 경로 수정

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} /> {/* Route 컴포넌트 수정 */}
          <Route path="/signup" element={<Signup />} /> {/* Route 컴포넌트 수정 */}
          <Route path="/Naverlogin" element={<NaverLogin />} />
          <Route path="/NaverCallback" element={<NaverCallback />} />
          <Route path="/Main/*" element={<Main />} /> {/* Route 컴포넌트 수정 */}
          <Route path="/search-keyword" element={<SearchKeywordPage />} />
          <Route path="/AddProducts" element={<AddProducts />} />
          <Route path="/productDetail/:productId" element={<ProductDetail />} /> {/* 상품 상세보기 라우트 */}
          <Route path="/ProductManagement" element={<ProductManagement />} />
          <Route path="/IdFind" element={<IdFind />} />
          <Route path="/PwFind" element={<PwFind/>} />
          <Route path="/MyInfo" element={<MyInfo/>} />

          {/* 다른 페이지 라우팅을 추가할 수 있습니다 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;