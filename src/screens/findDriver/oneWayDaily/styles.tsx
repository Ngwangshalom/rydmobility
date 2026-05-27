import { StyleSheet } from "react-native";
import {
  windowHeight,
  appColors,
  appFonts,
  fontSizes,
  windowWidth,
} from "@src/themes";
import { external } from "@src/styles/externalStyle";
import { commonStyles } from "@src/styles/commonStyle";

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  view: {
    backgroundColor: appColors.lightGray,
    paddingHorizontal: windowWidth(14),
    paddingBottom: windowHeight(20),
  },
  scrollView: {
    padding: windowHeight(10),
    borderRadius: windowHeight(8),
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    marginTop: windowHeight(20),
    width: "100%",
    alignSelf: "center",
    backgroundColor: appColors.whiteColor,
  },
  stepContainer: {
    alignItems: "center",
  },
  iconView: { marginBottom: windowHeight(28) },
  iconColumn: {
    alignItems: "center",
    position: "relative",
  },
  line: {
    position: "absolute",
    width: windowHeight(0.1),
    height: windowHeight(37),
    borderStyle: "dashed",
    borderLeftWidth: windowHeight(0.7),
    borderLeftColor: appColors.gray,
    top: windowHeight(16),
  },
  labelColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: windowHeight(4),
    marginHorizontal: windowHeight(0),
  },
  label: {
    color: appColors.blackColor,
    paddingVertical: windowHeight(3),
    fontFamily: appFonts.medium,
    width: "85%",
    flex: 1,
    marginHorizontal: windowHeight(4),
  },
  selectorRow: {
    flexDirection: "row",
    paddingHorizontal: windowWidth(1),
    marginTop: windowHeight(9),
  },
  dropdownWrapper: {
    flexDirection: "row",
    marginHorizontal: windowWidth(9),
  },
  iconTextRow: {
    alignItems: "center",
  },
  dropdown: {
    width: "82%",
  },
  dropdownContainer: {
    height: windowHeight(38),
    width: windowWidth(250),
  },
  dropdownContainer1: {
    height: windowHeight(38),
    width: windowWidth(250),
    right: windowWidth(40),
  },
  selectedContainer: {
    borderWidth: windowHeight(1.2),
    borderColor: appColors.primary,
  },
  rideInfoContainer: {
    width: "95%",
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(5.9),
    paddingHorizontal: windowHeight(12),
    paddingTop: windowHeight(12),
    paddingVertical: windowHeight(9),
    alignSelf: "center",
    borderWidth: windowHeight(1),
  },
  profileImage: {
    width: windowWidth(50),
    height: windowHeight(35),
    resizeMode: "contain",
  },
  profileTextContainer: {
    ...external.mh_20,
    ...external.fg_1,
  },
  profileName: {
    ...commonStyles.mediumTextBlack12,
    fontSize: fontSizes.FONT19,
  },
  carInfoText: {
    ...commonStyles.regularText,
  },
  profileInfoContainer: {
    justifyContent: "space-between",
  },
  starContainer: {
    alignItems: "flex-start",
    justifyContent: "center",
    top: windowHeight(10),
  },
  MessageMainView: {
    width: windowWidth(100),
    justifyContent: "space-between",
  },
  MessageView: {
    alignItems: "center",
    justifyContent: "center",
    height: windowHeight(30),
    width: windowHeight(30),
    borderRadius: windowHeight(20),
    borderWidth: windowHeight(1),
  },
  safetyCallView: {
    alignItems: "center",
    justifyContent: "center",
    height: windowHeight(30),
    width: windowHeight(30),
    borderRadius: windowHeight(20),
    borderWidth: windowHeight(1),
  },
  serviceMainView: { justifyContent: "space-between" },
  serviceView: { marginTop: windowHeight(12) },
  carInfoContainer: {
    alignItems: "center",
    marginTop: windowHeight(3),
  },
  // New Styles
  dateTimeContainer: {
    flexDirection: "row",
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(8),
    borderWidth: 1,
    borderColor: appColors.border,
    marginTop: windowHeight(15),
    width: "100%",
    alignSelf: "center",
    paddingVertical: windowHeight(12),
  },
  dateContainer: {
    flex: 1,
    paddingHorizontal: windowWidth(15),
  },
  separator: {
    width: 1,
    backgroundColor: appColors.border,
    height: "80%",
    alignSelf: "center",
    borderStyle: "dashed",
    borderWidth: 0.5,
    borderColor: appColors.border,
  },
  timeContainer: {
    flex: 1,
    paddingHorizontal: windowWidth(15),
  },
  dateTimeLabel: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT17,
    color: appColors.primaryText,
    marginBottom: windowHeight(5),
  },
  dateTimeValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeValue: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT16,
    color: appColors.gray,
    marginLeft: windowWidth(8),
  },
  sectionTitle: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT17,
    color: appColors.primaryText,
    marginTop: windowHeight(20),
    marginBottom: windowHeight(10),
  },
  carTypeCard: {
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(8),
    padding: windowHeight(12),
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: appColors.border,
    width: "100%",
    alignSelf: "center",
  },
  carTypeName: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT17,
    color: appColors.primaryText,
    marginLeft: windowWidth(12),
  },
  driverCard: {
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(8),
    padding: windowHeight(15),
    marginBottom: windowHeight(15),
    borderWidth: 1,
    borderColor: appColors.border,
    width: "100%",
    alignSelf: "center",
    paddingVertical: windowHeight(8),
  },
  selectedDriverCard: {
    borderColor: appColors.primary,
    borderWidth: windowWidth(1.8),
  },
  driverInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverImage: {
    width: windowWidth(50),
    height: windowWidth(50),
    borderRadius: windowWidth(25),
  },
  driverDetails: {
    marginLeft: windowWidth(12),
    flex: 1,
  },
  driverName: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT18,
    color: appColors.primaryText,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: windowHeight(4),
  },
  ratingText: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT14,
    color: appColors.gray,
    marginLeft: windowWidth(5),
  },
  dashedLine: {
    height: 1,
    borderTopWidth: 0.5,
    borderColor: appColors.border,
    borderStyle: "dashed",
    marginTop: windowHeight(15),
    marginBottom: windowHeight(15),
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT17,
    color: appColors.primaryText,
  },
  priceValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceValue: {
    fontFamily: appFonts.bold,
    fontSize: fontSizes.FONT20,
    color: appColors.price,
  },
  perDay: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT14,
    color: appColors.gray,
  },
});
export default styles;
