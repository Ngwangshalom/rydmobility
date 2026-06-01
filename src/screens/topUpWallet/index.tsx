import { View, Text, TextInput, FlatList, Image,TouchableOpacity, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import { Header, notificationHelper } from "@src/commonComponent";
import { commonStyles } from "@src/styles/commonStyle";
import styles from "./component/selectMethod/styles";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useValues } from "@src/utils/context/index";;
import { appColors, windowHeight, windowWidth } from "@src/themes";
import { Button, RadioButton } from "@src/commonComponent";
import { useDispatch, useSelector } from "react-redux";
import { walletTopUpData } from "../../api/store/actions/index";
import { WalletTopUpDatainterface } from "@src/api/interface/walletInterface";
import { CustomBackHandler } from "@src/components";
import { SkeltonAppPage } from "../bottomTab/profileTab/appPageScreen/component";
import { getValue } from "@src/utils/localstorage";
import WhapplePayScreen from "./whapplepay";

export function TopUpWallet() {
  const { colors } = useTheme();
  const { viewRTLStyle, isDark, bgFullLayout, linearColorStyle, textColorStyle, textRTLStyle } = useValues();
  const [amount, setAmount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { paymentMethodData } = useSelector((state) => state.payment);
  const activePaymentMethods = paymentMethodData?.filter((method) => method?.status == true);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const dispatch = useDispatch();
  const { navigate } = useNavigation();
  const { translateData } = useSelector((state) => state.setting);
  const [topupLoading, setTopuploading] = useState(false);
  const { zoneValue } = useSelector((state: any) => state.zone);

  const paymentData = (index: number, name: any) => {
    setSelectedItem(index === selectedItem ? null : index);
    setSelectedPaymentMethod(index === selectedItem ? null : name);
  };

  const addBalance = async () => {
  setTopuploading(true);
  const currencyCode = await getValue('selectedCurrency');
  
  if (amount <= 0) {
    notificationHelper("", translateData.enterAmount, "error");
    setTopuploading(false);
    return;
  }

  if (!selectedPaymentMethod) {
    notificationHelper("", translateData.paymentMethodSelect, "error");
    setTopuploading(false);
    return;
  }

  // Check if payment method is whapplempay and redirect directly
  if (selectedPaymentMethod?.toLowerCase() === 'whapplepay') {
    const paymentData = {
      amount: amount,
      currency_code: currencyCode || 'XAF',
      currency_symbol: zoneValue?.currency_symbol || '',
      payment_method: selectedPaymentMethod,
    };
    
    // Navigate to WhapplePay screen with all required data
    navigate("WhapplePayScreen", { 
      paymentData: paymentData,
      originalPayload: {
        amount: amount,
        payment_method: selectedPaymentMethod,
        currency_code: currencyCode || 'XAF'
      }
    });
    setTopuploading(false);
    return;
  }

  // For other payment methods, show confirmation alert
  Alert.alert(
    selectedPaymentMethod, 
    translateData.topupAlertMessage + ` ${zoneValue?.currency_symbol || ''} ${amount} ${currencyCode || ''}`, 
    [
      {
        text: translateData.cancel,
        onPress: () => {
          setTopuploading(false);
        },
        style: "cancel"
      },
      {
        text: translateData.ok,
        onPress: () => {
          processPayment();
        }
      }
    ]
  );
};

// Separate function to process payment for other methods
const processPayment = () => {
  let payload: WalletTopUpDatainterface = {
    amount: amount,
    payment_method: selectedPaymentMethod,
    currency_code: 'XAF'
  };

  dispatch(walletTopUpData(payload))
    .unwrap()
    .then(async (res: any) => {
      if (res?.is_redirect) {
        navigate("PaymentWebView", {
          url: res.url,
          selectedPaymentMethod: selectedPaymentMethod,
          dataValue: res
        });
        setTopuploading(false);
      }
    })
    .catch((error) => {
      console.error("Redux Thunk Error:", error);
      setTopuploading(false);
    });
};
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => {
        if (!topupLoading) paymentData(index, item?.slug);
      }}
      activeOpacity={topupLoading ? 1 : 0.7}
    >
      <View
        style={{
          flexDirection: viewRTLStyle,
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: windowHeight(6),
        }}
      >
        <View
          style={[
            styles.modalPaymentView,
            {
              backgroundColor: isDark ? bgFullLayout : appColors.whiteColor,
              flexDirection: viewRTLStyle,
            },
          ]}
        >
          <CustomBackHandler />
          <View style={{ flexDirection: viewRTLStyle, flex: 1 }}>
            <View style={styles.imageBg}>
              <Image source={{ uri: item.image }} style={styles.paymentImage} />
            </View>
            <View style={styles.mailInfo}>
              <Text style={[styles.mail, { color: textColorStyle }]}>
                {item.name}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.payBtn, { marginLeft: 0 }]}>
          <RadioButton checked={index === selectedItem} color={appColors.primary} onPress={() => {
            if (!topupLoading) paymentData(index, item?.slug);
          }} />
        </View>
      </View>
      {index !== activePaymentMethods.length - 1 && (
        <View style={{
          borderBottomWidth: windowHeight(0.3),
          borderColor: colors.border, marginHorizontal: windowWidth(8)
        }}
        />
      )}
    </TouchableOpacity>
  );


  return (
    <View style={[commonStyles.flexContainer, { backgroundColor: isDark ? appColors.primaryText : appColors.lightGray }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 0.9 }}>
          <Header value={translateData.topupWallet} />
          <ScrollView style={[commonStyles.flexContainer, { marginBottom: windowHeight(19) }]} showsVerticalScrollIndicator={false}>
            <View
              style={{
                backgroundColor: isDark ? linearColorStyle : appColors.lightGray,
                height: "100%",
              }}
            >
              <View style={[styles.mainContainer]}>
                <Text
                  style={[
                    styles.titleTopup,
                    { color: textColorStyle, textAlign: textRTLStyle },
                  ]}
                >
                  {translateData.amount}
                </Text>
                <View
                  style={[
                    styles.inputView,
                    {
                      backgroundColor: isDark ? appColors.darkPrimary : colors.card,
                      flexDirection: viewRTLStyle,
                      borderColor: isDark ? appColors.darkBorder : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.icons, { color: isDark ? appColors.regularText : appColors.regularText }]}>
                    {zoneValue.currency_symbol}
                  </Text>
                  <TextInput
                    style={[
                      styles.textinput,
                      {
                        backgroundColor: isDark ? appColors.darkPrimary : colors.card,
                        color: isDark ? appColors.whiteColor : appColors.primaryText,
                      },
                    ]}
                    placeholder={translateData.amount}
                    placeholderTextColor={appColors.regularText}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(text) => setAmount(text)}
                  />
                </View>
                
                <View style={styles.titleContainer}>
                  <Text
                    style={[
                      styles.title,
                      { color: textColorStyle, textAlign: textRTLStyle },
                    ]}
                  >
                    {translateData.selectMethod}
                  </Text>
                </View>

                <View
                  style={[
                    styles.container,
                    { backgroundColor: isDark ? bgFullLayout : appColors.whiteColor, },
                    {
                      borderColor: isDark ? appColors.darkBorder : appColors.border
                    }
                  ]}
                >
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <View style={{
                        paddingHorizontal: windowHeight(12), paddingVertical: windowHeight(10), top: windowHeight(0), borderBottomWidth: windowHeight(0.3), marginHorizontal: windowHeight(4),
                        borderColor: colors.border
                      }}>
                        <SkeltonAppPage />
                      </View>
                    ))
                  ) : (
                   <FlatList
  // Only show WhapplePay as selectable method
  data={activePaymentMethods.filter(item => item?.slug?.toLowerCase() === 'whapplepay')}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  scrollEnabled={true}
  showsVerticalScrollIndicator={false}
/>

                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>


      </TouchableWithoutFeedback>
      <View style={[styles.payBottomView, , { backgroundColor: isDark ? appColors.darkHeader : appColors.whiteColor }]}>
        <View style={styles.addBtn}>
          <Button loading={topupLoading} title={translateData.addBalance} onPress={addBalance} />
        </View>
      </View>
    </View>

  );
}
