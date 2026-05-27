import { StyleSheet } from 'react-native';
import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from '@src/themes';

export const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    scrollView: {
        paddingBottom: windowHeight(30),
        backgroundColor: appColors.lightGray,
    },
    container: {
        marginHorizontal: windowWidth(20),
        marginTop: windowHeight(15),
        padding: windowWidth(15),
        borderRadius: windowHeight(10),
        borderWidth: 1,
    },
    driverInfoInner: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    vehicleImageContainer: {
        width: windowWidth(70),
        height: windowWidth(70),
        padding: windowHeight(3),
        borderRadius: windowWidth(10),
        backgroundColor: appColors.lightGray,
        overflow: 'hidden',
    },
    vehicleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    vehicleDetails: {
        marginLeft: windowWidth(15),
        justifyContent: 'center',
    },
    vehicleName: {
        fontSize: fontSizes.FONT28,
        fontFamily: appFonts.medium,
    },
    rideNumber: {
        fontFamily: appFonts.medium,
        fontSize: fontSizes.FONT15,
        textAlign: 'left',
        marginTop: windowHeight(4),
    },
    serviceName: {
        fontFamily: appFonts.medium,
        fontSize: fontSizes.FONT15,
        backgroundColor: appColors.dotLight,
        paddingHorizontal: windowWidth(15),
        paddingVertical: windowHeight(4),
        borderRadius: windowHeight(20),
        color: appColors.primary,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: windowHeight(4),
        justifyContent: 'flex-end',
    },
    distanceText: {
        fontSize: fontSizes.FONT16,
        color: appColors.primary,
        fontFamily: appFonts.bold,
    },
    locationsContainer: {
        padding: windowWidth(15),
        borderRadius: windowHeight(10),
        borderWidth: 1,
    },
    locationTextContainer: {
        flex: 1,
        marginLeft: windowWidth(10),
        marginTop: -windowHeight(5),
    },
    locationLabelContainer: {
        flexDirection: 'row',
        marginLeft: windowWidth(-5),
    },
    locationLabel: {
        color: appColors.regularText,
        fontSize: fontSizes.FONT15,
        marginHorizontal: windowWidth(5),
    },
    locationValue: {
        fontFamily: appFonts.regular,
        marginTop: windowHeight(2),
        fontSize: fontSizes.FONT18,
    },
    dateTimeSection: {
        justifyContent: 'space-between',
    },
    dateTimeBox: {
        padding: windowWidth(15),
        borderRadius: windowHeight(10),
        flex: 0.48,
        alignItems: 'center',
        borderWidth: 1,
    },
    dateTimeLabel: {
        color: appColors.regularText,
        fontSize: fontSizes.FONT14,
    },
    dateTimeValue: {
        fontFamily: appFonts.medium,
        fontSize: fontSizes.FONT18,
    },
    billDetailsContainer: {
        padding: windowWidth(15),
        borderRadius: windowHeight(10),
        borderWidth: 1,
    },
});
