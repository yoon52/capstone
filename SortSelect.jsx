import React from 'react';
import '../../styles/main.css';

function SortSelect({ sortType, handleSortChange }) {
  return (
    <div className="sort-container">
      {/* 정렬 기준을 선택하는 드롭다운 메뉴 */}
      <label htmlFor="sort">정렬 기준:</label>
      {/* 드롭다운 메뉴에서 선택한 값이 변경될 때 handleSortChange 함수 호출 */}
      <select id="sort" value={sortType} onChange={handleSortChange}>
        {/* 추천순과 최신순 옵션 제공 */}
        <option value="recommend">추천순</option>
        <option value="latest">최신순</option>
      </select>
    </div>
  );
}

export default SortSelect;
