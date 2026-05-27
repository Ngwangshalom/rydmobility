import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { style } from "./style";
import { appColors } from "@src/themes";
import { external } from "../../styles/externalStyle";
import { windowHeight } from "@src/themes";
import { useValues } from "@src/utils/context/index";
import { InputTextProps } from "../type";
import { useSelector } from "react-redux";

export function InputText({
  title,
  placeholder,
  icon,
  show,
  showTitle,
  marginVertical,
  backgroundColor,
  placeholderTextColor,
  rightIcon,
  onPress,
  keyboard,
  value,
  onChangeText,
  warningText,
  secureText,
  borderColor,
  editable,
  autoCapitalize,
  Optional
}: InputTextProps) {
  const { bgFullStyle, textRTLStyle, isDark, viewRTLStyle } = useValues();
  const { translateData } = useSelector((state: any) => state.setting);

  // <-- Add focus state
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={style.container}>
      {showTitle && (
        <View style={{ flexDirection: viewRTLStyle, alignItems: 'center' }}>
          <Text style={[style.title, { textAlign: textRTLStyle, color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{title}</Text>
          {Optional && <Text style={[style.subtitle, { textAlign: textRTLStyle }]}>{translateData?.optional}</Text>}
        </View>
      )}
      <View
        style={[
          style.textInputContainer,
          { marginVertical: marginVertical },
          { backgroundColor: backgroundColor || bgFullStyle },
          {
            // <-- Use isFocused to change border color
            borderColor: isFocused ? appColors.primary : borderColor,
            borderWidth: windowHeight(1),
          },
        ]}
      >
        {icon && <View style={{ paddingHorizontal: show ? windowHeight(7) : windowHeight(5), left: windowHeight(4) }}>{icon}</View>}
        <TextInput
          style={[
            style.textInputColor,
            { paddingHorizontal: icon ? windowHeight(5) : windowHeight(13) },
            { textAlign: textRTLStyle },
            {
              color: editable === false
                ? appColors.regularText
                : isDark
                  ? appColors.whiteColor
                  : appColors.blackColor,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || appColors.regularText}
          keyboardType={keyboard}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureText}
          editable={editable}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}   // <-- track focus
          onBlur={() => setIsFocused(false)}    // <-- track blur
        />
        {rightIcon && (
          <TouchableOpacity style={[external.mh_5]} onPress={onPress} activeOpacity={0.7}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {warningText ? (
        <Text style={style.warningText}>{warningText}</Text>
      ) : null}
    </View>
  );
}
