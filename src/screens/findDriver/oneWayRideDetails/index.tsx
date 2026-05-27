import React, { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import styles from "./styles";
import { Button, Header } from "@src/commonComponent";
import {
  CalenderSmall,
  ClockSmall,
  PickLocation,
  RatingStar,
  RatingEmptyStart,
  Driving,
  Gps,
} from "@src/utils/icons";
import { appColors, windowWidth, windowHeight } from "@src/themes";
import { useValues } from "@src/utils/context/index";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { getValue } from "@src/utils/localstorage";
import { URL } from "@src/api/config";
import { notificationHelper } from "@src/commonComponent/notificationHelper";

export function OneWayRideDetails() {
  const { isDark, textColorStyle, viewRTLStyle } = useValues();
  const route = useRoute<any>();
  const { driver, payload, sub_category_name } = route.params || {};
  const navigation = useNavigation<any>();
  const [bookLoading, setBookLoading] = useState(false);
  const { translateData } = useSelector((state: any) => state.setting);

  const pickup = payload?.locations?.[0] || "Pickup location";
  const destination = payload?.locations?.[1] || "Destination";

  const formatDates = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = String(date.getFullYear());
    const hours = String(date.getHours() % 12 || 12).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";

    return {
      date: `${day} ${month}'${year}`,
      time: `${hours}:${minutes} ${ampm}`,
    };
  };

  const formattedValue = formatDates(new Date());

  const formatToApiDate = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return "";

    const monthMap: { [key: string]: string } = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    try {
      // dateStr example: "25 Mar'2026"
      const dateParts = dateStr.replace("'", " ").split(" ");
      const day = dateParts[0].padStart(2, "0");
      const month = monthMap[dateParts[1]];
      const year = dateParts[2];

      // timeStr example: "10:00 AM"
      const [time, ampm] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");
      let h = parseInt(hours);
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      const formattedHours = String(h).padStart(2, "0");
      const formattedMinutes = String(minutes).padStart(2, "0");

      return `${year}-${month}-${day} ${formattedHours}:${formattedMinutes}:00`;
    } catch (e) {
      console.log("Error formatting date", e);
      return "";
    }
  };

  const BookRideRequest = async () => {
    const token = await getValue("token");
    setBookLoading(true);
    try {
      const formData = new FormData();
      payload?.location_coordinates.forEach((coord: any, index: number) => {
        formData.append(`location_coordinates[${index}][lat]`, coord.lat);
        formData.append(`location_coordinates[${index}][lng]`, coord.lng);
      });
      payload?.locations.forEach((loc: any, index: number) => {
        formData.append(`locations[${index}]`, loc);
      });
      formData.append("service_id", payload?.service_id);
      formData.append("service_category_id", payload?.service_category_id);
      formData.append("vehicle_type_id", payload?.vehicle_type_id);
      const finalStartDate = payload?.ride_date || formattedValue.date;
      const finalStartTime = payload?.ride_time || formattedValue.time;
      const finalEndDate = payload?.end_date || "";
      const finalEndTime = payload?.end_time || "";

      formData.append(
        "start_time",
        formatToApiDate(finalStartDate, finalStartTime),
      );
      formData.append(
        "end_time",
        finalEndDate && finalEndTime
          ? formatToApiDate(finalEndDate, finalEndTime)
          : "",
      );
      formData.append("trip_type", payload?.trip_type_selection || "");
      formData.append("gear_type", payload?.gear_type || "");
      formData.append("drivers", driver?.id || "");
      formData.append("ride_fare", driver?.price || "");

      const response = await fetch(`${URL}/api/rideRequest`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();
      setBookLoading(false);

      if (response.ok) {
        notificationHelper(
          "",
          translateData.requestSuccessfullySent,
          "success",
        );
        navigation.navigate("DriverRequestScreen");
      } else {
        notificationHelper(
          "",
          responseData?.message || "Something went wrong",
          "error",
        );
      }
    } catch (error) {
      setBookLoading(false);
      notificationHelper("", translateData.failedSendReq, "error");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? appColors.bgDark : appColors.lightGray,
      }}
    >
      <Header value={translateData?.driverDetails} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: windowWidth(15),
        }}
      >
        <View
          style={[
            styles.driverProfileCard,
            {
              backgroundColor: isDark
                ? appColors.darkPrimary
                : appColors.whiteColor,
            },
          ]}
        >
          <View
            style={[
              styles.largeDriverImage,
              {
                borderColor: isDark
                  ? appColors.darkPrimary
                  : appColors.lightGray,
              },
            ]}
          >
            {driver?.image ? (
              <Image
                source={{ uri: driver.image }}
                style={{ width: "100%", height: "100%", borderRadius: 100 }}
              />
            ) : (
              <Text style={styles.driverNameMain1}>
                {driver?.name?.charAt(0)}
              </Text>
            )}
          </View>
          <Text style={[styles.driverNameMain, { color: textColorStyle }]}>
            {driver?.name}
          </Text>
          <View style={styles.mainRatingRow}>
            {Array.from({ length: 5 }).map((_, i) =>
              i < Math.floor(driver?.rating) ? (
                <RatingStar key={i} />
              ) : (
                <RatingEmptyStart key={i} />
              ),
            )}
            <Text
              style={[
                styles.ratingTextMain,
                { color: isDark ? appColors.darkText : appColors.gray },
              ]}
            >
              {driver?.rating}({driver?.reviews})
            </Text>
          </View>

          {driver?.email && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: textColorStyle }]}>
                {translateData?.email}:
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isDark ? appColors.darkText : appColors.gray },
                ]}
              >
                {driver.email}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textColorStyle }]}>
              {translateData?.driverPriceText}:
            </Text>
            <Text
              style={[
                styles.infoValue,
                { color: isDark ? appColors.darkText : appColors.gray },
              ]}
            >
              ${driver?.price}/{translateData?.day}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: isDark
              ? appColors.darkPrimary
              : appColors.whiteColor,
            borderRadius: windowHeight(12),
            padding: windowHeight(10),
            marginTop: windowHeight(10),
          }}
        >
          <View style={[styles.valueRow, { alignItems: "flex-start" }]}>
            <View>
              <PickLocation />
            </View>
            <Text
              style={[
                styles.locAddress,
                {
                  marginLeft: windowWidth(12),
                  flex: 1,
                  color: isDark ? appColors.darkText : appColors.gray,
                },
              ]}
              numberOfLines={2}
            >
              {pickup}
            </Text>
          </View>

          <View
            style={[
              styles.hDivider,
              { backgroundColor: isDark ? appColors.darkBorder : "#F0F0F0" },
            ]}
          />

          <View style={[styles.valueRow, { alignItems: "flex-start" }]}>
            <View>
              <Gps />
            </View>
            <Text
              style={[
                styles.locAddress,
                {
                  marginLeft: windowWidth(12),
                  flex: 1,
                  color: isDark ? appColors.darkText : appColors.gray,
                },
              ]}
              numberOfLines={2}
            >
              {destination}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.dateTimeSplitCard,
            {
              backgroundColor: isDark
                ? appColors.darkPrimary
                : appColors.whiteColor,
              borderColor: isDark ? appColors.darkBorder : appColors.border,
            },
          ]}
        >
          <View style={styles.dateTimePart}>
            <Text style={[styles.labelSmall, { color: textColorStyle }]}>
              {translateData?.startDate}
            </Text>
            <View style={styles.valueRow}>
              <CalenderSmall color={appColors.primary} />
              <Text
                style={[
                  styles.valueTextSmall,
                  { color: isDark ? appColors.darkText : appColors.gray },
                ]}
              >
                {payload?.ride_date || formattedValue.date}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.vDivider,
              {
                backgroundColor: isDark ? appColors.darkBorder : "#F0F0F0",
                borderColor: isDark ? appColors.darkBorder : appColors.border,
              },
            ]}
          />
          <View style={styles.dateTimePart}>
            <Text style={[styles.labelSmall, { color: textColorStyle }]}>
              {translateData?.startTime}
            </Text>
            <View style={styles.valueRow}>
              <ClockSmall color={appColors.primary} />
              <Text
                style={[
                  styles.valueTextSmall,
                  { color: isDark ? appColors.darkText : appColors.gray },
                ]}
              >
                {payload?.ride_time || formattedValue.time}
              </Text>
            </View>
          </View>
        </View>

        {payload?.end_date && (
          <View
            style={[
              styles.dateTimeSplitCard,
              {
                backgroundColor: isDark
                  ? appColors.darkPrimary
                  : appColors.whiteColor,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
                marginTop: windowHeight(10),
              },
            ]}
          >
            <View style={styles.dateTimePart}>
              <Text style={[styles.labelSmall, { color: textColorStyle }]}>
                {translateData?.endDate}
              </Text>
              <View style={styles.valueRow}>
                <CalenderSmall color={appColors.primary} />
                <Text
                  style={[
                    styles.valueTextSmall,
                    { color: isDark ? appColors.darkText : appColors.gray },
                  ]}
                >
                  {payload?.end_date}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.vDivider,
                {
                  backgroundColor: isDark ? appColors.darkBorder : "#F0F0F0",
                  borderColor: isDark ? appColors.darkBorder : appColors.border,
                },
              ]}
            />
            <View style={styles.dateTimePart}>
              <Text style={[styles.labelSmall, { color: textColorStyle }]}>
                {translateData?.endTime}
              </Text>
              <View style={styles.valueRow}>
                <ClockSmall color={appColors.primary} />
                <Text
                  style={[
                    styles.valueTextSmall,
                    { color: isDark ? appColors.darkText : appColors.gray },
                  ]}
                >
                  {payload?.end_time}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View
          style={{
            flexDirection: viewRTLStyle,
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <View
            style={[
              styles.selectedCarCard,
              {
                backgroundColor: isDark
                  ? appColors.darkPrimary
                  : appColors.whiteColor,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
              },
            ]}
          >
            <Driving color={appColors.primary} />
            <Text style={[styles.carText, { color: textColorStyle }]}>
              {payload?.gear_type
                ? payload.gear_type.charAt(0).toUpperCase() +
                  payload.gear_type.slice(1)
                : "Automatic"}
            </Text>
          </View>
          <View></View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.proceedToPayBtn,
          {
            backgroundColor: isDark
              ? appColors.darkPrimary
              : appColors.whiteColor,
          },
        ]}
      >
        <Button
          title={translateData?.bookDriver}
          onPress={BookRideRequest}
          backgroundColor={appColors.primary}
          loading={bookLoading}
          disabled={bookLoading}
        />
      </View>
    </View>
  );
}
