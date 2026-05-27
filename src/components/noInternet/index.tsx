import { View, Text, Image } from "react-native";
import React from "react";
import { styles } from "./styles";
import { useValues } from "@src/utils/context/index";
import {
  appColors,
  appFonts,
  fontSizes,
  windowHeight,
  windowWidth,
} from "@src/themes";
import Images from "@src/utils/images";
import { NoInternetProps } from "./type";

export function NoInternet({
  title,
  details,
  image,
  btnHide,
}: NoInternetProps) {
  const { viewRTLStyle, isDark } = useValues();

  return (
    <View style={styles.mainContainer}>
      {image && (
        <Image source={image} style={styles.image} resizeMode="contain" />
      )}

      <View style={[styles.mainView, { flexDirection: viewRTLStyle }]}>
        <Text
          style={[
            styles.title,
            { color: isDark ? appColors.whiteColor : appColors.primaryText },
          ]}
        >
          {title}
        </Text>
      </View>

      <Text
        style={[
          styles.details,
          { color: isDark ? appColors.whiteColor : appColors.regularText },
        ]}
      >
        {details}
      </Text>

      {!btnHide && (
        <View style={{ justifyContent: "center", bottom: "20%" }}>
          <Image
            source={Images.noInternet}
            style={{
              width: windowHeight(230),
              height: windowHeight(230),
              alignSelf: "center",
            }}
            resizeMode="contain"
          />

          <Text
            style={{
              textAlign: "center",
              color: isDark ? appColors.whiteColor : appColors.blackColor,
              fontSize: fontSizes.FONT22,
              fontFamily: appFonts.medium,
              marginTop: windowHeight(5),
            }}
          >
            No Internet
          </Text>

          <Text
            style={{
              textAlign: "center",
              color: appColors.gray,
              fontSize: fontSizes.FONT18,
              fontFamily: appFonts.regular,
              marginTop: windowHeight(8),
              paddingHorizontal: windowWidth(15),
            }}
          >
            No Internet Available
          </Text>
        </View>
      )}
    </View>
  );
}
