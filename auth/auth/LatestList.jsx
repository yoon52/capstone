import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';

function LatestList() {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch('http://localhost:4000/products/latest');
        if (response.ok) {
          const data = await response.json();
          setFilteredProducts(data);
        } else {
          console.error('최신순 상품 목록 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('최신순 상품 목록 가져오기 오류:', error);
      }
    };

    fetchLatestProducts();
  }, []);

  return (
    <div>
      <h2 className='product-con'>최신순 상품</h2>
      <ProductList filteredProducts={filteredProducts} />
    </div>
  );
}

export default LatestList;