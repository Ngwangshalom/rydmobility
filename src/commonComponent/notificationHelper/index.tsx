import { appColors, appFonts, fontSizes } from "@src/themes";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Notifier } from "react-native-notifier";

export function CustomNotification({ title, description, alertType }: any) {
  const backgroundColor =
    alertType === "error"
      ? "#FFF1F0"
      : alertType === "success"
        ? "#F6FFED"
        : alertType === "warn"
          ? "#FFF7E6"
          : "#E6F4FF";

  const borderColor =
    alertType === "error"
      ? "#FF4D4F"
      : alertType === "success"
        ? "#52C41A"
        : alertType === "warn"
          ? "#FAAD14"
          : "#1890FF";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, borderLeftColor: borderColor },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

export function notificationHelper(title: any, message: any, type = "info") {
  Notifier.showNotification({
    title,
    description: message,
    duration: 3000,
    showAnimationDuration: 400,
    hideAnimationDuration: 400,
    Component: CustomNotification,
    componentProps: {
      alertType: type,
      title,
      description: message,
    },
  });
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 7,
    alignSelf: "center",
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 50,
  },
  description: {
    fontSize: fontSizes.FONT18,
    color: appColors.primaryText,
    fontFamily: appFonts.medium,
  },
});
