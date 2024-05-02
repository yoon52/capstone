import React, { useState } from 'react';
import '../../styles/searchinput.css';

const SearchInput = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchButtonClick = () => {
    if (searchTerm.trim() === '') {
      console.log('검색어를 입력하세요.');
      return;
    }
    
    // 검색어를 상위 컴포넌트로 전달하여 검색 결과 처리
    onSearch(searchTerm.trim());
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchButtonClick();
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleEnterKeyPress}
          className="search-input"
        />
      </div>
      <button onClick={handleSearchButtonClick} className="search-product-button">
        검색
      </button>
    </div>
  );
};

export default SearchInput;
