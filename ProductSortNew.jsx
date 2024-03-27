import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';

function ProductSortNew() {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:4000/products/latest', {
          headers: {
            'user_id': sessionStorage.getItem('userId')
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFilteredProducts(data);
        } else {
          console.error('상품 목록 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('상품 목록 가져오기 오류:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2 className="product-list-title">최신등록 상품</h2>
      <ProductList filteredProducts={filteredProducts} />
    </div>
  );
}

export default ProductSortNew;
