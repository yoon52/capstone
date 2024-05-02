import React from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../../styles/product.css';

const SearchResults = ({ filteredProducts }) => {
  const navigate = useNavigate();

  const handleProductClick = async (productId) => {
    try {
      await fetch(`http://localhost:4000/updateViews/${productId}`, {
        method: 'POST',
      });

      navigate(`/ProductDetail/${productId}`);
    } catch (error) {
      console.error('Error updating views or navigating to product detail:', error);
    }
  };

  return (
    <div className="product-list-container">
      <div className="product-list-wrapper">
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <p className="no-results-message">검색하신 상품이 없습니다!</p>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-item" onClick={() => handleProductClick(product.id)}>
                <div className="product-image-container">
                  {product.image && (
                    <img
                      src={`http://localhost:4000/uploads/${extractImageFilename(product.image)}`}
                      alt={product.name}
                      className="product-image"
                    />
                  )}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const extractImageFilename = (imageUrl) => {
  const parts = imageUrl.split('/');
  return parts[parts.length - 1];
};

export default SearchResults;