import { StyleSheet } from 'react-native';
import { commonStyles } from '../../../../styles/commonStyle';
import { fontSizes, windowHeight, windowWidth } from '@src/themes';
import { appColors } from '@src/themes'; 

const styles = StyleSheet.create({
  texify: {
    ...commonStyles.mediumText23,
    fontWeight: '700',
    fontSize: fontSizes.FONT25,
    color: appColors.whiteColor,
  },
 logo: {
    width: windowWidth(150),
    height: windowHeight(50),
    resizeMode: 'contain',
    tintColor: appColors.whiteColor,
    aspectRatio: 1.7, // Adjust this ratio based on your actual logo dimensions
  }
});
export { styles };
