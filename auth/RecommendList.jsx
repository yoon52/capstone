import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';

function RecommendList() {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchRecommendProducts = async () => {
      try {
        const response = await fetch('http://localhost:4000/products/recommendations', {
          headers: {
            'user_id': sessionStorage.getItem('userId')
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFilteredProducts(data);
        } else {
          console.error('추천 상품 목록 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('추천 상품 목록 가져오기 오류:', error);
      }
    };

    fetchRecommendProducts();
  }, []);

  return (
    <div>
      <h2>추천 상품</h2>
      <ProductList filteredProducts={filteredProducts} />
    </div>
  );
}

export default RecommendList;
