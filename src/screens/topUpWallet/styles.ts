import {StyleSheet} from 'react-native';
import { windowHeight, windowWidth} from '@src/themes';

const styles = StyleSheet.create({
    listView: {
        paddingVertical: windowHeight(2),
        marginHorizontal: windowWidth(4),
      },
      // Add these to your existing styles
description: {
  fontSize: 12,
  marginTop: 4,
  opacity: 0.7,
},
defaultBadge: {
  fontSize: 10,
  marginTop: 4,
  fontWeight: 'bold',
  textTransform: 'uppercase',
},
noPaymentMethodContainer: {
  padding: windowHeight(20),
  alignItems: 'center',
  justifyContent: 'center',
},
noPaymentMethodText: {
  fontSize: 16,
  textAlign: 'center',
  marginBottom: windowHeight(8),
  fontFamily: appFonts.medium,
},
noPaymentMethodSubText: {
  fontSize: 14,
  textAlign: 'center',
  opacity: 0.7,
},
infoContainer: {
  marginTop: windowHeight(20),
  padding: windowHeight(15),
  borderRadius: windowHeight(8),
  backgroundColor: isDark ? appColors.darkCard : appColors.lightGray,
},
infoTitle: {
  fontSize: 16,
  fontFamily: appFonts.medium,
  marginBottom: windowHeight(8),
},
infoText: {
  fontSize: 14,
  lineHeight: windowHeight(20),
  marginBottom: windowHeight(8),
},
infoNote: {
  fontSize: 12,
  opacity: 0.7,
},
})

export default styles;
