import React, { useState } from 'react';
import '../../styles/searchinput.css';

const SearchInput = ({ searchTerm, handleChangeSearchTerm, handleSearchProduct }) => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);


  
  const handleSearchButtonClick = () => {
    if (searchTerm.trim() !== '') {
      setRecentSearches(prevSearches => [...prevSearches, searchTerm]);
      handleSearchProduct();
      setSearchError('검색어를 입력하세요.');

    }
  };


  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={handleChangeSearchTerm}
          onClick={handleInputClick}
          onKeyDown={handleEnterKeyPress} // 엔터키 이벤트 핸들러 설정
          className="search-input"
        />
      </div>
      <button onClick={handleSearchButtonClick} className="search-product-button">
        검색
      </button>

      {/* 최근 검색어 목록을 표시 (조건부 렌더링) */}
      {showRecentSearches && recentSearches.length > 0 && (
        <div className="recent-searches-container">
          <h4>최근 검색어:</h4>
          <ul className="recent-searches-list">
            {recentSearches.map((search, index) => (
              <li key={index}>{search}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchInput;