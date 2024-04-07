import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddProducts from '../components/auth/AddProducts';
import AdminPage from '../components/auth/AdminPage';
import ChangePw from '../components/auth/ChangePw';
import ChatListComponent from '../components/auth/ChatListComponent';
import ChatModal from '../components/auth/ChatModal';
import FindId from '../components/auth/FindId';
import FindPw from '../components/auth/FindPw';
import KakaoCallback from '../components/auth/KakaoCallback';
import KakaoLogin from '../components/auth/KakaoLogin';
import Login from '../components/auth/Login';
import Main from '../components/auth/Main';
import MyInfo from '../components/auth/MyInfo';
import NaverCallback from '../components/auth/NaverCallback';
import NaverLogin from '../components/auth/NaverLogin';
import ProductDetail from '../components/auth/ProductDetail';
import ProductManagement from '../components/auth/ProductManagement';
import SearchKeyword from '../components/auth/SearchKeyword';
import Signup from '../components/auth/Signup';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/AddProducts" element={<AddProducts />} />
          <Route path="/AdminPage" element={<AdminPage />} />
          <Route path="/ChangePw" element={<ChangePw />} />
          <Route path="/ChatListComponent" element={<ChatListComponent />} />
          <Route exact path="/chat/:roomId" component={ChatModal} />
          <Route path="/FindId" element={<FindId />} />
          <Route path="/FindPw" element={<FindPw />} />
          <Route path="/Kakaologin" element={<KakaoLogin />} />
          <Route path="/KakaoCallback" element={<KakaoCallback />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Main/*" element={<Main />} />
          <Route path="/MyInfo" element={<MyInfo />} />
          <Route path="/Naverlogin" element={<NaverLogin />} />
          <Route path="/NaverCallback" element={<NaverCallback />} />
          <Route path="/ProductDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
          <Route path="/SearchKeyword" element={<SearchKeyword />} />
          <Route path="/Signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;