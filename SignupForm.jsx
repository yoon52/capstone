import React, { useState } from 'react';
import '../../styles/main.css';

function SignupForm({ onSignupSuccess, onSignupError }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    department: '', // 학과 추가
    grade: '' // 학년 추가
  });
  const [idAvailability, setIdAvailability] = useState(null); // 아이디 사용 가능 여부 상태 추가

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckAvailability = async () => {
    try {
      const response = await fetch(`http://localhost:4000/checkUser?id=${formData.id}`);
      if (response.ok) {
        const data = await response.json();
        setIdAvailability(data.available);
      } else {
        setIdAvailability(null);
        onSignupError('아이디 중복 확인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      setIdAvailability(null);
      onSignupError('서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 아이디 중복 확인을 하지 않은 상태에서는 가입을 진행하지 않음
    if (idAvailability === null || idAvailability === false) {
      onSignupError('아이디 중복 확인을 먼저 진행해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        onSignupSuccess();
      } else {
        const errorData = await response.json();
        onSignupError(errorData.error);
      }
    } catch (error) {
      console.error('Error:', error);
      onSignupError('서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="Singup-container">
      <h1>회 원 가 입</h1>
      <form onSubmit={handleSubmit}>

        {/* 사용자 이름 입력 필드 */}
        <div className="form-group">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름"
            required
          />
        </div>

        {/* 사용자 ID 입력 필드 */}
        <div className="form-group">
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="아이디"
            required
          />
        </div>

        {/* 아이디 중복 확인 버튼 추가 */}
        <button type="button" onClick={handleCheckAvailability}>중복 확인</button>
        {/* 아이디 사용 가능 여부에 따른 메시지 표시 */}
        {idAvailability === true && <span style={{ color: 'green' }}>사용 가능한 아이디입니다!</span>}
        {idAvailability === false && <span style={{ color: 'red' }}>이미 존재하는 아이디입니다!</span>}
      

        {/* 비밀번호 입력 필드 */}
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호"
            required
          />
        </div>

        {/* 비밀번호 확인 입력 필드 */}
        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호 확인"
            required
          />
        </div>

        {/* 이메일 입력 필드 */}
        <div className="form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일"
            required
          />
        </div>

        {/* 학과/학년 선택 셀렉트 */}
        <div className="select-group">
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">학과를 선택하세요</option>
            <option value="computer_science">컴퓨터 공학과</option>
            <option value="software_engineering">소프트웨어 공학과</option>
            <option value="design">디자인학과</option>
            <option value="business-administration">경영학과</option>
          </select>

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

        <button type="submit" className="signup" >가입하기</button>

      </form>
    </div>
  );
}

export default SignupForm;
