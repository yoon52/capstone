import React from 'react';
import '../../styles/main.css';

function SearchInput({ searchTerm, handleChangeSearchTerm, handleSearchProduct }) {
  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={handleChangeSearchTerm}
          className="search-input"
        />
      </div>
      <button onClick={handleSearchProduct} className="search-product-button">검색</button>
    </div>
  );
}

export default SearchInput;