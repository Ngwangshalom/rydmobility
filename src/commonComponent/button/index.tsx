import { Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React from "react";
import { commonStyles } from "../../styles/commonStyle";
import { styles } from "./styles";
import { appColors, fontSizes, windowHeight } from "@src/themes";
import { ButtonInterface } from "../type";

export function Button({
  title,
  onPress,
  width,
  height,
  backgroundColor,
  textColor,
  loading,
  disabled,
}: ButtonInterface) {
  const widthNumber = width || "100%";
  const heightNumber = height || 40;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          width: widthNumber,
          height: windowHeight(heightNumber),
          backgroundColor:
            disabled || loading
              ? appColors.primary + "80"
              : backgroundColor || appColors.primary,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="large"
          color={textColor || appColors.whiteColor}
          style={{ alignSelf: "center" }}
        />
      ) : (
        <Text
          style={[
            commonStyles.extraBold,
            {
              color: textColor || appColors.whiteColor,
              fontSize: fontSizes.FONT20,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
