/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/report.css';
import serverHost from '../../utils/host';
function Report() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reportText, setReportText] = useState('');
  const [reason, setReason] = useState(''); // 신고 사유 추가
  const [customReason, setCustomReason] = useState('');
  const navigate = useNavigate();

  const location = useLocation();
  const { sellerId, sellerName } = location.state;

  const handleReasonChange = (selectedReason) => {
    setReason(selectedReason);
    if (selectedReason !== '기타') {
      setCustomReason('');
    }
  };





  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = {
      name,
      email,
      reportText,
      reason,
      customReason,
      sellerId,
      sellerName
    };
  
    try {
      const response = await fetch(`${serverHost}:4000/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      if (response.ok) {
        console.log('Report submitted successfully');
        alert("신고가 접수되었습니다.")
        navigate('/Main');
      } else {
        console.error('Failed to submit report:', response.statusText);
        // 실패 메시지를 표시하거나 다른 조치를 취할 수 있습니다.
      }
    } catch (error) {
      console.error('Error submitting report:', error.message);
      // 에러 메시지를 표시하거나 다른 조치를 취할 수 있습니다.
    } finally {
      // 제출 후 필드를 초기화합니다.
      setName('');
      setEmail('');
      setReportText('');
      setReason('');
      setCustomReason('');
    }
  };
  

  return (
    <div className="report-container">
      <h2>사용자 신고</h2>
      <p>신고자 정보</p>
      <form onSubmit={handleSubmit}>
        <section id="report-profile">
          <div className="report-profile">
            <div>
              <div id="article-profile-image">

                <img src="https://d1unjqcospf8gs.cloudfront.net/assets/users/default_profile_80-c649f052a34ebc4eee35048815d8e4f73061bf74552558bb70e07133f25524f9.png" />
                <div className="article-profile-left">
                  <div className="space-between">
                    <p>학번: {sellerId}</p>

                  </div>
                  <p>이름: {sellerName}</p>
                </div>
              </div>
            </div>

          </div>

        </section>

        <div className="form-group">
          <label className="form-label">
            신고 사유:
            <ul className="reason-list">
              <li>
                <button onClick={() => handleReasonChange('부적절한 콘텐츠')}>중고거래 게시글이 아니에요</button>
              </li>
              <li>
                <button onClick={() => handleReasonChange('사기 의심')}>사기인것 같아요</button>
              </li>
              <li>
                <button onClick={() => handleReasonChange('전문 판매업자')}>전문 판매업자 같아요</button>
              </li>
              <li>
                <button onClick={() => handleReasonChange('거래중 분쟁')}>거래중 분쟁이 발생했어요</button>
              </li>
              {/* <li>
                <button onClick={() => handleReasonChange('기타')}>기타</button>
              </li> */}
            </ul>
          </label>
        </div>

        {/* {reason === '기타' && (
          <div className="form-group">
            <label className="form-label">
              직접 입력:
              <input type="text" value={customReason} onChange={handleCustomReasonChange} className="form-input" />
            </label>
            <button type="submit" className="submit-button" onClick={handleSubmit}>제출</button>
          </div>
        )} */}


      </form>
    </div>


  );
}

export default Report;