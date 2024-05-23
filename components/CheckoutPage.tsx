import React, { useState } from 'react';
import { Button, Alert, TouchableOpacity, Text, View, ScrollView, StyleSheet } from 'react-native';
import { PaymentWidgetProvider, usePaymentWidget, AgreementWidget, PaymentMethodWidget } from '@tosspayments/widget-sdk-react-native';
import type { AgreementWidgetControl, PaymentMethodWidgetControl, AgreementStatus } from '@tosspayments/widget-sdk-react-native';

export default function App() {
  return (
    <PaymentWidgetProvider clientKey={`test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm`} customerKey={`EaOs-jWLYku63ZJ3qr619`}>
      <CheckoutPage />
    </PaymentWidgetProvider>
  );
}

function CheckoutPage() {
  const paymentWidgetControl = usePaymentWidget();
  const [paymentMethodWidgetControl, setPaymentMethodWidgetControl] = useState<PaymentMethodWidgetControl | null>(null);
  const [agreementWidgetControl, setAgreementWidgetControl] = useState<AgreementWidgetControl | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView>
        <PaymentMethodWidget
          selector="payment-methods"
          onLoadEnd={() => {
            paymentWidgetControl
              .renderPaymentMethods(
                'payment-methods',
                { value: 50_000 },
                {
                  variantKey: 'DEFAULT',
                }
              )
              .then(control => {
                setPaymentMethodWidgetControl(control);
              });
          }}
        />
        <AgreementWidget
          selector="agreement"
          onLoadEnd={() => {
            paymentWidgetControl
              .renderAgreement('agreement', {
                variantKey: 'DEFAULT',
              })
              .then(control => {
                setAgreementWidgetControl(control);
              });
          }}
        />
        <TouchableOpacity style={styles.button} onPress={async () => {
          if (paymentWidgetControl == null || agreementWidgetControl == null) {
            Alert.alert('주문 정보가 초기화되지 않았습니다.');
            return;
          }

          const agreeement = await agreementWidgetControl.getAgreementStatus();
          if (agreeement.agreedRequiredTerms !== true) {
            Alert.alert('약관에 동의하지 않았습니다.');
            return;
          }

          paymentWidgetControl.requestPayment?.({
            orderId: 'ehMKSJKiFaMXRyLO25dVd',
            orderName: '토스 티셔츠 외 2건',
          })
          .then((result) => {
              if (result?.success) {
                // 결제 성공 비즈니스 로직을 구현하세요.
                // result.success에 있는 값을 서버로 전달해서 결제 승인을 호출하세요.
              } else if (result?.fail) {
                // 결제 실패 비즈니스 로직을 구현하세요.
              }
            });
        }}>
          <Text style={styles.buttonText}>결제요청</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F4F4F4',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
