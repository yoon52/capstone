import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../../styles/product.css';



const SearchResults = ({ filteredProducts }) => {
  const navigate = useNavigate();

  const handleProductClick = async (productId) => {
    try {
      // Update views count for the clicked product
      await fetch(`http://localhost:4000/updateViews/${productId}`, {
        method: 'POST',
      });

      // Navigate to the product detail page with the selected productId
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
            <p className="no-results-message">검색하신  상품이 없습니다!</p>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="custom-card-media" onClick={() => handleProductClick(product.id)}>
                <div className="product-image-container">
                  {product.image && (
                    <img
                      src={`http://localhost:4000/uploads/${extractImageFilename(product.image)}`}
                      alt={product.name}
                      className="product-content"
                    />
                  )}
                </div>
                <div className="product-details">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to extract filename from image URL
const extractImageFilename = (imageUrl) => {
  const parts = imageUrl.split('/');
  return parts[parts.length - 1];
};

export default SearchResults;
