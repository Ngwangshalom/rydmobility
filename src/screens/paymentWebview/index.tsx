import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { URL as API_URL } from '@src/api/config';
import styles from './styles';
import { PaymentVerifyInterface } from '@src/api/interface/paymentInterface';
import { allRides, paymentVerify, walletTopUpData } from '@src/api/store/actions';
import { notificationHelper } from '@src/commonComponent';

export function PaymentWebView({ route }) {
  const hasVerified = useRef(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { url, selectedPaymentMethod, dataValue } = route.params || {};
  const { translateData } = useSelector((state: any) => state.setting);



  const handleResponse = async (navState) => {

    if (hasVerified.current) {
      return;
    }

    if (selectedPaymentMethod == 'paystack') {
      verifyPaystackPayment(navState);
      return;
    }

    if (!navState?.url) {
      return;
    }

    const { token, payerID } = parseQueryParams(navState.url);


    if (token && payerID) {
      hasVerified.current = true;
      await fetchPaymentData(token, payerID);
      return;
    }

    if (
      navState.url.includes('/status') ||
      navState.url.includes('/payment-success') ||
      navState.url.includes('/p/success')
    ) {
      hasVerified.current = true;
      await fetchPaymentData(null, null);
      return;
    }

    if (navState.url.includes('/payment-failed')) {
      hasVerified.current = true;
      Alert.alert(translateData.paymentFailed, translateData.paymentFailedDescription);
      navigation.goBack();
      return;
    }

  };

  const parseQueryParams = (urlString) => {
    try {
      const parsed = new URL(urlString);
      const params = Object.fromEntries(parsed.searchParams.entries());
      return {
        token: params?.token || null,
        payerID: params?.PayerID || null,
      };
    } catch (error) {
      console.error('❌ Failed to parse query params:', error);
      return { token: null, payerID: null };
    }
  };

  const verifyPaystackPayment = async (navState) => {
    if (!navState?.url) return;
    if (hasVerified.current) return;

    if (
      navState.url.includes('trxref') ||
      navState.url.includes('reference') ||
      navState.url.includes('/payment-success') ||
      navState.url.includes('/status') ||
      navState.url.includes('/p/success')
    ) {
      hasVerified.current = true;
      const payload: PaymentVerifyInterface = {
        item_id: dataValue?.item_id,
        type: dataValue?.type,
      };

      try {
        const res = await dispatch(paymentVerify(payload)).unwrap();

        dispatch(allRides());
        dispatch(walletTopUpData());
        notificationHelper("", translateData.topUpCompleted, 'success');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MyTabs' }],
        });
      } catch (error) {
        console.error('Paystack verification error:', error);
        Alert.alert('Error', translateData.paymentFailedverification);
        navigation.goBack();
      }
      return;
    }

    if (navState.url.includes('/payment-failed') || navState.url.includes('/cancel')) {
      hasVerified.current = true;
      Alert.alert(translateData.paymentFailed, translateData.paymentFailedDescription);
      navigation.goBack();
      return;
    }
  }

  const fetchPaymentData = async (token, payerID) => {

    try {
      const fetchUrl = `${API_URL}/${selectedPaymentMethod}/status` +
        (token && payerID ? `?token=${token}&PayerID=${payerID}` : '');


      const payload: PaymentVerifyInterface = {
        item_id: dataValue?.item_id,
        type: dataValue?.type,
      };

      const res = await dispatch(paymentVerify(payload)).unwrap();


      dispatch(allRides());
      dispatch(walletTopUpData())
      notificationHelper("", translateData.topUpCompleted, 'success')
      navigation.reset({
        index: 0,
        routes: [{ name: 'MyTabs' }],
      });
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      Alert.alert('Error', translateData.paymentFailedverification);
    }
  };

  return (
    <WebView
      style={styles.modalview}
      startInLoadingState
      incognito
      androidLayerType="hardware"
      cacheEnabled={false}
      cacheMode="LOAD_NO_CACHE"
      source={{ uri: url }}
      onNavigationStateChange={handleResponse}
    />
  );
}
