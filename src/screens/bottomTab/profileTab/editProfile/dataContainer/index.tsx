import React, {useState, useEffect, useCallback} from "react";
import {View, BackHandler, TouchableOpacity, Text} from "react-native";
import {InputText} from "@src/commonComponent";
import {styles} from "../style";
import {useValues} from "@src/utils/context/index";
import {appColors, appFonts, windowHeight, windowWidth} from "@src/themes";
import {SkeletonInput} from "./component";
import {useSelector} from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useLoadingContext} from "@src/utils/loadingContext";
import {useAppNavigation} from "@src/utils/navigation";
import {getAllCountries, ICountry} from "react-native-country-select";

const findCountryByCallingCode = async (code: string) => {
  const countries = getAllCountries();
  return countries.find(country => {
    const root = country.idd.root.replace("+", "");
    const suffix =
      country.idd.suffixes.length === 1 ? country.idd.suffixes[0] : "";
    return root + suffix === code;
  });
};

export function DataContainer({setForm: setParentForm}: any) {
  const {isDark, textRTLStyle, bgContainer, viewRTLStyle} = useValues();
  const {translateData} = useSelector((state: any) => state.setting);
  const {self} = useSelector((state: any) => state.account);

  const [currentCallingCode, setCurrentCallingCode] = useState(() => {
    const code = self?.country_code || "1";
    return code.startsWith("+") ? code : `+${code}`;
  });

  const [cca2Code, setCca2Code] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const loadingContext = useLoadingContext();
  const addressLoaded = loadingContext?.addressLoaded;
  const setAddressLoaded = loadingContext?.setAddressLoaded;
  const [_phoneNumber, _setPhoneNumber] = useState(
    self?.phone ? self.phone.toString() : "",
  );
  const [form, setForm] = useState({
    username: self?.name || "",
    email: self?.email || "",
    countryCode: self?.country_code || "+1",
    cca2: cca2Code,
    phoneNumber: self?.phone ? self.phone.toString() : "",
  });
  const {navigate} = useAppNavigation();

  useEffect(() => {
    setParentForm?.(form);
  }, [form, setParentForm]);

  // Sync form state when self data changes
  useEffect(() => {
    if (self) {
      setForm(prevForm => ({
        ...prevForm,
        username: self?.name || "",
        email: self?.email || "",
        phoneNumber: self?.phone ? self.phone.toString() : "",
        countryCode: self?.country_code || "+1",
      }));
      _setPhoneNumber(self?.phone ? self.phone.toString() : "");

      const code = self?.country_code || "1";
      const formattedCode = code.startsWith("+") ? code : `+${code}`;
      setCurrentCallingCode(formattedCode);
    }
  }, [self]);

  useEffect(() => {
    if (!addressLoaded) {
      setLoading(true);
      setLoading(false);
      setAddressLoaded?.(true);
    }
  }, [addressLoaded, setAddressLoaded]);

  const SkeletonLoader = ({variant}: any) => {
    let rectProps = {x: "0%", y: "0", width: "100%"};
    if (variant === 4) {
      rectProps = {x: "0%", y: "80%", width: "100%"};
    }
    return <SkeletonInput x={rectProps.x} width={rectProps.width} />;
  };

  const onChange = (name: string, value: string) => {
    setForm(prevForm => ({...prevForm, [name]: value}));
  };

  const [visible, setVisible] = useState(false);

  const handleBackPress = useCallback(() => {
    if (visible) {
      setVisible(false);
      return true;
    }
    return false;
  }, [visible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  useEffect(() => {
    const loadCountry = async () => {
      try {
        const saved = await AsyncStorage.getItem("userCountry");
        let selected = null;
        if (saved) {
          selected = JSON.parse(saved);
        } else if (self?.country_code) {
          const rawCode = self.country_code.replace("+", "");
          const found = await findCountryByCallingCode(rawCode);
          if (found) {
            const root = found.idd.root.replace("+", "");
            const suffix =
              found.idd.suffixes.length === 1 ? found.idd.suffixes[0] : "";
            selected = {
              code: `+${root}${suffix}`,
              cca2: found.cca2,
            };
          }
        }

        if (selected) {
          setCurrentCallingCode(selected.code);
          setCca2Code(selected.cca2);
          onChange("countryCode", selected.code);
          onChange("cca2", selected.cca2);
        }
      } catch (err) {}
    };
    loadCountry();
  }, [self]);

  const gotoEdit = (field: string) => {
    navigate("EditDetails" as any, {field, form: form});
  };

  return (
    <View style={styles.inputContainer}>
      {loading ? (
        <View style={{marginTop: windowHeight(20), right: windowHeight(7)}}>
          {[1, 2, 3, 4].map(variant => (
            <View key={variant} style={{marginBottom: windowHeight(10)}}>
              <SkeletonLoader variant={variant} />
            </View>
          ))}
        </View>
      ) : (
        <>
          <InputText
            title={translateData.userName}
            showTitle={true}
            borderColor={isDark ? appColors.darkBorder : appColors.lightGray}
            backgroundColor={isDark ? bgContainer : appColors.lightGray}
            placeholder={translateData.enterUserName}
            placeholderTextColor={
              isDark ? appColors.darkText : appColors.regularText
            }
            value={form.username}
            onChangeText={value => onChange("username", value)}
          />

          <Text
            style={{
              color: isDark ? appColors.whiteColor : appColors.primaryText,
              fontFamily: appFonts.medium,
              textAlign: textRTLStyle,
              marginTop: windowHeight(14),
            }}>
            {translateData.mobileNumber}
          </Text>

          <TouchableOpacity
            onPress={() => gotoEdit("mobile")}
            style={{flexDirection: "row"}}
            activeOpacity={0.7}>
            <View
              style={{
                marginTop: windowHeight(10),
                width: windowWidth(70),
                height: windowHeight(40),
                backgroundColor: isDark
                  ? appColors.darkPrimary
                  : appColors.lightGray,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
                borderWidth: 1,
                borderRadius: windowHeight(5),
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Text
                style={{
                  color: isDark ? appColors.whiteColor : appColors.primaryText,
                }}>
                {currentCallingCode}
              </Text>
            </View>
            <View
              style={{
                marginTop: windowHeight(10),
                width: windowWidth(308),
                height: windowHeight(40),
                backgroundColor: isDark
                  ? appColors.darkPrimary
                  : appColors.lightGray,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
                borderWidth: 1,
                marginHorizontal: windowWidth(15),
                borderRadius: windowHeight(5),
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: viewRTLStyle,
              }}>
              <Text
                style={{
                  marginHorizontal: windowWidth(15),
                  color: isDark ? appColors.whiteColor : appColors.primaryText,
                  width: "70%",
                  flexWrap: "wrap",
                }}>
                {form.phoneNumber}
              </Text>
              <Text
                style={{
                  textAlign: "left",
                  marginHorizontal: windowWidth(15),
                  color: isDark ? appColors.whiteColor : appColors.primaryText,
                  textDecorationLine: "underline",
                }}>
                {translateData?.edit || "Edit"}
              </Text>
            </View>
          </TouchableOpacity>

          <Text
            style={{
              color: isDark ? appColors.whiteColor : appColors.primaryText,
              fontFamily: appFonts.medium,
              textAlign: textRTLStyle,
              marginTop: windowHeight(14),
            }}>
            {translateData.email}
          </Text>
          <TouchableOpacity
            onPress={() => gotoEdit("email")}
            style={{
              backgroundColor: isDark
                ? appColors.darkPrimary
                : appColors.lightGray,
              borderColor: isDark ? appColors.darkBorder : appColors.border,
              borderWidth: 1,
              height: windowHeight(40),
              borderRadius: windowHeight(5),
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: viewRTLStyle,
              marginTop: windowHeight(10),
            }}
            activeOpacity={0.7}>
            <Text
              style={{
                textAlign: "left",
                marginHorizontal: windowWidth(15),
                color: isDark ? appColors.whiteColor : appColors.primaryText,
                width: "70%",
                flexWrap: "wrap",
              }}>
              {form.email}
            </Text>
            <Text
              style={{
                textAlign: "left",
                marginHorizontal: windowWidth(15),
                color: isDark ? appColors.whiteColor : appColors.primaryText,
                textDecorationLine: "underline",
              }}>
              {translateData?.edit}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
