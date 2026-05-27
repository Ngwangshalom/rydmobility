import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from "@src/themes";
import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        paddingVertical: windowHeight(16),
        paddingHorizontal: windowWidth(15),
        borderRadius: windowWidth(20),
        width: '80%',
    },
    title: {
        fontSize: fontSizes.FONT20,
        fontFamily: appFonts.semiBold,
        marginVertical: windowHeight(12),
        alignSelf: 'center'
    },
    image: {
        height: windowHeight(45),
        width: windowWidth(85),
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    subText: {
        fontFamily: appFonts.regular,
        fontSize: fontSizes.FONT17,
        color: appColors.iconColor,
        textAlign: 'center',
        marginBottom: windowHeight(9)
    }
})

export default styles