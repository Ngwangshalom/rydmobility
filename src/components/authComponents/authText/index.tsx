import { Text, View } from "react-native";
import React from "react";
import { commonStyles } from "../../../styles/commonStyle";
import { external } from "../../../styles/externalStyle";
import { useValues } from "@src/utils/context/index";
import { AuthTextProps } from "../type";
import LottieView from "lottie-react-native";
import { windowHeight, windowWidth } from "@src/themes";

export function AuthText({ title, subtitle }: AuthTextProps) {
  const { textColorStyle, textRTLStyle, isRTL, isDark } = useValues();
  const animation = isDark
    ? require("@assets/images/gif/darkLine.json")
    : require("@assets/images/gif/line.json");

  return (
    <View>
      <View style={{ width: "100%" }}>
        <LottieView
          source={animation}
          style={{
            height: windowHeight(20),
            width: windowWidth(20),
          }}
          // resizeMode="cover"
          autoPlay
          loop
        />
      </View>
      <Text
        style={[
          commonStyles.regularTextBigBlack,
          { color: textColorStyle },
          { textAlign: textRTLStyle },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          commonStyles.regularText,
          external.pt_8,
          { textAlign: textRTLStyle },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
}
