import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/product.css';

function ProductList({ filteredProducts }) {
  const navigate = useNavigate();

  const handleProductClick = async (productId) => {
    try {
      await fetch(`http://localhost:4000/updateViews/${productId}`, {
        method: 'POST',
      });
      navigate(`/productDetail/${productId}`);
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  return (
    <div className="product-list-container">
      <div className="product-list-wrapper">
        <div className="product-grid">
          {filteredProducts.map(product => (
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

export default ProductList;