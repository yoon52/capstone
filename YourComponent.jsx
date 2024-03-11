// YourComponent.jsx

import React, { useState } from 'react';
import '../../styles/main.css';
import FindIdFormPage from './FindIdFormPage';
import FindPasswordPage from './FindPasswordPage';

const YourComponent = () => {
  const [showFindIdFormPage, setShowFindIdFormPage] = useState(false);
  const [showFindPasswordPage, setShowFindPasswordPage] = useState(false);
  const [foundId, setFoundId] = useState('');
  const [foundPassword, setFoundPassword] = useState('');

  // 아이디 찾기 버튼 클릭 시 호출되는 함수
  const handleFindId = () => {
    // 아이디 찾기 페이지로 이동
    setShowFindIdFormPage(true);
    setShowFindPasswordPage(false);
  };

  // 비밀번호 찾기 버튼 클릭 시 호출되는 함수
  const handleFindPassword = () => {
    // 비밀번호 찾기 페이지로 이동
    setShowFindIdFormPage(false);
    setShowFindPasswordPage(true);
  };

  return (
    <div className="all-group">
      {showFindIdFormPage && <FindIdFormPage onFindId={setFoundId} />}
      {showFindPasswordPage && <FindPasswordPage onFindPassword={setFoundPassword} />}
      {!showFindIdFormPage && !showFindPasswordPage && (
        <>
          <button
            type="button"
            className="find-id"
            onClick={handleFindId}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            className="find-pw"
            onClick={handleFindPassword}
          >
            비밀번호 찾기
          </button>
        </>
      )}
      {foundId && <p>찾은 아이디: {foundId}</p>}
      {foundPassword && <p>찾은 비밀번호: {foundPassword}</p>}
    </div>
  );
};

export default YourComponent;
