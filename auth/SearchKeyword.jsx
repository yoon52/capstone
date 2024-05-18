import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/searchkeyword.css';
import logo from '../../image/logo.png';
import serverHost from '../../utils/host';

function SearchKeyword() {
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [userId, setUserId] = useState('');

  // 현재 로그인된 사용자의 ID를 가져오는 함수
  const fetchUserId = useCallback(() => {
    const userId = sessionStorage.getItem('userId');
    setUserId(userId);
  }, []);

  // 검색어 목록을 서버로부터 가져오는 함수
  const fetchSearchKeywords = useCallback(async () => {
    try {
      const response = await fetch(`${serverHost}:4000/SearchKeywords/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSearchKeywords(data);
      } else {
        console.error('검색어를 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('검색어를 가져오는 중 오류가 발생했습니다:', error);
    }
  }, [userId]);

  // 검색어 삭제 함수
  const deleteKeyword = async (keywordId) => {
    try {
      const response = await fetch(`${serverHost}:4000/SearchKeywords/delete/${keywordId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchSearchKeywords(); // 삭제 후 목록을 다시 가져옴
      } else {
        console.error('검색어 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('검색어를 삭제하는 중 오류가 발생했습니다:', error);
    }
  };

  // 컴포넌트가 마운트되면 사용자 ID와 검색어 목록을 가져옴
  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  useEffect(() => {
    if (userId !== '') {
      fetchSearchKeywords();
    }
  }, [userId, fetchSearchKeywords]);

  return (
    <div>
      <a href="/Main">
        <img src={logo} id='logo' alt="로고" />
      </a>
      <h1 className="search-keyword-header">검색 기록</h1>
      <div className="search-keyword-container">
        {searchKeywords.map((keyword) => (
          <li key={keyword.id} className="keyword-item">
            <span className="keyword-text">{keyword.search_term}</span>
            <button className="delete-button" onClick={() => deleteKeyword(keyword.id)}>삭제</button>
          </li>
        ))}
      </div>
    </div>
  );
}

export default SearchKeyword;