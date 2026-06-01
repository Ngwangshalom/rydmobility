// components/IncomingCallAlert/style.ts
import { StyleSheet } from "react-native";
import {
  windowHeight,
  windowWidth,
  appColors,
  appFonts,
  fontSizes,
} from "@src/themes";

const styles = StyleSheet.create({
  modelView: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: windowHeight(20),
  },
  avatarContainer: {
    marginBottom: windowHeight(20),
  },
  avatar: {
    width: windowHeight(100),
    height: windowHeight(100),
    borderRadius: windowHeight(50),
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    width: windowHeight(100),
    height: windowHeight(100),
    borderRadius: windowHeight(50),
  },
  avatarText: {
    fontSize: fontSizes.FONT32,
    fontFamily: appFonts.semiBold,
    color: appColors.whiteColor,
  },
  callerName: {
    fontSize: fontSizes.FONT22,
    fontFamily: appFonts.semiBold,
    marginBottom: windowHeight(8),
    textAlign: "center",
  },
  callerSubtitle: {
    fontSize: fontSizes.FONT16,
    fontFamily: appFonts.regular,
    textAlign: "center",
    marginBottom: windowHeight(30),
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: windowWidth(15),
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: windowHeight(16),
    borderRadius: windowHeight(12),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: appColors.shadowColor,
    shadowOffset: {
      width: 0,
      height: windowHeight(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: windowHeight(3.84),
    elevation: 5,
  },
  declineButton: {},
  acceptButton: {},
  buttonText: {
    fontSize: fontSizes.FONT16,
    fontFamily: appFonts.semiBold,
    color: appColors.whiteColor,
  },
});

export default styles;