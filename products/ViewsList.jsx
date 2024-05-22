import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';
import serverHost from '../../utils/host';

function ViewsList() {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchViewsProducts = async () => {
      try {
        const response = await fetch(`${serverHost}:4000/products/views`);
        if (response.ok) {
          const data = await response.json();
          setFilteredProducts(data);
        } else {
          console.error('조회순 상품 목록 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('조회순 상품 목록 가져오기 오류:', error);
      }
    };

    fetchViewsProducts();
  }, []);

  return (
    <div className='h2-font'>
      <h2 className='text-center article-list-title'>중고거래 인기 매물</h2>
      <ProductList filteredProducts={filteredProducts} />
    </div>
  );
}

export default ViewsList;
