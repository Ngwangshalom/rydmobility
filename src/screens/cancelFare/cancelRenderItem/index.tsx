import React, { useEffect, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import { external } from "../../../styles/externalStyle";
import { styles } from "../style";
import { commonStyles } from "../../../styles/commonStyle";
import { Button, notificationHelper, ProgressBar } from "@src/commonComponent";
import { useValues } from "@src/utils/context/index";
import { Star, Verification } from "@utils/icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../api/store/index";
import { allRides, bidUpdate } from "../../../api/store/actions/index";
import { fontSizes, appColors, windowWidth, appFonts } from "@src/themes";
import { useAppNavigation } from "@src/utils/navigation";

export function CancelRender({ item }: { item: any; pickupLocation: any }) {
  const { navigate } = useAppNavigation();
  const {
    linearColorStyle,
    bgFullStyle,
    textColorStyle,
    viewRTLStyle,
    textRTLStyle,
  } = useValues();
  const dispatch = useDispatch<AppDispatch>();
  const [progress, setProgress] = useState(0);
  const { translateData } = useSelector(state => state.setting);
  const { zoneValue } = useSelector((state: any) => state.zone);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectedLoading, setRejectedLoading] = useState(false);
  const timersRef = useRef<{
    interval?: NodeJS.Timeout;
    timeout?: NodeJS.Timeout;
  }>({});

  const clearTimers = () => {
    if (timersRef.current.interval) {
      clearInterval(timersRef.current.interval);
      timersRef.current.interval = undefined;
    }
    if (timersRef.current.timeout) {
      clearTimeout(timersRef.current.timeout);
      timersRef.current.timeout = undefined;
    }
  };

  const handleAccept = () => {
    clearTimers();
    setAcceptLoading(true);
    const bid_id = item.id;
    const ride_request_id = item.ride_request_id;

    let payload = {
      status: "accepted",
    };
    dispatch(bidUpdate({ payload, bid_id }))
      .unwrap()
      .then((res: any) => {

        if (res?.exception || !res?.id) {
          notificationHelper("", res?.message, "error");
          setAcceptLoading(false);
          return;
        }

        if (res?.service_category_type === "schedule" || res?.service_category?.service_category_type === "schedule") {
          navigate("MyTabs");
          notificationHelper("", translateData.rideScheduled, "success");
          dispatch(allRides());
        } else {
          navigate("RideActive", { activeRideOTP: res });
        }
        setAcceptLoading(false);
      })
      .catch((error: any) => {
        console.error("Bid update error:", error);
        notificationHelper("", error?.message || "An unexpected error occurred", "error");
        setAcceptLoading(false);
      });
  };


  const handleReject = () => {
    clearTimers();
    setRejectedLoading(true);
    const bid_id = item.id;

    let payload = {
      status: "rejected",
    };
    dispatch(bidUpdate({ payload, bid_id }))
      .unwrap()
      .then((res: any) => {
        setRejectedLoading(false);
      })
      .catch((error: any) => {
        console.error("Bid update error:", error);
        setRejectedLoading(false);
      });
  };

  useEffect(() => {
    const totalDuration = 30;
    timersRef.current.interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 100 / totalDuration;
        return next > 100 ? 100 : next;
      });
    }, 1000);

    timersRef.current.timeout = setTimeout(() => {
      clearTimers();
      handleReject();
    }, totalDuration * 1000);

    return clearTimers;
  }, []);

  return (
    <View>
      <View style={[styles.container, { backgroundColor: bgFullStyle }]}>
        <ProgressBar value={progress} />
        <View style={[external.ph_10]}>
          <View>
            <View
              style={[
                external.ai_center,
                external.mt_15,
                external.js_space,
                {
                  flexDirection: viewRTLStyle,
                },
              ]}>
              <View style={[external.ai_center, { flexDirection: viewRTLStyle }]}>
                {item?.driver?.profile_image_url ? (
                  <Image
                    style={styles.img}
                    source={{ uri: item?.driver?.profile_image_url }}
                  />
                ) : (
                  <View
                    style={[
                      styles.img1,
                      {
                        backgroundColor: appColors.primary
                      },
                    ]}>
                    <Text
                      style={{
                        color: appColors.whiteColor,
                        fontFamily: appFonts.semiBold,
                        fontSize: fontSizes.FONT21
                      }}>
                      {item?.driver?.name?.charAt(0)?.toUpperCase() || ""}
                    </Text>
                  </View>
                )}

                <View style={{ marginHorizontal: windowWidth(5) }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={[
                        styles.titleText,
                        {
                          color: textColorStyle,
                          textAlign: textRTLStyle,
                          fontSize: fontSizes.FONT20,
                        },
                      ]}>
                      {item?.driver?.name}.
                    </Text>

                    <View style={{ marginHorizontal: windowWidth(3) }}>
                      <Verification />
                    </View>
                  </View>
                  <View
                    style={{ flexDirection: viewRTLStyle, alignItems: "center" }}>
                    <View style={styles.rating}>
                      <Star />
                    </View>
                    <Text
                      style={[
                        commonStyles.regularText,
                        { color: textColorStyle },
                      ]}>
                      {item?.driver?.rating_count}
                    </Text>
                    <Text
                      style={[styles.totalRating, { textAlign: textRTLStyle }]}>
                      ({item?.driver?.review_count})
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  commonStyles.mediumTextBlack12,
                  { color: appColors.primary, fontSize: fontSizes.FONT23 },
                ]}>
                {zoneValue.currency_symbol}
                {item?.amount}
              </Text>
            </View>
          </View>
          <View
            style={[
              external.mt_10,
              external.js_space,
              { flexDirection: viewRTLStyle },
            ]}>
            <Button
              title={translateData.skip}
              width={"48%"}
              height={35}
              backgroundColor={linearColorStyle}
              textColor={textColorStyle}
              onPress={handleReject}
              loading={rejectedLoading}
            />
            <Button
              title={translateData.accept}
              width={"48%"}
              height={35}
              backgroundColor={appColors.primary}
              onPress={handleAccept}
              loading={acceptLoading}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
