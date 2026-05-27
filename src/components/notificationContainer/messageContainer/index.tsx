import { FlatList, Image, Text, View, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { external } from '../../../styles/externalStyle';
import { styles } from './styles';
import { MessageItem } from '../messageItem/index';
import { useDispatch, useSelector } from 'react-redux';
import { notificationDataGet } from '../../../api/store/actions/notificationAction';
import Images from '@src/utils/images';
import { useValues } from '@src/utils/context/index';
import { appColors, windowHeight } from '@src/themes';
import { again_Amazing } from '@src/constant';
import { Button, notificationHelper } from '@src/commonComponent';
import { AppDispatch, RootState } from '@src/api/store';

export function TopCategory() {
  const dispatch = useDispatch<AppDispatch>();
  const { notificationList }: any = useSelector((state: RootState) => state.notification);
  const { translateData }: any = useSelector((state: RootState) => state.setting);
  const { textColorStyle, isDark } = useValues();
  const [refreshing, setRefreshing] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const lastPressRef = useRef<number>(0);

  useEffect(() => {
    dispatch(notificationDataGet());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(notificationDataGet()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleRefreshPress = useCallback(() => {
    const now = Date.now();
    if (now - lastPressRef.current < 2000) {
      notificationHelper('', 'Too many attempts. Please wait.', 'error');
      return;
    }
    lastPressRef.current = now;
    setBtnLoading(true);
    dispatch(notificationDataGet()).finally(() => setBtnLoading(false));
  }, [dispatch]);

  const ItemSeparatorComponent = () => {
    return <View style={styles.viewWidth} />;
  };

  const renderItem = ({ item }: any) => <MessageItem item={item} />;

  return (
    <View style={[external.mt_20, { flex: 1 }]}>
      {notificationList?.data?.length > 0 ? (
        <FlatList
          ItemSeparatorComponent={ItemSeparatorComponent}
          data={notificationList?.data}
          renderItem={renderItem}
          contentContainerStyle={[external.mh_15, { paddingBottom: windowHeight(50) }]}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[appColors.primary]}
              tintColor={appColors.primary}
            />
          }
        />
      ) : (
        <View
          style={[
            styles.centerContainer,
            {
              backgroundColor: isDark
                ? appColors.bgDark
                : appColors.notificationColor,
            },
          ]}>
          <Image style={styles.image} source={Images.bellNotification} />
          <Text style={[styles.title, { color: textColorStyle }]}>
            {translateData?.nothinghhere}
          </Text>
          <Text style={[styles.text]}>
            {translateData?.clickToRefresh}
            {'\n'} {again_Amazing}
          </Text>
          <View style={styles.refreshButtonContainer}>
            <Button
              title={translateData?.refresh}
              onPress={handleRefreshPress}
              loading={btnLoading}
            />
          </View>
        </View>
      )}
    </View>
  );
}

