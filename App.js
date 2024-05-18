import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import FindId from '../components/auth/FindId';
import FindPw from '../components/auth/FindPw';
import Main from '../components/auth/Main';
import AdminPage from '../components/auth/AdminPage';
import SearchKeyword from '../components/auth/SearchKeyword';
import SearchResults from '../components/auth/SearchResults';
import AddProducts from '../components/auth/AddProductsPage';
import ProductDetail from '../components/auth/ProductDetail';
import ProductList from '../components/auth/ProductList';
import LatestList from '../components/auth/LatestList';
import DetailList from '../components/auth/DetailList';
import Detail from '../components/auth/Detail';
import ProductManagement from '../components/auth/ProductManagement';
import MyInfo from '../components/auth/MyInfo';
import ChangePw from '../components/auth/ChangePw';
import ChatListComponent from '../components/auth/ChatListComponent';
import ChatModal from '../components/auth/ChatModal';
import { CheckoutPage } from '../components/auth/Checkout';
import { SuccessPage } from '../components/auth/Success';
import { FailPage } from '../components/auth/Fail';
import ShowWishlist from '../components/auth/ShowWishlist';
import Payments from '../components/auth/Payments';
import '../styles/main.css';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/FindId" element={<FindId />} />
          <Route path="/FindPw" element={<FindPw />} />
          <Route path="/Main/*" element={<Main />} />
          <Route path="/AdminPage" element={<AdminPage />} />
          <Route path="/SearchKeyword" element={<SearchKeyword />} />
          <Route path="/SearchResults" element={<SearchResults />} />
          <Route path="/searchResultsP/:searchTerm" element={<SearchResults />} />
          <Route path="/AddProducts" element={<AddProducts />} />
          <Route path="/ProductDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
          <Route path="/ProductList" element={<ProductList />} />
          <Route path="/LatestList" element={<LatestList />} />
          <Route path="/DetailList" element={<DetailList />} />
          <Route path="/Detail" element={<Detail />} />
          <Route path="/MyInfo" element={<MyInfo />} />
          <Route path="/ChangePw" element={<ChangePw />} />
          <Route path="/ChatListComponent" element={<ChatListComponent />} />
          <Route exact path="/chat/:roomId" component={ChatModal} />
          <Route path="/ShowWishlist" element={<ShowWishlist />} />
          <Route path="/sandbox" element={<CheckoutPage />} />
          <Route path="/sandbox/success" element={<SuccessPage />} />
          <Route path="/sandbox/fail" element={<FailPage />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;