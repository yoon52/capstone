import React from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility'; // 눈 모양 아이콘 import

import '../../styles/product.css';

function ProductList({ filteredProducts }) {
  const navigate = useNavigate();

  const handleProductClick = async (productId) => {
    try {
      await fetch(`http://localhost:4000/updateViews/${productId}`, {
        method: 'POST',
      });
      navigate(`/ProductDetail/${productId}`);
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  return (
    <div className="product-list-container">
      <div className="product-list-wrapper">
        <div className="product-grid">
          {filteredProducts.map((product) => (
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
                <p className="product-name">{product.name}</p>
                <p className="product-price">
                  <span style={{ fontSize: '20px', fontWeight: 550 }}>{product.price}</span> 원
                </p>
                <p className="product-views">
                  <VisibilityIcon sx={{ fontSize: 15, marginRight: 0.5, marginBottom: -0.3 }} />
                  {product.views}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
