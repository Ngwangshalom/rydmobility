import { StyleSheet } from 'react-native';
import {
  windowHeight,
  appFonts,
  appColors,
  fontSizes,
  windowWidth,
} from '@src/themes';

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: appColors.whiteColor,
  },
  driverNameMain1: {
    fontFamily: appFonts.bold,
    fontSize: fontSizes.FONT30,
    color: appColors.whiteColor
  },
  view: {
    paddingHorizontal: windowWidth(14),
    paddingBottom: windowHeight(20),
    backgroundColor: '#F8F9FA',
    flex: 1,
  },
  driverProfileCard: {
    marginTop: windowHeight(50),
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(15),
    padding: windowHeight(20),
    alignItems: 'center',
    width: '100%',
    paddingVertical: windowHeight(10)
  },
  largeDriverImage: {
    width: windowWidth(100),
    height: windowWidth(100),
    borderRadius: windowWidth(50),
    position: 'absolute',
    top: -windowWidth(50),
    borderWidth: 4,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  driverNameMain: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT22,
    marginTop: windowHeight(35),
    color: appColors.primaryText,
  },
  mainRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: windowHeight(8),
    marginBottom: windowHeight(15),
  },
  ratingTextMain: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT14,
    color: appColors.gray,
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: windowHeight(6),
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT16,
    color: appColors.primaryText,
    width: '35%',
  },
  infoValue: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT16,
    color: appColors.gray,
    flex: 1,
  },
  locationCard: {
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(12),
    padding: windowHeight(18),
    marginTop: windowHeight(20),
    width: '100%',
    borderWidth: windowWidth(1)
  },
  locStepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locIconColumn: {
    alignItems: 'center',
    marginRight: 15,
    marginTop: 5,
  },
  locLine: {
    width: 1,
    height: windowHeight(35),
    borderStyle: 'dashed',
    borderLeftWidth: 0.8,
    borderColor: appColors.border,
    marginTop: 5,
    marginBottom: 5,
  },
  locLabelColumn: {
    flex: 1,
    paddingVertical: 2,
  },
  locTitle: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT17,
    color: appColors.primaryText,
    marginBottom: 4,
  },
  locAddress: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT15,
    color: appColors.gray,
    lineHeight: 20,
  },
  hDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: windowHeight(15),
    width: '100%',
  },
  dateTimeSplitCard: {
    flexDirection: 'row',
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(12),
    marginTop: windowHeight(15),
    width: '100%',
    paddingVertical: windowHeight(10),
    borderWidth: windowWidth(1)
  },
  dateTimePart: {
    flex: 1,
    paddingHorizontal: windowWidth(15),
  },
  vDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    height: '100%',
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: appColors.border,
  },
  labelSmall: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT15,
    color: appColors.primaryText,
    marginBottom: windowHeight(8),
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueTextSmall: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT16,
    color: appColors.gray,
    marginLeft: windowWidth(8),
  },
  sectionTitle: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT18,
    color: appColors.blackColor,
    marginTop: windowHeight(15),
    marginBottom: windowHeight(5),
  },
  selectedCarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(8),
    padding: windowHeight(18),
    width: '100%',
    borderWidth: windowWidth(1),
    paddingVertical: windowHeight(13),
    marginTop: windowHeight(12)
  },
  carText: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT18,
    color: appColors.primaryText,
    marginLeft: windowWidth(15),
  },
  reviewCard: {
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(12),
    padding: windowHeight(18),
    marginBottom: windowHeight(15),
    width: '100%',
    borderWidth: windowWidth(1)
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: windowHeight(10),
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerImage: {
    width: windowWidth(40),
    height: windowWidth(40),
    borderRadius: windowWidth(20),
  },
  reviewerName: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT17,
    color: appColors.primaryText,
    marginLeft: windowWidth(12),
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  reviewRatingText: {
    fontFamily: appFonts.bold,
    fontSize: fontSizes.FONT13,
    color: '#F4D03F',
    marginLeft: 5,
  },
  reviewComment: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT15,
    color: appColors.gray,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  proceedToPayBtn: {
    paddingVertical: windowHeight(20),
    paddingHorizontal: windowWidth(14),
    backgroundColor: appColors.whiteColor,
  },
});

export default styles;
