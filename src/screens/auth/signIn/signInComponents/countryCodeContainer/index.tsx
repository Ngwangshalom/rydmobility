import React, { useEffect, useState } from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { commonStyles } from "../../../../../styles/commonStyle";
import { external } from "../../../../../styles/externalStyle";
import { appColors, windowWidth } from "@src/themes";
import styles from "../../styles";
import { useValues } from "@src/utils/context/index";
import { useSelector } from "react-redux";
import CountrySelect, { ICountry } from "react-native-country-select";
import { CountryCodeContainerProps } from "./types";

export function CountryCodeContainer({
  setCca2,
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
  width,
  backGroundColor,
  borderColor,
  borderColor1,

  countryCode,
  error,
  setError,
}: CountryCodeContainerProps) {
  const { viewRTLStyle, isDark, textRTLStyle } = useValues();
  const { translateData, taxidoSettingData } = useSelector(
    (state: any) => state.setting,
  );

  const [numberShow, setNumberShow] = useState<boolean>(true);
  const [show, setShow] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocused1, setIsFocused1] = useState(false);

  useEffect(() => {
    const defaultCode = taxidoSettingData?.cabbooking_values?.ride?.country_code;
    if (!countryCode && defaultCode) {
      setCountryCode?.(`+${defaultCode}`);
    }
  }, [taxidoSettingData]);

  const handleTextChange = (newPhoneNumber: string) => {
    if (error) {
      setError("");
    }

    setPhoneNumber(newPhoneNumber);
    setNumberShow(/^\d*$/.test(newPhoneNumber));
  };

  return (
    <View>
      <View
        style={[
          external.fd_row,
          external.ai_center,
          external.mt_5,
          { flexDirection: viewRTLStyle },
        ]}
      >
        {numberShow && (
          <TouchableOpacity
            style={[
              styles.countryCodeContainer,
              {
                backgroundColor: backGroundColor,
                borderColor: isFocused1
                  ? appColors.primary
                  : borderColor1
                    ? borderColor1
                    : isDark
                      ? appColors.darkPrimary
                      : appColors.border,
              },
            ]}
            onPress={() => {
              setIsFocused1(true);
              setShow(true); // 👈 OPEN PICKER
            }}
          >
            <View style={styles.pickerButton}>
              <Text
                style={[
                  styles.codeText,
                  {
                    color: isDark
                      ? appColors.whiteColor
                      : appColors.primaryText,
                  },
                ]}
              >
                {countryCode}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View
          style={[
            styles.phoneNumberInput,
            {
              width: (numberShow ? width ?? "74%" : "100%") as any,
              backgroundColor: backGroundColor,
              flexDirection: viewRTLStyle as
                | "row"
                | "row-reverse"
                | "column"
                | "column-reverse",
              right: numberShow ? 0 : 3,
              borderColor: isFocused ? appColors.primary : borderColor,
              borderWidth: windowWidth(1.4),
            },
          ]}
        >
          <TextInput
            style={[
              commonStyles.regularText,
              styles.inputText,
              {
                color: isDark ? appColors.whiteColor : appColors.blackColor,
                textAlign: textRTLStyle,
              },
            ]}
            placeholderTextColor={
              isDark ? appColors.darkText : appColors.regularText
            }
            placeholder={translateData?.enterNumberandEmailBoth}
            keyboardType={"email-address"}
            autoCapitalize="none"
            value={phoneNumber}
            onChangeText={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
      </View>

      {error && <Text style={styles.warningText}>{error}</Text>}

      {show && (
        <CountrySelect
          visible={show}
          onSelect={(country: ICountry) => {
            const root = country.idd.root.replace("+", "");
            const suffix =
              country.idd.suffixes.length === 1 ? country.idd.suffixes[0] : "";
            setCountryCode?.(`+${root}${suffix}`);
            setCca2?.(country.cca2);
            setShow(false);
            setIsFocused1(false);
          }}
          onClose={() => {
            setShow(false);
            setIsFocused1(false);
          }}
          language={translateData?.languageCode === "ar" ? "ara" : "eng"}
          showAlphabetFilter={true}
        />
      )}
    </View>
  );
}
