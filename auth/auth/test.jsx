import React, { useEffect } from 'react';

const TestComponent = () => {
  useEffect(() => {
    const preparePayment = async () => {
      const response = await fetch('정보를 저장하는 백엔드 서비스 URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          merchant_uid: '...', // 가맹점 주문번호
          amount: 420000 // 결제 예정금액
          // 그외 order collection에 저장할 정보도 같이 전송
        })
      });
      const data = await response.json();
      // DB에 상품 재고가 있는지 파악하고 구매자 아이디, 가맹점 주문번호, 결제 예정금액 등 필요한 정보를 저장하고 코드 작성 후 결제 요청을 보냅니다.
      if (data.date === 'ok') {
        function requestPay() {
          IMP.request_pay({
            pg: 'kcp.{상점ID}', // 각 PG사마다 pay_method 파라미터 확인
            pay_method: 'card', // 실시간 계좌이체 'trans'
            merchant_uid: '57008833-33004',
            name: '당근 10kg',
            amount: 1004,
            buyer_email: 'Iamport@chai.finance',
            buyer_name: '포트원 기술지원팀',
            buyer_tel: '010-1234-5678',
            buyer_addr: '서울특별시 강남구 삼성동',
            buyer_postcode: '123-456',
            notice_url: 'https://웹훅수신 URL' // 웹훅수신 URL 설정(예: /portone-webhook)
          }, function (rsp) { // callback
            if (rsp.success) {
              // DB로 저장될 정보 전송
              fetch('/payment/complete', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  imp_uid: rsp.imp_uid,
                  merchant_uid: rsp.merchant_uid
                })
              }).then(data => {
                // 서버 결제 API 성공시 로직
              });
              console.log(rsp);
            } else {
              console.log(rsp);
            }
          });
        }
        requestPay();
      }
    };

    preparePayment().catch(error => {
      console.error(error);
    });
  }, []);

  return (
    <div>
      <button onClick={requestPay}>결제하기</button> {/* 결제하기 버튼 생성 */}
    </div>
  );
};

export default TestComponent;
