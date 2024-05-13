import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../../styles/product.css';
import serverHost from '../../utils/host';

function Detail({ filteredProducts }) {
  const navigate = useNavigate();
  const [formattedProducts, setFormattedProducts] = useState([]);

  useEffect(() => {
    const formatDate = (createdAt) => {
      const currentTime = new Date();
      const productTime = new Date(createdAt);
      const timeDifference = Math.floor((currentTime - productTime) / (1000 * 60));

      if (timeDifference < 30) {
        return '방금 전';
      } else if (timeDifference < 60 * 24) {
        return `${Math.floor(timeDifference / 60)}시간 전`;
      } else if (timeDifference < 60 * 24 * 7) {
        return `${Math.floor(timeDifference / (60 * 24))}일 전`;
      } else if (timeDifference < 60 * 24 * 30) {
        return `${Math.floor(timeDifference / (60 * 24 * 7))}주 전`;
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
    const viewedProductKey = `viewed_product_${productId}`;

    // 세션 스토리지에서 해당 상품의 조회 기록 확인
    const isProductViewed = sessionStorage.getItem(viewedProductKey);

    if (!isProductViewed) {
      try {
        // 서버에 조회수 업데이트 요청
        await fetch(`${serverHost}:4000/updateViews/${productId}`, {
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
    <div className="product-list-container-1">
      <div className="product-list-wrapper-1">
        <div className="product-grid-1">
          {formattedProducts.map((product) => (
            <div
              key={product.id}
              className="product-item-1"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="product-image-container-1">
                <img
                  src={`${serverHost}:4000/uploads/${product.image}`}
                  alt="Product"
                  className="product-image"
                />
              </div>
              <div className="product-details-1">
                <p className="product-name-1">{product.name}</p>
                <p className="product-price-1">
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

export default Detail;