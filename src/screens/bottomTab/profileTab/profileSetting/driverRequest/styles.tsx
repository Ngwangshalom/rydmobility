import { StyleSheet } from 'react-native';
import { appColors, windowHeight, windowWidth, fontSizes, appFonts } from '@src/themes';
import { external } from '../../../../../styles/externalStyle';

const styles = StyleSheet.create({
  safeAreaContainer: {
    ...external.fx_1,
    backgroundColor: appColors.whiteColor,
  },
  loadingView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingColor: {
    color: appColors.primary,
  },
  listContent: {
    paddingBottom: windowHeight(20),
    paddingHorizontal: windowWidth(15),
    paddingTop: windowHeight(10),
  },
  noDataView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    fontSize: fontSizes.FONT20,
    fontFamily: appFonts.medium,
  },
});

export { styles };
