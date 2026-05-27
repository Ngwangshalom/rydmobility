import React from 'react';
import { ScrollView, View, Text, Image } from 'react-native';
import { Header } from '@src/commonComponent';
import { useValues } from '@src/utils/context/index';
import { useRoute } from '@react-navigation/native';
import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from '@src/themes';
import { external } from '@src/styles/externalStyle';
import { PickLocation, Gps, Calender, Clock } from '@src/utils/icons';
import { apiformatDates } from '@src/utils/functions';
import { BillDetails } from '../../../../myRide/completeRideScreen/detailContainer/billDetails';
import { styles as myRideStyles } from '../../../../myRide/rideContainer/style';
import { Milage } from '@src/assets/icons/milage';
import { styles } from './styles';

export function DriverRequestDetailsScreen() {
    const { bgFullStyle, textColorStyle, viewRTLStyle, isDark, iconColorStyle } = useValues();
    const route = useRoute<any>();
    const { item } = route.params;
    const formattedDate = apiformatDates(item.created_at);

    const dynamicContainerStyle = {
        backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor,
        borderColor: isDark ? appColors.darkBorder : appColors.border
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: bgFullStyle }]}>
            <Header value={"Request Details"} backgroundColor={isDark ? appColors.darkPrimary : appColors.whiteColor} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollView, { backgroundColor: bgFullStyle }]}>

                {/* Driver Info Section */}
                <View style={[myRideStyles.container, styles.container, dynamicContainerStyle]}>
                    <View style={[styles.driverInfoInner, { flexDirection: viewRTLStyle }]}>
                        <View style={{ flexDirection: viewRTLStyle }}>
                            <View style={[styles.vehicleImageContainer, { backgroundColor: isDark ? appColors.bgDark : appColors.lightGray }]}>
                                <Image
                                    source={{ uri: item?.vehicle_type?.vehicle_image_url }}
                                    style={styles.vehicleImage}
                                />
                            </View>
                            <View style={styles.vehicleDetails}>
                                <Text style={[styles.vehicleName, { color: textColorStyle }]}>
                                    {item?.vehicle_type?.name}
                                </Text>
                                <Text style={[styles.rideNumber, { color: textColorStyle }]}>#{item.ride_number}</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={[styles.serviceName, isDark && { backgroundColor: appColors.darkBorder }]}>
                                {item?.service?.name}
                            </Text>
                            <View style={[styles.distanceContainer, { flexDirection: 'row' }]}>
                                <Milage color={appColors.primary} />
                                <Text style={styles.distanceText}>
                                    {item?.distance} {item?.distance_unit}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>


                {/* Locations Section */}
                <View style={[external.mh_20, external.mt_10, styles.locationsContainer, dynamicContainerStyle]}>
                    <View style={{ flexDirection: viewRTLStyle }}>
                        <View style={styles.locationTextContainer}>
                            <View>
                                <View style={styles.locationLabelContainer}>
                                    <PickLocation color={"#00A88F"} />
                                    <Text style={[styles.locationLabel, { color: isDark ? appColors.darkText : appColors.regularText }]}>Pickup Location</Text>
                                </View>
                                <Text style={[styles.locationValue, { color: textColorStyle }]} numberOfLines={2}>
                                    {Array.isArray(item?.locations) ? item.locations[0] : (typeof item?.locations === 'string' ? item.locations.split(',')[0] : (item?.locations || "Pickup location"))}
                                </Text>
                            </View>
                            <View style={{ marginTop: windowHeight(15) }}>
                                <View style={styles.locationLabelContainer}>
                                    <Gps colors={iconColorStyle} />
                                    <Text style={[styles.locationLabel, { color: isDark ? appColors.darkText : appColors.regularText }]}>Destination Location</Text>
                                </View>
                                <Text style={[styles.locationValue, { color: textColorStyle }]} numberOfLines={2}>
                                    {Array.isArray(item?.locations) ?
                                        (item.locations.length > 1 ? item.locations[item.locations.length - 1] : "Destination") :
                                        (typeof item?.locations === 'string' && item.locations.split(',').length > 1 ? item.locations.split(',')[item.locations.split(',').length - 1] : "Destination")
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Date/Time Section */}
                <View style={[external.mh_20, external.mt_20, styles.dateTimeSection, { flexDirection: viewRTLStyle }]}>
                    <View style={[styles.dateTimeBox, dynamicContainerStyle, { flexDirection: viewRTLStyle }]}>
                        <Calender color={appColors.primary} />
                        <View style={{ marginLeft: windowWidth(10) }}>
                            <Text style={[styles.dateTimeLabel, { color: isDark ? appColors.darkText : appColors.regularText }]}>Date</Text>
                            <Text style={[styles.dateTimeValue, { color: textColorStyle }]}>{formattedDate.date}</Text>
                        </View>
                    </View>
                    <View style={[styles.dateTimeBox, dynamicContainerStyle, { flexDirection: viewRTLStyle }]}>
                        <Clock color={appColors.primary} />
                        <View style={{ marginLeft: windowWidth(10) }}>
                            <Text style={[styles.dateTimeLabel, { color: isDark ? appColors.darkText : appColors.regularText }]}>Time</Text>
                            <Text style={[styles.dateTimeValue, { color: textColorStyle }]}>{formattedDate.time}</Text>
                        </View>
                    </View>
                </View>

                {/* Bill Details Section */}
                <View style={[external.mh_20, external.mt_20, styles.billDetailsContainer, dynamicContainerStyle]}>
                    <BillDetails billDetail={item} />
                </View>
            </ScrollView >
        </View >
    );
}
