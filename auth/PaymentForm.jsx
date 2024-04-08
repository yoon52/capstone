import React, { useState } from 'react';

const PaymentForm = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // 여기에 결제 처리 로직을 구현합니다.
    console.log('카드 정보:', { cardNumber, expiry, cvv });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        카드 번호:
        <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
      </label>
      <label>
        만료 날짜:
        <input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
      </label>
      <label>
        CVV:
        <input type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} />
      </label>
      <button type="submit">결제</button>
    </form>
  );
};

export default PaymentForm;
