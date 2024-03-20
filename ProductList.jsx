// ProductList.jsx

import React from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import '../../styles/main.css';

function ProductList({ filteredProducts }) {
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/productDetail/${productId}`);
  };

  return (
    <div className="product-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 150px)', gap: '5px' }}>
    {filteredProducts.map(product => (
      <div key={product.id} className="product-item" onClick={() => handleProductClick(product.id)} style={{ border: '2px solid black', padding: '10px' }}>
        <div className="product-content">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <p className="product-price">Price: ${product.price}</p>
        </div>
      </div>
    ))}
  </div>

  );
}

export default ProductList;