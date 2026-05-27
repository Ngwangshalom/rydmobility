import { View, Text, Image } from "react-native";
import React from "react";
import { styles } from "./styles";
import { useValues } from "@src/utils/context/index";
import { appColors } from "@src/themes";
import Images from "@src/utils/images";
import { useSelector } from "react-redux";

export function NoInternalServer() {
  const { isDark } = useValues();
  const { translateData } = useSelector((state: any) => state.setting);

  return (
    <View style={styles.mainContainer}>
      <Image
        source={Images.internalSerivce}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={[styles.mainView]}>
        <Text
          style={[
            styles.title,
            { color: isDark ? appColors.whiteColor : appColors.primaryText },
          ]}
        >
          {translateData?.serverError}
        </Text>
        <Text style={[styles.details]}>{translateData?.serverErrorDetail}</Text>
      </View>
    </View>
  );
}
