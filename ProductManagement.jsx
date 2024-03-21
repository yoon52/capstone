import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/main.css';
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
      } else {
        console.error('상품 수정 실패:', response.status);
      }
    } catch (error) {
      console.error('상품 수정 실패:', error);
    }
  };

  const navigateToProductDetail = (productId) => {
    navigate(`/productDetail/${productId}`);
  };

  return (
    <div><img src={logo} id='logo' alt="로고" />
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
                <button onClick={handleSaveEdit}>확인</button>
                <button onClick={() => setSelectedProduct(null)}>취소</button>
                <button onClick={() => handleDeleteProduct(product.id)}>삭제</button>
              </>
            ) : (
              <>
                <span className="management-text" onClick={() => navigateToProductDetail(product.id)}>{product.name}</span>
                <button onClick={() => handleEditProduct(product)}>수정</button>
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