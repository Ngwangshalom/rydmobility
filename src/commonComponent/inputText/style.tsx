import { StyleSheet } from "react-native";
import { commonStyles } from "../../styles/commonStyle";
import { external } from "../../styles/externalStyle";
import { appColors, fontSizes, windowHeight, appFonts, windowWidth } from "@src/themes";

const style = StyleSheet.create({
  container: {
    ...commonStyles.mediumTextBlack12,
    color: appColors.regularText,
    marginTop: windowHeight(16),
  },
  title: {
    fontFamily: appFonts.medium,
    marginBottom: windowHeight(5),
  },
  textInputContainer: {
    backgroundColor: appColors.lightGray,
    height: windowHeight(40),
    ...external.fd_row,
    ...external.ai_center,
    marginVertical: windowHeight(10),
    borderRadius: windowHeight(5),
    marginTop: windowHeight(2),
    borderWidth: windowHeight(1),
  },
  textInputColor: {
    fontFamily: appFonts.regular,
    width: "80%",
    fontSize: fontSizes.FONT17,
    flexGrow: 0.8,
  },
  warningText: {
    color: appColors.textRed,
    marginTop: windowHeight(4.8),
    fontSize: fontSizes.FONT14SMALL,
  },
  subtitle: {
    color: appColors.iconColor,
    marginBottom: windowHeight(6),
    marginHorizontal: windowWidth(8),
    fontSize: fontSizes.FONT17
  }
});

export { style };
