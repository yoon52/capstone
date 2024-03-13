import React, { useState } from 'react';
import '../../styles/main.css';

function SignupForm({ onSignupSuccess, onSignupError }) {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    email: '',
    department: '',
    grade: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
