import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/product.css';

function ProductList({ filteredProducts }) {
  const navigate = useNavigate();

  const handleProductClick = async (productId) => {
    const viewedProductKey = `viewed_product_${productId}`;

    // 세션 스토리지에서 해당 상품의 조회 기록 확인
    const isProductViewed = sessionStorage.getItem(viewedProductKey);

    if (!isProductViewed) {
      try {
        // 서버에 조회수 업데이트 요청
        await fetch(`http://localhost:4000/updateViews/${productId}`, {
          method: 'POST',
        });

        // 세션 스토리지에 조회 기록 저장
        sessionStorage.setItem(viewedProductKey, 'true');

        // 상품 상세 페이지로 이동
        navigate(`/productDetail/${productId}`);
      } catch (error) {
        console.error('Error updating views:', error);
      }
    } else {
      // 이미 조회한 상품인 경우, 상품 상세 페이지로 이동만 수행
      navigate(`/productDetail/${productId}`);
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
                <p className="product-views">Views: {product.views}</p>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductList;