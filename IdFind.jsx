import React, { useState } from 'react';

function IdFind() {
  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    department: '',
    grade: ''
  });
  // 아이디 상태 관리
  const [id, setId] = useState('');
  // 결과 메시지 상태 관리
  const [message, setMessage] = useState('');
  // 로그인하기 및 비밀번호 찾기 버튼 표시 여부 상태 관리
  const [showButtons, setShowButtons] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // 아이디 찾기 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 입력값을 서버로 전송하여 아이디 찾기 요청
      const response = await fetch('http://localhost:4000/find-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // 응답을 확인하고 결과 메시지 및 아이디 업데이트
      if (response.ok) {
        const data = await response.json();
        setId(data.id);
        setMessage(`아이디는 ${data.id} 입니다.`);
        // 아이디를 찾은 경우에만 로그인하기 및 비밀번호 찾기 버튼 표시
        setShowButtons(true);
      } else {
        setMessage('아이디를 찾을 수 없습니다.');
        // 아이디를 찾지 못한 경우에는 버튼 숨김
        setShowButtons(false);
      }
    } catch (error) {
      console.error('아이디 찾기 오류:', error);
      setMessage('아이디 찾기 중 오류가 발생했습니다.');
      // 오류 발생 시에도 버튼 숨김
      setShowButtons(false);
    }
  };

  return (
    <div>
      <h2>아이디 찾기</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">이메일:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="department"> 학과: </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value=""> 학과를 선택하세요. </option>
            <option value="computer_science">컴퓨터 공학과</option>
            <option value="software_engineering">소프트웨어 공학과</option>
            <option value="design">디자인학과</option>
            <option value="business-administration">경영학과</option>
          </select>
        </div>
        <div>
          <label htmlFor="grade">학년:</label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            required
          >
            <option value="">학년을 선택하세요</option>
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
            <option value="4">4학년</option>
          </select>
        </div>
        <button type="submit">아이디 찾기</button>
      </form>
      {id && <p>찾은 아이디: {id}</p>}
      {message && <p>{message}</p>}
      {/* 로그인하기 및 비밀번호 찾기 버튼 */}
      {showButtons && (
        <div>
          <button onClick={() => window.location.href = '/login'}>로그인하기</button>
          <button onClick={() => window.location.href = '/pw-find'}>비밀번호 찾기</button>
        </div>
      )}
    </div>
  );
}

export default IdFind;
