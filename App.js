import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AdminPage from '../components/auth/AdminPage';
import Login from '../components/auth/Login';
import Main from '../components/auth/Main';
import Report from '../components/auth/Report';
import ReportList from '../components/auth/ReportList';
import Signup from '../components/auth/Signup';

import SearchKeyword from '../components/header/SearchKeyword';
import SearchResults from '../components/header/SearchResults';

import ChatListComponent from '../components/messages/ChatListComponent';
import ChatModal from '../components/messages/ChatModal';

import AddProducts from '../components/products/AddProductsPage';
import ChangePw from '../components/products/ChangePw';
import { CheckoutPage } from '../components/products/Checkout';
import Detail from '../components/products/Detail';
import DetailList from '../components/products/DetailList';
import { FailPage } from '../components/products/Fail';
import LatestList from '../components/products/LatestList';
import Payments from '../components/products/Payments';
import ProductDetail from '../components/products/ProductDetail';
import ProductList from '../components/products/ProductList';
import ProductManagement from '../components/products/ProductManagement';
import ProductManagementForm from '../components/products/ProductManagementForm';
import ShowWishlist from '../components/products/ShowWishlist';
import { SuccessPage } from '../components/products/Success';

import FindId from '../components/profile/FindId';
import FindPw from '../components/profile/FindPw';
import MyInfo from '../components/profile/MyInfo';

import '../styles/main.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/AdminPage" element={<AdminPage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Main/*" element={<Main />} />
          <Route path="/Report" element={<Report />} />
          <Route path="/ReportList" element={<ReportList />} />
          <Route path="/Signup" element={<Signup />} />

          <Route path="/SearchKeyword" element={<SearchKeyword />} />
          <Route path="/SearchResults" element={<SearchResults />} />
          <Route path="/SearchResultsP/:searchTerm" element={<SearchResults />} />

          <Route path="/ChatListComponent" element={<ChatListComponent />} />
          <Route exact path="/chat/:roomId" element={<ChatModal />} />

          <Route path="/AddProducts" element={<AddProducts />} />
          <Route path="/ChangePw" element={<ChangePw />} />
          <Route path="/Detail" element={<Detail />} />
          <Route path="/ProductDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
          <Route path="/ProductManagementForm/:productId" element={<ProductManagementForm />} />
          <Route path="/ProductList" element={<ProductList />} />
          <Route path="/LatestList" element={<LatestList />} />
          <Route path="/Detail" element={<Detail />} />
          <Route path="/DetailList" element={<DetailList />} />
          <Route path="/ShowWishlist" element={<ShowWishlist />} />
          
          <Route path="/sandbox" element={<CheckoutPage />} />
          <Route path="/sandbox/success" element={<SuccessPage />} />
          <Route path="/sandbox/fail" element={<FailPage />} />
          <Route path="/payments" element={<Payments />} />

          <Route path="/MyInfo" element={<MyInfo />} />
          <Route path="/FindId" element={<FindId />} />
          <Route path="/FindPw" element={<FindPw />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;