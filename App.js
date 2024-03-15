import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import IdFind from '../components/auth/IdFind';
import PwFind from '../components/auth/PwFind';
import NaverLogin from '../components/auth/NaverLogin';
import NaverCallback from '../components/auth/NaverCallback';
import KakaoLogin from '../components/auth/KakaoLogin';
import KakaoCallback from '../components/auth/KakaoCallback';
import Main from '../components/auth/Main';
import SearchKeywordPage from '../components/auth/SearchKeywordPage';
import AddProducts from '../components/auth/AddProducts';
import ProductDetail from '../components/auth/ProductDetail';
import ProductManagement from '../components/auth/ProductManagement';
import '../styles/main.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/IdFind" element={<IdFind />} />
          <Route path="/PwFind" element={<PwFind />} />
          <Route path="/Naverlogin" element={<NaverLogin />} />
          <Route path="/NaverCallback" element={<NaverCallback />} />
          <Route path="/Kakaologin" element={<KakaoLogin />} />
          <Route path="/KakaoCallback" element={<KakaoCallback />} />
          <Route path="/Main/*" element={<Main />} />
          <Route path="/search-keyword" element={<SearchKeywordPage />} />
          <Route path="/AddProducts" element={<AddProducts />} />
          <Route path="/productDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
          {/* 다른 페이지 라우팅을 추가할 수 있습니다 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;