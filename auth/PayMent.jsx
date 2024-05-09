import React, { useState } from 'react';
import PaymentForm from './PaymentForm'; // 결제 폼 컴포넌트

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState(null); // 결제 방법 상태
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false); // 구매 확정 상태

  // 만나서 결제 처리 함수
  const handleMeetupPayment = () => {
    // 만나서 결제 로직 추가
    alert('만나서 결제가 완료되었습니다.');
    setPurchaseConfirmed(true); // 구매 확정 상태로 변경
  };

  // 카드 결제 후 구매 확정 처리 함수
  const handleCardPayment = async (paymentData) => {
    try {
      // 카드 결제 API 호출 및 처리
      const response = await fetch('http://your-payment-api-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        // 결제 완료 후 구매 확정 로직 추가
        alert('카드 결제가 완료되었습니다. 구매가 확정되었습니다.');
        setPurchaseConfirmed(true); // 구매 확정 상태로 변경
      } else {
        throw new Error('카드 결제 실패');
      }
    } catch (error) {
      console.error('카드 결제 오류:', error);
    }
  };

  return (
    <div>
      <h1>가상 결제 페이지</h1>
      <div>
        {/* 만나서 결제 버튼 */}
        <button onClick={handleMeetupPayment}>만나서 결제</button>
        
        {/* 카드 결제 폼 */}
        <PaymentForm onCardPayment={handleCardPayment} />
      </div>
      {/* 구매 확정 상태에 따른 메시지 표시 */}
      {purchaseConfirmed && <p>구매가 확정되었습니다.</p>}
    </div>
  );
};

export default Payment;