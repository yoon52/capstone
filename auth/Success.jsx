import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Modal from "react-modal";


export function SuccessPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태

  const [searchParams] = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const userId = sessionStorage.getItem('userId'); // 사용자 ID 가져오기
  const productId = sessionStorage.getItem('productId'); // 사용자 ID 가져오기
  const [rating, setRating] = useState(0);



  async function confirmPayment() {
    try {
      const response = await fetch('https://ec2caps.liroocapstone.shop:4000/confirm', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
          productId,
          userId // 사용자 ID 전달
        })
      });

      if (response.ok) {
        setIsConfirmed(true);
        // Open the modal after successful payment
        setIsModalOpen(true);

        // 결제 완료 후 상품의 판매 상태를 업데이트
        await handleSellProduct(productId);

      }
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  }

  // Function to navigate back to the main page
  function navigateToMainPage() {
    window.location.href = "/Main"; // Replace "/" with the URL of your main page
  }

  // 상품의 판매 상태를 업데이트하는 함수
  // 클라이언트 코드
  const handleSellProduct = async (productId) => {
    try {
      const response = await fetch(`https://ec2caps.liroocapstone.shop:4000/productsmanage/sold/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user_id': sessionStorage.getItem('userId')
        }
      });
      if (response.ok) {
        // 알림 표시
        alert('상품이 판매되었습니다.');
      } else {
        console.error('상품 판매완료 처리 실패:', response.status);
      }
    } catch (error) {
      console.error('상품 판매완료 처리 실패:', error);
    }
  };


  // Function to update the seller rating
  const updateSellerRating = async () => {
    try {
      // Implement your logic to update the seller rating
      console.log("Seller rating:", rating);
      // Close the modal after submitting the rating
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating seller rating:', error);
    }
  };

  // Function to handle seller rating
  const handleRatingChange = (value) => {
    // Round to one decimal place
    const roundedValue = Math.round(value * 10) / 10;
    setRating(roundedValue);
  };

  // Function to handle modal open
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to handle modal close
  const closeModal = () => {
    setIsModalOpen(false);
  };


  return (
    <div className="wrapper w-100">
      {isConfirmed ? (
        <div
          className="flex-column align-center confirm-success w-100 max-w-540"
          style={{
            display: "flex"
          }}
        >

          <img
            src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
            width="120"
            height="120"
          />
          <h2 className="title">결제를 완료했어요</h2>
          <div className="response-section w-100">
            <div className="flex justify-between">
              <span className="response-label">결제 금액</span>
              <span id="amount" className="response-text">
                {amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">주문번호</span>
              <span id="orderId" className="response-text">
                {orderId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">paymentKey</span>
              <span id="paymentKey" className="response-text">
                {paymentKey}
              </span>
            </div>
          </div>

          <div className="w-100 button-group">
            <a className="btn primary" href="/my/payment-logs" target="_blank" rel="noreferrer noopener">테스트 결제내역 확인하기</a>
            <div className="flex" style={{ gap: "16px" }}>
              <a
                className="btn w-100"
                href="https://developers.tosspayments.com/sandbox"
              >
                다시 테스트하기
              </a>
              <a
                className="btn w-100"
                href="https://docs.tosspayments.com/guides/payment-widget/integration"
                target="_blank"
                rel="noopner noreferer"
              >
                결제 연동 문서가기
              </a>

            </div>
            <a className="btn" onClick={navigateToMainPage}>메인으로 이동</a>

          </div>
        </div>
      ) : (
        <div className="flex-column align-center confirm-loading w-100 max-w-540">
          <div className="flex-column align-center">
            <img
              src="https://static.toss.im/lotties/loading-spot-apng.png"
              width="120"
              height="120"
            />
            <h2 className="title text-center">결제 요청까지 성공했어요.</h2>
            <h4 className="text-center description">결제 승인하고 완료해보세요.</h4>
          </div>
          <div className="w-100">
            <button className="btn primary w-100" onClick={confirmPayment}>
              결제 승인하기
            </button>

          </div>
        </div>
      )}
      {/* Seller rating modal */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <h2>Rate Seller</h2>
        <input
          type="range"
          min="0"
          max="45"
          step="0.1"
          value={rating * 10}
          onChange={(e) => handleRatingChange(e.target.value / 10)}
        />
        <span>{rating}</span>
        <button onClick={updateSellerRating}>Submit Rating</button>
        <button onClick={closeModal}>Close</button>
      </Modal>


    </div>

  );
}