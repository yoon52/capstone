import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../../styles/product.css';
import serverHost from '../../utils/host';

function ProductList({ filteredProducts }) {
  const navigate = useNavigate();
  const [formattedProducts, setFormattedProducts] = useState([]);

  useEffect(() => {
    const formatDate = (createdAt) => {
      const currentTime = new Date();
      const productTime = new Date(createdAt);
      const timeDifference = Math.floor((currentTime - productTime) / (1000 * 60)); // milliseconds to minutes

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
        navigate(`/ProductDetail/${productId}`);
      } catch (error) {
        console.error('Error updating views:', error);
      }
    } else {
      // 이미 조회한 상품인 경우, 상품 상세 페이지로 이동만 수행
      navigate(`/ProductDetail/${productId}`);
    }
  };

  return (
    <div className="cards-wrap">
      {formattedProducts.map((product) => (
        <article className="card-top" key={product.id} onClick={() => handleProductClick(product.id)}>
          <a className="card-link" href={`/ProductDetail/${product.id}`} data-event-label={product.id}>
            <div className="card-photo">
              <img
                src={`${serverHost}:4000/uploads/${product.image}`}
                alt={product.title}
              />
            </div>
            <div className="card-desc">
              <h2 className="card-title">상품명: {product.name}</h2>
              <div className="card-price">가격: {product.price}원</div>
              <div className="product-info1">
                <div className="product-views-L">
                  <VisibilityIcon style={{ marginRight: '5px' }} />
                  {product.views}
                </div>
                <p className="product-time-L">{product.formattedCreatedAt}</p>
              </div>
            </div>
          </a>
        </article>
      ))}
    </div>
  );
}

export default ProductList;