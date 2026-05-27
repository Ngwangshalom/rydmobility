import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import styles from "./styles";
import {
  appColors,
  appFonts,
  fontSizes,
  windowHeight,
  windowWidth,
} from "@src/themes";
import { useValues } from "@src/utils/context/index";
import { Header } from "@src/commonComponent";
import {
  Gps,
  PickLocation,
  Radio,
  RatingStar,
  RatingEmptyStart,
  CalenderSmall,
  ClockSmall,
  Driving,
} from "@src/utils/icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";

export function OneWayDaily() {
  const { viewRTLStyle, isDark, textRTLStyle, textColorStyle, bgFullStyle } =
    useValues();
  const route = useRoute<any>();
  const { payload, results, sub_category_name } = route.params || {};
  const navigation = useNavigation<any>();

  const { translateData } = useSelector((state: any) => state.setting);
  const [selectedDriver, setSelectedDriver] = useState(0);

  const pickup = payload?.locations?.[0] || "Pickup location";
  const destination = payload?.locations?.[1] || "Destination";

  const cities = [
    {
      label: pickup,
      text: "Pickup location",
      type: "start",
    },
    {
      label: destination,
      text: "Destination",
      type: "end",
    },
  ];

  const drivers =
    results?.map((item: any) => ({
      id: item.id,
      name: item.name,
      rating: parseFloat(item.rating_count) || 0,
      reviews: item.review_count,
      price: item.ride_fare,
      image: item.image || item.profile_image,
      driver_id: item.id,
      email: item.email,
    })) || [];

  return (
    <View
      style={[
        styles.main,
        { backgroundColor: isDark ? appColors.bgDark : appColors.lightGray },
      ]}
    >
      <Header value={translateData.selectDriver} />
      <ScrollView
        contentContainerStyle={[
          styles.view,
          {
            backgroundColor: isDark ? appColors.bgDark : appColors.lightGray,
          },
        ]}
      >
        <View
          style={[
            styles.scrollView,
            {
              backgroundColor: isDark
                ? appColors.darkPrimary
                : appColors.whiteColor,
              borderColor: isDark ? appColors.darkBorder : appColors.border,
            },
          ]}
        >
          <View>
            {cities.map((step, index) => (
              <View key={index}>
                <View
                  style={[
                    styles.stepContainer,
                    {
                      flexDirection: viewRTLStyle,
                      alignItems: "center",
                    },
                  ]}
                >
                  <View style={{ marginRight: windowWidth(12) }}>
                    {step.type === "start" && <PickLocation />}
                    {step.type === "middle" && <Radio />}
                    {step.type === "end" && <Gps />}
                  </View>

                  <View style={[styles.labelColumn, { paddingHorizontal: 0 }]}>
                    <Text
                      style={[
                        styles.label,
                        {
                          color: isDark ? appColors.whiteColor : appColors.gray,
                          textAlign: textRTLStyle,
                          marginHorizontal: 0,
                          width: "auto",
                        },
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                </View>
                {index !== cities.length - 1 && (
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderColor: isDark ? appColors.darkBorder : "#F0F0F0",
                      marginVertical: windowHeight(5),
                      borderStyle: "dashed",
                    }}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Date and Time Section */}
        <View
          style={[
            styles.dateTimeContainer,
            {
              backgroundColor: isDark
                ? appColors.darkPrimary
                : appColors.whiteColor,
              borderColor: isDark ? appColors.darkBorder : appColors.border,
            },
          ]}
        >
          <View style={styles.dateContainer}>
            <Text style={[styles.dateTimeLabel, { color: textColorStyle }]}>
              {translateData.startDate}
            </Text>
            <View style={styles.dateTimeValueRow}>
              <CalenderSmall color={textColorStyle} />
              <Text
                style={[
                  styles.dateTimeValue,
                  { color: isDark ? appColors.whiteColor : appColors.gray },
                ]}
              >
                {payload?.ride_date}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.separator,
              {
                backgroundColor: isDark
                  ? appColors.darkBorder
                  : appColors.border,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
              },
            ]}
          />
          <View style={styles.timeContainer}>
            <Text style={[styles.dateTimeLabel, { color: textColorStyle }]}>
              {translateData.startTime}
            </Text>
            <View style={styles.dateTimeValueRow}>
              <ClockSmall color={textColorStyle} />
              <Text
                style={[
                  styles.dateTimeValue,
                  { color: isDark ? appColors.whiteColor : appColors.gray },
                ]}
              >
                {payload?.ride_time}
              </Text>
            </View>
          </View>
        </View>

        {payload?.end_date && (
          <View
            style={[
              styles.dateTimeContainer,
              {
                marginTop: windowHeight(10),
                backgroundColor: isDark
                  ? appColors.darkPrimary
                  : appColors.whiteColor,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
              },
            ]}
          >
            <View style={styles.dateContainer}>
              <Text style={[styles.dateTimeLabel, { color: textColorStyle }]}>
                {translateData.endDate}
              </Text>
              <View style={styles.dateTimeValueRow}>
                <CalenderSmall color={textColorStyle} />
                <Text
                  style={[
                    styles.dateTimeValue,
                    { color: isDark ? appColors.whiteColor : appColors.gray },
                  ]}
                >
                  {payload?.end_date}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.separator,
                {
                  backgroundColor: isDark
                    ? appColors.darkBorder
                    : appColors.border,
                  borderColor: isDark ? appColors.darkBorder : appColors.border,
                },
              ]}
            />
            <View style={styles.timeContainer}>
              <Text style={[styles.dateTimeLabel, { color: textColorStyle }]}>
                {translateData.endTime}
              </Text>
              <View style={styles.dateTimeValueRow}>
                <ClockSmall color={textColorStyle} />
                <Text
                  style={[
                    styles.dateTimeValue,
                    { color: isDark ? appColors.whiteColor : appColors.gray },
                  ]}
                >
                  {payload?.end_time}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View
            style={{
              flex: 1,
              marginRight: payload?.trip_type_selection ? 10 : 0,
            }}
          >
            <Text
              style={[
                styles.sectionTitle,
                { textAlign: textRTLStyle, color: textColorStyle },
              ]}
            >
              {translateData?.selectedCarType}
            </Text>
            <View
              style={[
                styles.carTypeCard,
                {
                  backgroundColor: isDark
                    ? appColors.darkPrimary
                    : appColors.whiteColor,
                  borderColor: isDark ? appColors.darkBorder : appColors.border,
                },
              ]}
            >
              <Driving color={textColorStyle} />
              <Text style={[styles.carTypeName, { color: textColorStyle }]}>
                {payload?.gear_type
                  ? payload.gear_type.charAt(0).toUpperCase() +
                    payload.gear_type.slice(1)
                  : "Automatic"}
              </Text>
            </View>
          </View>
          {payload?.trip_type_selection && (
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.sectionTitle,
                  { textAlign: textRTLStyle, color: textColorStyle },
                ]}
              >
                {translateData.tripType}
              </Text>
              <View
                style={[
                  styles.carTypeCard,
                  {
                    backgroundColor: isDark
                      ? appColors.darkPrimary
                      : appColors.whiteColor,
                    borderColor: isDark
                      ? appColors.darkBorder
                      : appColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.carTypeName,
                    { color: textColorStyle, marginLeft: 0 },
                  ]}
                >
                  {payload?.trip_type_selection}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { textAlign: textRTLStyle, color: textColorStyle },
          ]}
        >
          {translateData.selectDriverForTravel}
        </Text>

        {drivers.map((driver: any, index: number) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={() => {
              setSelectedDriver(index);
              navigation.navigate("OneWayRideDetails", {
                driver: driver,
                payload: payload,
              });
            }}
            style={[
              styles.driverCard,
              selectedDriver === index && styles.selectedDriverCard,
              {
                backgroundColor: isDark
                  ? appColors.darkPrimary
                  : appColors.whiteColor,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
              },
            ]}
          >
            <View style={styles.driverInfoRow}>
              {driver.image ? (
                <Image
                  style={styles.driverImage}
                  source={{ uri: driver.image }}
                />
              ) : (
                <View
                  style={[
                    styles.driverImage,
                    {
                      backgroundColor: appColors.primary,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: appColors.whiteColor,
                      fontSize: fontSizes.FONT24,
                      fontFamily: appFonts.bold,
                    }}
                  >
                    {driver.name ? driver.name.charAt(0).toUpperCase() : "D"}
                  </Text>
                </View>
              )}
              <View style={styles.driverDetails}>
                <Text
                  style={[
                    styles.driverName,
                    { color: textColorStyle, textAlign: textRTLStyle },
                  ]}
                >
                  {driver.name}
                </Text>
                <View style={styles.ratingRow}>
                  {Array.from({ length: 5 }).map((_, i) =>
                    i < Math.floor(driver.rating) ? (
                      <RatingStar key={i} />
                    ) : (
                      <RatingEmptyStart key={i} />
                    ),
                  )}
                  <Text
                    style={[
                      styles.ratingText,
                      { color: isDark ? appColors.whiteColor : appColors.gray },
                    ]}
                  >
                    {driver.rating} ({driver.reviews})
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.dashedLine,
                {
                  borderColor: isDark ? appColors.darkBorder : appColors.border,
                },
              ]}
            />

            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: textColorStyle }]}>
                {translateData.perDayPrice}
              </Text>
              <View style={styles.priceValueContainer}>
                <Text style={styles.priceValue}>${driver.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
