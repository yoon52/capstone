import React from 'react';
import ProductList from './ProductList'; // 검색 결과를 보여주는 상품 리스트 컴포넌트 임포트

function SearchResults({ filteredProducts, searchTerm }) {
  return (
    <div className="search-results-container">
      <h2>검색 결과</h2>
      {filteredProducts.length > 0 ? (
        <ProductList filteredProducts={filteredProducts} searchTerm={searchTerm} />
      ) : (
        <p>검색 결과가 없습니다.</p>
      )}
    </div>
  );
}

export default SearchResults;
