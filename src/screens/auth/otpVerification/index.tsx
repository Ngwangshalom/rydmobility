import { Text, View, Keyboard, Alert, BackHandler, KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView, Platform } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AuthText } from '../../../components/authComponents/authText/index';
import { AuthContainer } from '../../../components/authComponents/authContainer/index';
import OTPTextInput from 'react-native-otp-textinput';
import OTPTextView from 'react-native-otp-textinput';
import { style } from './style';
import { appColors, windowHeight } from '@src/themes';
import { Button, notificationHelper } from '@src/commonComponent';
import { external } from '../../../styles/externalStyle';
import { NewUserComponent } from '../../../components/authComponents/newUserComponent/index';
import { useValues } from '@src/utils/context/index';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../api/store/index';
import { UserLoginInterface, VerifyOtpInterface } from '../../../api/interface/authInterface';
import { userVerifyOtp, selfData, userLogin } from '../../../api/store/actions/index';
import { getValue, setValue } from '../../../utils/localstorage/index';
import { useAppNavigation, useAppRoute } from '@src/utils/navigation';
import { useIsFocused } from '@react-navigation/native';

import messaging from '@react-native-firebase/messaging';

export function OtpVerification() {
  const route = useAppRoute();
  const isFocused = useIsFocused();
  const { cca2 }: any = route.params || {};
  const countryCode = route?.params?.countryCode ?? '91';
  const phoneNumber = route?.params?.phoneNumber ?? '1234567890';

  const demouser = route?.params || {}
  const { textRTLStyle, isDark, viewRTLStyle, setToken } = useValues();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: any) => state.auth);
  const { translateData, settingData } = useSelector((state: any) => state.setting);
  const otpInputRef = useRef<any>(null);
  const input = useRef<OTPTextView>(null);
  const emailOrPhone = demouser?.email_or_phone ?? phoneNumber;
  const isEmail = emailOrPhone.includes('@');
  const demoMode = settingData?.values?.activation?.demo_mode == 1
  const [otp, setOtp] = useState(demoMode === true ? '123456' : '');
  const [fcmToken, setFcmToken] = useState<string>('')
  const [resendTimer, setResendTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const messageRef = useRef<any>();
  const navigation = useAppNavigation();

  useEffect(() => {
    if (otp?.length !== 6) return;
    Keyboard.dismiss();
    if (demoMode) {
      handleVerify();
    } else {
      handleVerify();
    }
  }, [otp, demoMode]);

  useEffect(() => {
    const fetchToken = async () => {
      let fcmToken = await getValue('fcmToken')
      if (fcmToken) {
        setFcmToken(fcmToken)
      }
    }
    if (isFocused) {
      fetchToken()
    }
  }, [isFocused])


  const handleVerify = async () => {
    const formatCountryCode = (code: string): string => {
      if (code.startsWith('+')) {
        return code.substring(1);
      }
      return code;
    };

    let payload: VerifyOtpInterface = {
      email_or_phone: phoneNumber,
      country_code: formatCountryCode(countryCode),
      token: otp,
      fcm_token: fcmToken
    };

    dispatch(userVerifyOtp(payload))
      .unwrap()
      .then(async (res: any) => {
        if (!res.success) {
          notificationHelper('', translateData?.invalidOtp, 'error');
        } else if (res.success && res.is_registered) {
          notificationHelper(
            '',
            translateData?.otpVerifySuccess,
            'success',
          );

          if (res?.id) {
            messaging()
              .subscribeToTopic(`user_${res?.id}`)
              .then(() => {
              });
          }
          setValue('token', res.access_token);


          if (res.access_token) {
            dispatch(selfData());
          }
          navigation.navigate('MyTabs');
        } else {
          if (!res.is_registered) {

            notificationHelper(
              '',
              translateData?.otpVerifySuccess,
              'success',
            );
            navigation.navigate('SignUp', {
              countryCode,
              phoneNumber,
              cca2,
            });
          } else {
            notificationHelper('', translateData?.invalidOtp, 'error');
          }
        }
      })
      .catch((error: any) => {
        notificationHelper('', translateData?.duringVerificationOTP, 'error');

      });
  };


  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);


  const handleSignIn = async () => {
    const formatCountryCode = (code: string): string => {
      if (code.startsWith('+')) {
        return code.substring(1);
      }
      return code;
    };

    let payload: UserLoginInterface = {
      email_or_phone: phoneNumber,
      country_code: formatCountryCode(countryCode),
      fcm_token: fcmToken,
    };

    dispatch(userLogin(payload))
      .unwrap()
      .then((res: any) => {
        if (res?.success) {
          notificationHelper('', translateData?.otpSuccess, 'success');
        } else {
          messageRef.current?.animate();
        }
      });
  };




  const handleResendOtp = useCallback(() => {
    if (resendTimer > 0) return;
    handleSignIn()
    setResendTimer(10);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resendTimer]);





  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <AuthContainer
            topSpace={windowHeight(240)}
            imageShow={true}
            container={
              <View>
                <AuthText
                  title={translateData?.otpVerification}
                  subtitle={
                    isEmail
                      ? `${translateData?.otpSendTo} ${emailOrPhone}`
                      : `${translateData?.otpSendTo} ${countryCode} ${emailOrPhone}`
                  }
                />

                <Text
                  style={[
                    style.otpTitle,
                    {
                      color: isDark ? appColors.whiteColor : appColors.primaryText,
                      textAlign: textRTLStyle,
                    },
                  ]}
                >
                  {translateData?.otp}
                </Text>

                <View
                  style={[style.inputContainer, { flexDirection: viewRTLStyle }]}
                >
                  <OTPTextInput
                    ref={input}
                    containerStyle={[
                      style.otpContainer,
                      { flexDirection: viewRTLStyle },
                    ]}
                    inputCount={6}
                    handleTextChange={(value) => {
                      setOtp(value);
                      if (value?.length === 6) {
                        otpInputRef.current?.blur();
                      }
                    }}
                    textInputStyle={[
                      style.otpInput,
                      {
                        color: isDark
                          ? appColors.whiteColor
                          : appColors.blackColor,
                      },
                    ]}
                    keyboardType="numeric"
                    tintColor={appColors.primary}
                    offTintColor={isDark ? appColors.darkBorder : appColors.lightGray}
                    defaultValue={otp}
                  />
                </View>

                <View style={[external.mt_28]}>
                  <Button
                    title={translateData?.verify}
                    onPress={handleVerify}
                    loading={loading}
                  />
                </View>

                <View style={[external.mb_15, external.mt_5]}>
                  <NewUserComponent
                    title={
                      resendTimer > 0
                        ? `${translateData?.resendOtp} ${resendTimer}s`
                        : translateData?.NoOtp
                    }
                    subtitle={resendTimer === 0 ? translateData?.resendIt : null}
                    onPress={handleResendOtp}
                  />
                </View>
              </View>
            }
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}