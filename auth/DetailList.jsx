import React, { useState, useEffect } from 'react';
import DetailProductList from './Detail';
import serverHost from '../../utils/host';
function DetailList() {
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
    <div className='h2-font-1'>
      <h2>다른 상품</h2>
      <DetailProductList filteredProducts={filteredProducts} />
    </div>
  );
}

export default DetailList;