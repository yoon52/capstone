import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import FindId from '../components/auth/FindId';
import FindPw from '../components/auth/FindPw';
import NaverLogin from '../components/auth/NaverLogin';
import NaverCallback from '../components/auth/NaverCallback';
import KakaoLogin from '../components/auth/KakaoLogin';
import KakaoCallback from '../components/auth/KakaoCallback';
import Main from '../components/auth/Main';
import SearchKeyword from '../components/auth/SearchKeyword';
import AddProducts from '../components/auth/AddProducts';
import ProductDetail from '../components/auth/ProductDetail';
import ProductManagement from '../components/auth/ProductManagement';
import MyInfo from '../components/auth/MyInfo';
import PasswordChange from '../components/auth/PasswordChange';


import '../styles/main.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/FindId" element={<FindId />} />
          <Route path="/FindPw" element={<FindPw />} />
          <Route path="/Naverlogin" element={<NaverLogin />} />
          <Route path="/NaverCallback" element={<NaverCallback />} />
          <Route path="/Kakaologin" element={<KakaoLogin />} />
          <Route path="/KakaoCallback" element={<KakaoCallback />} />
          <Route path="/Main/*" element={<Main />} />
          <Route path="/SearchKeyword" element={<SearchKeyword />} />
          <Route path="/AddProducts" element={<AddProducts />} />
          <Route path="/ProductDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
          <Route path="/MyInfo" element={<MyInfo />} />
          <Route path="/ChangePw" element={<PasswordChange />} />

          {/* 다른 페이지 라우팅을 추가할 수 있습니다 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;