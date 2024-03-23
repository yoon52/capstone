import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import logo from '../../image/logo.png';

function Signup() {
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    department: '',
    grade: ''
  });
  const [idAvailability, setIdAvailability] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckAvailability = async () => {
    try {
      const response = await fetch(`https://ec2caps.liroocapstone.shop:4000/checkUser?id=${formData.id}`);
      if (response.ok) {
        const data = await response.json();
        setIdAvailability(data.available);
        setIsModalOpen(true);
        setErrorMessage(data.available ? '사용 가능한 아이디입니다!' : '이미 존재하는 아이디입니다!');
      } else {
        setIdAvailability(null);
        setErrorMessage('아이디 중복 확인 중 오류가 발생했습니다.');
        setIsModalOpen(true); // Open modal on error
      }
    } catch (error) {
      console.error('Error:', error);
      setIdAvailability(null);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
      setIsModalOpen(true); // Open modal on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (idAvailability === null || idAvailability === false) {
      setErrorMessage('아이디 중복 확인을 먼저 진행해주세요.');
      setIsModalOpen(true); // Open modal for error
      return;
    }

    try {
      const response = await fetch('https://ec2caps.liroocapstone.shop:4000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        handleSignupSuccess();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error);
        setIsModalOpen(true); // Open modal on error
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
      setIsModalOpen(true); // Open modal on error
    }
  };

  const handleSignupSuccess = () => {
    setSignupSuccess(true);
    setErrorMessage('');
    navigate('/login');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setErrorMessage('');
  };

  return (
    <div>
      <img src={logo} id='logo' alt="로고" />
      <h1 className="Signup-header">회원가입</h1>
      <div className="Signup-container">
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <p>{errorMessage}</p>
              <button className="modal-close" onClick={handleModalClose}>확인</button>
            </div>
          </div>
        )}
        {signupSuccess && <p className="success-message">회원가입 성공</p>}
        <form onSubmit={handleSubmit}>
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
          <div className="form-group id-group">
            <div className="id-form">
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="학번"
                required
              />
            </div>
            <button type="button" className="check" onClick={handleCheckAvailability}>중복 확인</button>
          </div>
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
          <div className="select-group">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={{ color: formData.department ? 'black' : 'gray' }}
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
              style={{ color: formData.grade ? 'black' : 'gray' }}
              required
            >
              <option value="">학년을 선택하세요</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
              <option value="4">4학년</option>
            </select>
          </div>
          <button type="submit" className="signup-button">가입하기</button>
        </form>
        <p>이미 계정이 있으신가요?&nbsp;&nbsp;<Link to="/Login">로그인</Link></p>
      </div>
    </div>
  );
}

export default Signup;