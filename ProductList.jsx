// ProductList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/main.css';

function ProductList({ filteredProducts }) {
  const navigate = useNavigate();

  const handleProductClick = async (productId) => {
    try {
      await fetch(`https://ec2caps.liroocapstone.shop:4000/updateViews/${productId}`, {
        method: 'POST',
      });
      navigate(`/productDetail/${productId}`);
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  return (
    <div className="product-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 150px)', gap: '5px' }}>
      {filteredProducts.map(product => (
        <div key={product.id} className="product-item" onClick={() => handleProductClick(product.id)} style={{ border: '2px solid black', padding: '10px' }}>
          <div className="product-content">
            {/* 이미지 경로를 서버에서 제공하는 방식에 맞추어 수정 */}
            <img src={`https://ec2caps.liroocapstone.shop:4000/uploads/${product.image}`} alt="Product" width="100" height="100" /> 
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
