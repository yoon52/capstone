import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import '../../styles/product.css';
import logo from '../../image/logo.png';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // 메뉴의 anchor 요소

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:4000/productsmanage`, {
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:4000/productsmanage/${productId}`, {
        method: 'DELETE',
        headers: {
          'user_id': sessionStorage.getItem('userId')
        }
      });
      if (response.ok) {
        setProducts(products.filter(product => product.id !== productId));
      } else {
        console.error('상품 삭제 오류:', response.status);
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditingProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:4000/productsmanage/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user_id': sessionStorage.getItem('userId')
        },
        body: JSON.stringify(editingProduct)
      });
      if (response.ok) {
        setProducts(products.map(product => (product.id === editingProduct.id ? editingProduct : product)));
        setSelectedProduct(null);
        setEditingProduct(null);
        setIsModalOpen(false);
      } else {
        console.error('상품 수정 실패:', response.status);
      }
    } catch (error) {
      console.error('상품 수정 실패:', error);
    }
  };

  const handleSellProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:4000/productsmanage/sold/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user_id': sessionStorage.getItem('userId')
        }
      });
      if (response.ok) {
        setProducts(products.map(product => (product.id === productId ? { ...product, status: '판매완료' } : product)));
        alert('상품이 판매되었습니다.');
      } else {
        console.error('상품 판매완료 처리 실패:', response.status);
      }
    } catch (error) {
      console.error('상품 판매완료 처리 실패:', error);
    }
  };

  const navigateToProductDetail = (productId) => {
    navigate(`/productDetail/${productId}`);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <a href="/main">
        <img src={logo} id='logo' alt="로고" />
      </a>
      <h1 className="product-management-header">상품 관리</h1>
      <div className="product-management-container">
        <table className="product-management-table">
          <thead>
            <tr>
              <th>상품명</th>
              <th>설명</th>
              <th>가격</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td onClick={() => navigateToProductDetail(product.id)}>{product.name}</td>
                <td className="description-cell">
                  <div className="description-content" title={product.description}>
                    {product.description.length > 18 ? `${product.description.slice(0, 18)}...` : product.description}
                  </div>
                </td>
                <td>{product.price}</td>
                <td>{product.status === 'available' ? '판매중' : product.status}</td>

                <td>
                  <IconButton onClick={handleClick} >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => handleEditProduct(product)}>수정</MenuItem>
                    <MenuItem onClick={() => handleDeleteProduct(product.id)}>삭제</MenuItem>
                    {product.status !== '판매완료' && (
                      <MenuItem onClick={() => handleSellProduct(product.id)}>판매완료</MenuItem>
                    )}
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="manage-modal">
          <div className="manage-modal-content">
            <label htmlFor="name">상품명:</label>
            <input
              id="name"
              type="text"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
            />
            <label htmlFor="description">설명:</label>
            <input
              id="description"
              type="text"
              value={editingProduct.description}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
            />
            <label htmlFor="price">가격:</label>
            <input
              id="price"
              type="text"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
            />
            <button onClick={handleSaveEdit}>수정하기</button>
            <button onClick={() => setIsModalOpen(false)}>수정 취소</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;