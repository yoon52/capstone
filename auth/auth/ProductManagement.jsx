import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/product.css';
import logo from '../../image/logo.png';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
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
        alert('상품이 삭제되었습니다.');
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
        alert('수정이 완료되었습니다.');
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
    navigate(`/ProductDetail/${productId}`);
  };

  return (
    <div>
      <a href="/Main">
        <img src={logo} id='logo' alt="로고" />
      </a>
      <h1 className="product-management-header">상품 관리</h1>
      <div className="product-management-container">
        <ul className="management-list">
          {products.map(product => (
            <li key={product.id} className="management-item">
              {selectedProduct === product ? (
                <>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                  <input
                    type="text"
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  />
                  <input
                    type="text"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />
                  <button className="product-save" onClick={handleSaveEdit}>확인</button>
                  <button className="product-cancel" onClick={() => setSelectedProduct(null)}>취소</button>
                  <button className="product-delete" onClick={() => handleDeleteProduct(product.id)}>삭제</button>
                </>
              ) : (
                <>
                  <span className="management-text" onClick={() => navigateToProductDetail(product.id)}>{product.name}</span>
                  <button className="product-edit" onClick={() => handleEditProduct(product)}>수정</button>
                  {product.status !== '판매완료' && <button className="product-sell" onClick={() => handleSellProduct(product.id)}>판매완료</button>}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProductManagement;
