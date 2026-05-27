import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
import React, { useEffect } from "react";
import { Header, HeaderTab } from "@src/commonComponent";
import { commonStyles } from "../../../../../styles/commonStyle";
import { styles } from "./styles";
import { useDispatch, useSelector } from "react-redux";
import { findDriverRequestsAction } from "@src/api/store/actions";
import { useValues } from "@src/utils/context/index";
import DriverRequestItem from "./DriverRequestItem";

export function DriverRequestScreen() {
  const { bgFullStyle, linearColorStyle, textColorStyle } = useValues();
  const dispatch = useDispatch();
  const { translateData } = useSelector((state: any) => state.setting);
  const { findDriverRequestsData, loading } = useSelector(
    (state: any) => state.rideRequest,
  );

  useEffect(() => {
    (dispatch as any)(findDriverRequestsAction("finddriver"));
  }, [dispatch]);

  return (
    <SafeAreaView
      style={[styles.safeAreaContainer, { backgroundColor: bgFullStyle }]}
    >
      <Header value={"Driver Request"} />
      <View
        style={[
          commonStyles.flexContainer,
          { backgroundColor: linearColorStyle },
        ]}
      >
        {loading ? (
          <View style={styles.loadingView}>
            <ActivityIndicator size="large" color={styles.loadingColor.color} />
          </View>
        ) : findDriverRequestsData?.data?.length > 0 ? (
          <FlatList
            data={findDriverRequestsData?.data}
            renderItem={({ item }) => <DriverRequestItem item={item} />}
            keyExtractor={(item: any) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.noDataView}>
            <Text style={[styles.noDataText, { color: textColorStyle }]}>
              No requests found
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
