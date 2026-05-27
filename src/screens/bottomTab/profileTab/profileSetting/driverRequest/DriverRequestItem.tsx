import { Image, Text, View, TouchableOpacity, Linking } from "react-native";
import React from "react";
import { styles } from "../../../myRide/rideContainer/style";
import { commonStyles } from "../../../../../styles/commonStyle";
import { useValues } from "@src/utils/context/index";
import { Call, PickLocation, RatingEmptyStart, RatingHalfStar, RatingStar, Message, AddressMarker, Target, Gps } from "@utils/icons";
import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from "@src/themes";
import { apiformatDates } from "@src/utils/functions";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Milage } from "@src/assets/icons/milage";

const DriverRequestItem = ({ item }: { item: any }) => {
  const { bgFullStyle, textColorStyle, viewRTLStyle, textRTLStyle, isDark, iconColorStyle } = useValues();
  const { translateData } = useSelector((state: any) => state.setting);
  const { zoneValue } = useSelector((state: any) => state.zone);
  const navigation: any = useNavigation();
  const formattedDate = apiformatDates(item.created_at);

  const gotoMessage = () => {
    navigation.navigate("ChatScreen", {
      driverId: item?.driver?.id,
      riderId: item?.rider?.id,
      rideId: item?.id,
      driverName: item?.driver?.name,
      driverImage: item?.driver?.profile_image_url,
    });
  };

  const gotoCall = () => {
    const phoneNumber = `${item?.driver?.phone}`;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handlePress = () => {
    navigation.navigate("DriverRequestDetailsScreen", {
      item: item,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.container, { backgroundColor: bgFullStyle, marginHorizontal: 0, marginTop: windowHeight(10) }]}
    >
      <View style={[styles.rideInfoContainer, { backgroundColor: bgFullStyle }]}>
        <View style={[styles.profileInfoContainer, { flexDirection: viewRTLStyle }]}>
          <View style={{ height: windowHeight(45), width: windowHeight(50), backgroundColor: isDark ? appColors.bgDark : appColors.lightGray, alignItems: 'center', justifyContent: 'center', borderRadius: windowHeight(5) }}>
            <Image
              style={styles.profileImage}
              source={{ uri: item?.vehicle_type?.vehicle_image_url || item?.service?.image_url }}
            />
          </View>
          <View style={[styles.profileTextContainer, { height: windowHeight(40), justifyContent: 'center' }]}>
            <Text style={[styles.profileName, { color: textColorStyle, textAlign: textRTLStyle }]}>
              {item?.driver?.name || "Assign Soon..."}
            </Text>
          </View>
          <View style={{ justifyContent: "space-between", alignItems: "flex-end", height: windowHeight(40) }}>

            <View style={styles.service_name_view}>
              <Text style={styles.service_name}>{item?.service?.name}</Text>
            </View>
            <Text style={[commonStyles.mediumTextBlack12, { color: isDark ? appColors.whiteColor : appColors.primaryText, fontSize: fontSizes.FONT22 }]}>
              {item.currency_symbol}{item?.total}
            </Text>
          </View>
        </View>

        <View style={[styles.dashedLine, { borderColor: isDark ? appColors.darkBorder : appColors.border }]} />

        <View style={{ flexDirection: viewRTLStyle, alignItems: 'flex-start' }}>
          <View style={{ alignItems: 'center', }}>
            <PickLocation color={"#00A88F"} />
            <View style={{
              height: windowHeight(10),
              width: 1,
              borderStyle: 'dotted',
              borderLeftWidth: 1,
              borderColor: isDark ? appColors.darkBorder : appColors.border,
            }} />
            <View style={{ alignItems: 'center' }}>
              <Gps />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: windowWidth(5) }}>
            <Text style={[styles.itemStyle1, { color: textColorStyle, textAlign: textRTLStyle, fontSize: fontSizes.FONT15, width: '100%' }]} numberOfLines={1}>
              {Array.isArray(item?.locations) ? item.locations[0] : (typeof item?.locations === 'string' ? item.locations.split(',')[0] : (item?.locations || "Pickup location"))}
            </Text>
            <Text style={[styles.itemStyle1, { color: textColorStyle, textAlign: textRTLStyle, fontSize: fontSizes.FONT15, marginTop: 22, width: '100%' }]} numberOfLines={1}>
              {Array.isArray(item?.locations) ?
                (item.locations.length > 1 ? item.locations[item.locations.length - 1] : "Destination") :
                (typeof item?.locations === 'string' && item.locations.split(',').length > 1 ? item.locations.split(',')[item.locations.split(',').length - 1] : "Destination")
              }
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: viewRTLStyle, justifyContent: 'space-between', alignItems: 'center', marginTop: windowHeight(4), marginBottom: windowHeight(10) }}>
          <View style={{ flexDirection: viewRTLStyle, alignItems: 'center' }}>
            <Text style={{ fontSize: fontSizes.FONT16, color: appColors.regularText }}>{formattedDate.date}</Text>
            <View style={{ borderLeftWidth: 1, borderColor: appColors.border, marginHorizontal: windowWidth(10), height: windowHeight(15) }} />
            <Text style={{ fontSize: fontSizes.FONT16, color: appColors.regularText }}>{formattedDate.time}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Milage color={appColors.primary} />
            <Text style={{ fontSize: fontSizes.FONT16, color: appColors.primary, fontFamily: appFonts.bold }}>
              {item?.distance} {item?.distance_unit}
            </Text>
          </View>
        </View>

      </View>
    </TouchableOpacity>
  );
};

export default DriverRequestItem;
