import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Swiper from "react-native-swiper";
import DropDownPicker from "react-native-dropdown-picker";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { setValue } from "@src/utils/localstorage";
import {
  languageDataGet,
  settingDataGet,
  taxidosettingDataGet,
  translateDataGet,
} from "@src/api/store/actions";
import { useAppNavigation } from "@src/utils/navigation";
import { BackArrow } from "@utils/icons";
import Images from "@utils/images";
import { styles } from "./styles";
import { external } from "../../../styles/externalStyle";
import { appColors, windowHeight, windowWidth } from "@src/themes";
import { useValues } from "@src/utils/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppDispatch } from "@src/api/store";

export function Onboarding() {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { navigate } = useAppNavigation();
  const swiperRef = useRef<Swiper | null>(null);
  const hasNavigated = useRef(false);

  const { settingData, languageData, translateData, taxidoSettingData } =
    useSelector((state: any) => state.setting);

  const { isDark, bgFullStyle, textColorStyle, viewRTLStyle, setIsRTL } =
    useValues();

  const imageDarkBottom = isDark ? Images.bgDarkOnboard : Images.bgOnboarding;

  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<
    { label: string; value: string; icon: () => JSX.Element }[]
  >([]);


  useEffect(() => {
    const setDefaultLanguage = async () => {
      const defaultLang =
        settingData?.values?.general?.default_language?.locale;
      if (defaultLang) {
        await setValue("defaultLanguage", defaultLang);
      }
    };
    setDefaultLanguage();
  }, [settingData]);

  useEffect(() => {
    if (languageData?.data?.length) {
      const formattedItems = languageData.data.map((lang: any) => ({
        label: lang.name,
        value: lang.locale,
        icon: () => (
          <Image source={{ uri: lang.flag }} style={styles.flagImage} />
        ),
      }));

      setItems(formattedItems);
      const firstLanguage = formattedItems[0]?.value;
      setSelectedLanguage(firstLanguage);
      handleLanguageChange(firstLanguage);
    }
  }, [languageData]);

  const handleLanguageChange = async (value: string | null) => {
    if (!value) return;

    // Show loading while we switch everything
    setLoading(true);

    try {
      // Step 1: Update persistent storage for the selected language
      await setValue("selectedLanguage", value);

      // Step 2: Fetch all necessary data for the new language
      // We do this BEFORE updating the RTL state to avoid a "blink" with old data 
      await Promise.all([
        dispatch(settingDataGet()).unwrap(),
        dispatch(translateDataGet()).unwrap(),
        dispatch(taxidosettingDataGet()).unwrap()
      ]);

      // Step 3: Once data is in store, update UI direction and selected state
      if (value === "ar") {
        setIsRTL(true);
        await AsyncStorage.setItem("rtl", JSON.stringify(true));
      } else {
        setIsRTL(false);
        await AsyncStorage.setItem("rtl", JSON.stringify(false));
      }
      setSelectedLanguage(value);

    } catch (error) {
      console.log("Error changing language:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDropdown = async () => {
    if (!languageData?.data?.length) {
      setLoading(true);
      try {
        await dispatch(languageDataGet());
      } catch (error) {
        console.log("Error fetching language data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNavigation = () => {
    navigate("SignIn");
  };

  const handleIndexChanged = (index: number) => {
    if (index === 2 && !hasNavigated.current) {
      hasNavigated.current = true;
      setTimeout(handleNavigation, 300);
    }
  };

  const handleNext = (index: number) => {
    if (index < taxidoSettingData?.cabbooking_values?.onboarding?.length - 1) {
      swiperRef.current?.scrollBy(1);
    } else {
      handleNavigation();
    }
  };

  return (
    <Swiper
      ref={swiperRef}
      loop={false}
      autoplayTimeout={3}
      onIndexChanged={handleIndexChanged}
      activeDotStyle={styles.activeStyle}
      removeClippedSubviews
      dotColor={isDark ? appColors.dotDark : appColors.dotLight}
      dotStyle={styles.dotStyles}
      paginationStyle={styles.paginationStyle}>
      {Array.isArray(taxidoSettingData?.cabbooking_values?.onboarding) &&
        taxidoSettingData.taxido_values.onboarding.map(
          (slide: any, index: number) => (
            <TouchableWithoutFeedback
              key={index}
              onPress={() => {
                setOpen(false);
                Keyboard.dismiss();
              }}>
              <View
                style={[
                  styles.slideContainer,
                  {
                    backgroundColor: isDark
                      ? appColors.bgDark
                      : appColors.lightGray,
                  },
                ]}>
                <View
                  style={[
                    styles.languageContainer,
                    { flexDirection: viewRTLStyle },
                  ]}>
                  <DropDownPicker
                    open={open}
                    value={selectedLanguage}
                    items={items}
                    setOpen={setOpen}
                    setValue={setSelectedLanguage}
                    setItems={setItems}
                    placeholder={"Select Language"}

                    onSelectItem={item => handleLanguageChange(item?.value)}
                    onChangeValue={handleLanguageChange}
                    onOpen={handleOpenDropdown}
                    loading={loading}
                    listMode="SCROLLVIEW"
                    dropDownContainerStyle={[
                      styles.dropdownManu,
                      { backgroundColor: bgFullStyle },
                    ]}
                    labelStyle={[styles.labelStyle, { color: textColorStyle }]}
                    containerStyle={styles.dropdownContainer}
                    style={styles.dropdown}
                    textStyle={{ color: textColorStyle }}
                    theme={isDark ? "DARK" : "LIGHT"}
                    ActivityIndicatorComponent={({ color }) => (
                      <ActivityIndicator color={color} size="small" />
                    )}
                  />
                  <TouchableOpacity
                    style={{
                      borderWidth: windowHeight(1),
                      borderColor: colors.border,
                      justifyContent: "center",
                      paddingHorizontal: windowWidth(12),
                      paddingVertical: windowHeight(8),
                      borderRadius: windowHeight(4),
                      marginHorizontal: windowWidth(15),
                    }}
                    activeOpacity={0.7}
                    onPress={handleNavigation}>
                    <Text
                      style={[styles.skipText, { color: appColors.regularText }]}>
                      {translateData?.skip || "Skip"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    height:
                      Platform.OS === "ios"
                        ? windowHeight(370)
                        : windowHeight(435),
                  }}>
                  <Image
                    style={styles.imageBackground}
                    source={{ uri: slide?.onboarding_image_url }}
                  />
                </View>

                <View
                  style={[
                    styles.imageBgView,
                    {
                      backgroundColor: isDark
                        ? appColors.bgDark
                        : appColors.lightGray,
                    },
                  ]}>
                  <ImageBackground
                    resizeMode="stretch"
                    style={styles.img}
                    source={imageDarkBottom}>
                    <Text style={[styles.title, { color: textColorStyle }]}>
                      {slide?.title}
                    </Text>
                    <Text style={[styles.description, external.as_center]}>
                      {slide?.description}
                    </Text>
                    <TouchableOpacity
                      style={styles.backArrow}
                      onPress={() => handleNext(index)}
                      activeOpacity={0.7}>
                      <BackArrow
                        colors={appColors.whiteColor}
                        width={21}
                        height={21}
                      />
                    </TouchableOpacity>
                  </ImageBackground>
                </View>
              </View>
            </TouchableWithoutFeedback>
          ),
        )}
    </Swiper>
  );
}
