import React, { useState } from 'react';

const FindPasswordPage = ({ onFindPassword }) => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');

  const handleFindPassword = () => {
    // 여기에서 입력 받은 정보를 사용하여 비밀번호 찾기 로직을 구현합니다.
    // 결과는 부모 컴포넌트로 전달합니다.
    const foundPassword = 'examplePassword'; // 실제 로직에 따라 수정하세요
    onFindPassword(foundPassword);
  };

  return (
    <div>
      <label>아이디: </label>
      <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} />
      <br />
      <label>이메일: </label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />
      <button type="button" onClick={handleFindPassword}>
        확인
      </button>
    </div>
  );
};

export default FindPasswordPage;