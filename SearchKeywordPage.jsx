import React, { useState, useEffect } from 'react';
import '../../styles/main.css';

function SearchKeywordPage() {
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [userId, setUserId] = useState('');

  // 현재 로그인된 사용자의 ID를 가져오는 함수
  const fetchUserId = () => {
    const userId = sessionStorage.getItem('userId');
    setUserId(userId);
  };

  // 검색어 목록을 서버로부터 가져오는 함수
  const fetchSearchKeywords = async () => {
    try {
      const response = await fetch(`http://localhost:4000/searchKeywords/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSearchKeywords(data);
      } else {
        console.error('Failed to fetch search keywords');
      }
    } catch (error) {
      console.error('Error fetching search keywords:', error);
    }
  };

  // 검색어 삭제 함수
  const deleteKeyword = async (keywordId) => {
    try {
      const response = await fetch(`http://localhost:4000/searchKeywords/delete/${keywordId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchSearchKeywords(); // 삭제 후 목록을 다시 가져옴
      } else {
        console.error('Failed to delete keyword');
      }
    } catch (error) {
      console.error('Error deleting keyword:', error);
    }
  };

  // 컴포넌트가 마운트되면 사용자 ID와 검색어 목록을 가져옴
  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId !== '') {
      fetchSearchKeywords();
    }
  }, [userId]);

  return (
    <div className="search-keyword-container">
      <h2>검 색 기 록</h2>
      <ul className="keyword-list">
        {searchKeywords.map((keyword) => (
          <li key={keyword.id} className="keyword-item">
            <span className="keyword-text">{keyword.search_term}</span>
            <button className="delete-button" onClick={() => deleteKeyword(keyword.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchKeywordPage;
