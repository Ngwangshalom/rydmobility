import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import React from "react";
import {styles} from "../../style";
import Images from "@src/utils/images";
import {useValues} from "@src/utils/context/index";
import {appColors, windowWidth, fontSizes, appFonts} from "@src/themes";
import {Copied} from "@src/utils/icons";
import Clipboard from "@react-native-clipboard/clipboard";
import {useAppNavigation} from "@src/utils/navigation";
import {useSelector} from "react-redux";
import {notificationHelper} from "@src/commonComponent";

export function Coupons({couponsList, route}: any) {
  const {isDark, textColorStyle, viewRTLStyle, textRTLStyle} = useValues();
  const bgImage = isDark ? Images.promoCodeList : Images.promoCodeBg;
  const {navigate, goBack}: any = useAppNavigation();
  const {translateData} = useSelector((state: any) => state.setting);
  const {zoneValue} = useSelector((state: any) => state.zone);

  // Calculate days remaining until expiration
  const getDaysRemaining = (endDate: string): number | null => {
    if (!endDate) return null;

    try {
      // Parse the end date - handle both YYYY-MM-DD and DD-MM-YYYY formats
      const parts = endDate.split("-");
      let expiryDate: Date;

      if (parts.length === 3) {
        // Check if first part is a 4-digit year (YYYY-MM-DD format)
        if (parts[0].length === 4) {
          // YYYY-MM-DD format
          expiryDate = new Date(endDate);
        } else {
          // DD-MM-YYYY format
          expiryDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      } else {
        expiryDate = new Date(endDate);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);

      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  const copyToClipboard = (coupon: any) => {
    Clipboard.setString(coupon.code);
    Platform.OS === "ios" &&
      notificationHelper("", translateData.copyClipboard, "success");
    if (route?.params?.getCoupon) {
      route.params.getCoupon(coupon);
    }
    if (route?.params?.from == "payment") {
      goBack();
    }
  };

  const gotoDetails = (value: number) => {
    navigate("PromoCodeDetail", {item: value});
  };

  return (
    <>
      {couponsList?.data?.map((item: any, index: number) => {
        const daysRemaining = getDaysRemaining(item?.end_date);
        const isExpiringSoon =
          daysRemaining !== null && daysRemaining <= 10 && daysRemaining >= 0;
        const discountText =
          item?.type == "percentage"
            ? `${translateData.flat} ${Math.round(item?.amount)}${
                translateData.offPercentage
              }`
            : `${translateData.flatDoller} ${
                zoneValue?.currency_symbol
              }${Math.round(item?.amount)} ${translateData.off}`;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => gotoDetails(item)}
            activeOpacity={0.7}
            style={styles.mainContainer}>
            <ImageBackground
              resizeMode="stretch"
              style={styles.promoCodeImageBackground}
              source={bgImage}>
              <View
                style={[
                  styles.promoCodeValidityContainer,
                  {flexDirection: viewRTLStyle},
                ]}>
                <View>
                  <Text
                    style={[
                      styles.promoCodeText,
                      {color: textColorStyle},
                      {textAlign: textRTLStyle},
                    ]}>
                    {discountText}
                  </Text>
                  <Text
                    style={[
                      styles.promoCodeSubtitle,
                      {textAlign: textRTLStyle},
                    ]}>
                    {item?.description?.length > 30
                      ? `${item?.description.slice(0, 30)}...`
                      : item?.description}
                  </Text>
                  {item?.end_date ? (
                    <Text
                      style={[
                        styles.promoCodeSubtitle,
                        {
                          textAlign: textRTLStyle,
                        },
                      ]}>
                      {translateData.validTill} : {item?.end_date}
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.promoCodeSubtitle,
                        {
                          textAlign: textRTLStyle,
                        },
                      ]}>
                      {/* {translateData.validTill} : {translateData.comingSoon} */}
                    </Text>
                  )}
                </View>
                <View>
                  <Image
                    source={Images.discount}
                    style={styles.discountImage}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.dashedLine,
                  {
                    borderColor: isDark
                      ? appColors.darkBorder
                      : appColors.primaryGray,
                  },
                ]}
              />
              <View
                style={[
                  styles.promoCodeValidityContainer,
                  {flexDirection: viewRTLStyle},
                ]}>
                <View style={{flexDirection: "row", alignItems: "center"}}>
                  <View style={styles.promoCodeCodeContainer}>
                    <Text style={styles.promoCodeCodeText}>{item?.code}</Text>
                  </View>
                  {isExpiringSoon && (
                    <View style={{marginLeft: windowWidth(8)}}>
                      <Text style={expireSoonStyles.simpleText}>
                        {translateData?.expireSoon}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => copyToClipboard(item)}
                  style={[styles.copyView, {flexDirection: viewRTLStyle}]}>
                  <Copied />
                  <Text
                    style={[
                      styles.promoCodeUseNow,
                      {color: appColors.primary},
                    ]}>
                    {translateData.copy}
                  </Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        );
      })}
    </>
  );
}

// Aesthetic styles for the "Expire Soon" text
const expireSoonStyles = StyleSheet.create({
  simpleText: {
    fontSize: fontSizes.FONT14,
    fontFamily: appFonts.medium,
    letterSpacing: 0.5,
    color: appColors.alertRed,
  },
});
