import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';

function ViewsList() {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchViewsProducts = async () => {
      try {
        const response = await fetch('http://localhost:4000/products/views');
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
    <div>
      <ProductList filteredProducts={filteredProducts} />
    </div>
  );
}

export default ViewsList;
