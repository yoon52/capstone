import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FindIdFormPage = ({ onFindId }) => {
  const [name, setName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [department, setDepartment] = useState('');

  const handleFindId = () => {
    // 여기에서 입력 받은 정보를 사용하여 아이디 찾기 로직을 구현합니다.
    // 결과는 부모 컴포넌트로 전달합니다.
    const foundId = 'exampleUserId'; // 실제 로직에 따라 수정하세요
    onFindId(foundId);
  };

  return (
    <div>
      <label>이름: </label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <br />
      <label>학번: </label>
      <input type="text" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} />
      <br />
      <label>학과: </label>
      <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} />
      <br />
      <button type="button" onClick={handleFindId}>
        확인
      </button>
    </div>
  );
};

export default FindIdFormPage;