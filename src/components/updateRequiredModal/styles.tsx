import { StyleSheet } from 'react-native';
import { appColors } from '../../themes/appColors';
import { appFonts } from '../../themes/appFonts';
import { fontSizes, windowHeight, windowWidth } from '../../themes/appConstant';

export const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: windowWidth(400),
        backgroundColor: appColors.whiteColor,
        borderRadius: windowWidth(20),
        padding: windowWidth(25),
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    imageContainer: {
        width: windowWidth(70),
        height: windowWidth(70),
        marginBottom: windowHeight(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: appColors.lightGreen,
        borderRadius: windowWidth(35),
    },
    image: {
        width: windowHeight(35),
        height: windowHeight(35),
        resizeMode: 'contain',
    },
    title: {
        fontFamily: appFonts.bold,
        fontSize: fontSizes.FONT22,
        color: appColors.primaryText,
        marginBottom: windowHeight(10),
        textAlign: 'center',
    },
    description: {
        fontFamily: appFonts.regular,
        fontSize: fontSizes.FONT18,
        color: appColors.subtitle,
        textAlign: 'center',
        marginBottom: windowHeight(25),
    },
    button: {
        backgroundColor: appColors.primary,
        width: '100%',
        paddingVertical: windowHeight(12),
        borderRadius: windowWidth(10),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: appColors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    buttonText: {
        fontFamily: appFonts.semiBold,
        fontSize: fontSizes.FONT16,
        color: appColors.whiteColor,
    },
});
