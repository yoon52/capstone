import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/product.css';

function ProductSortRec() {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const userId = sessionStorage.getItem('userId');
        const response = await fetch('http://localhost:4000/products/searchByRecent', {
          headers: {
            'user_id': userId
          }
        });
        if (response.ok) {
          const data = await response.json();
          setRecommendedProducts(data);
        } else {
          console.error('추천 상품 목록 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('추천 상품 목록 가져오기 오류:', error);
      }
    };

    fetchRecommendedProducts();
  }, []);

  const handleProductClick = async (productId) => {
    try {
      await fetch(`http://localhost:4000/updateViews/${productId}`, {
        method: 'POST',
      });
      navigate(`/productDetail/${productId}`);
    } catch (error) {
      console.error('조회수 업데이트 오류:', error);
    }
  };

  return (
    <div className="product-list-container">
      <div className="product-list-wrapper">
        <div className="product-grid">
          {recommendedProducts.map(product => (
            <div
              key={product.id}
              className="product-item"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="product-image-container">
                <img
                  src={`http://localhost:4000/uploads/${product.image}`}
                  alt="Product"
                  className="product-image"
                />
              </div>
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">Price: ${product.price}</p>
                <p className="product-views">Views: {product.views}</p> {/* 조회수 표시 */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductSortRec;
