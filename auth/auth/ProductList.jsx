import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../../styles/product.css';

function ProductList({ filteredProducts }) {
  const navigate = useNavigate();
  const [formattedProducts, setFormattedProducts] = useState([]);

  useEffect(() => {
    const formatDate = (createdAt) => {
      const currentTime = new Date();
      const productTime = new Date(createdAt);
      const timeDifference = Math.floor((currentTime - productTime) / (1000 * 60 * 60)); // milliseconds to hours

      if (timeDifference < 1) {
        return '방금 전';
      } else if (timeDifference < 24) {
        return `${timeDifference}시간 전`;
      } else if (timeDifference < 24 * 7) {
        return `${Math.floor(timeDifference / 24)}일 전`;
      } else if (timeDifference < 24 * 30) {
        return `${Math.floor(timeDifference / (24 * 7))}주 전`;
      } else {
        return '한달 ↑';
      }
    };

    const formatted = filteredProducts.map(product => ({
      ...product,
      formattedCreatedAt: formatDate(product.createdAt),
    }));
    setFormattedProducts(formatted);
  }, [filteredProducts]);

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
          {formattedProducts.map((product) => (
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
                <div className="product-views">
                  <VisibilityIcon sx={{ fontSize: 15, marginRight: 0.5, marginBottom: -0.3 }} />
                  {product.views}
                  <p className="product-time"> {product.formattedCreatedAt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductList;