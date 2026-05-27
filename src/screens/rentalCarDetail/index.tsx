import { View, Text, Image, ScrollView, TouchableOpacity, BackHandler } from "react-native";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Ac, Back, Bag, Right, Star1 } from "@src/utils/icons";
import { CarType } from "@src/assets/icons/carType";
import { FuelType } from "@src/assets/icons/fuelType";
import { Milage } from "@src/assets/icons/milage";
import { GearType } from "@src/assets/icons/gearType";
import { Seat } from "@src/assets/icons/seat";
import { Speed } from "@src/assets/icons/speed";
import { styles } from "./styles";
import { external } from "@src/styles/externalStyle";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RentalBookinginterface } from "@src/api/interface/rentalinterface";
import { rentalRideRequests, updateRideRequest, rentalVehicleListDetsils } from "@src/api/store/actions";
import { useDispatch, useSelector } from "react-redux";
import { Button, notificationHelper } from "@src/commonComponent";
import { useValues } from "@src/utils/context/index";;
import { appColors, appFonts, windowHeight } from "@src/themes";
import { clearValue } from "@src/utils/localstorage";
import getEchoInstance from "@src/utils/echo";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { SkeletonRentalCarDetails } from "./components/SkeletonRentalCarDetails";

type RentalCarDetailsRouteProp = RouteProp<{
  RentalCarDetails: {
    startDate: string;
    pickUpCoords: { lat: number; lng: number };
    pickupLocation: string;
    dropLocation: string;
    dropCoords: { lat: number; lng: number };
    endDate: string;
    convertedStartTime: string;
    convertedEndTime: string;
    getDriver: boolean;
    vehicle_type_id: string;
    no_of_days: number;
    is_with_driver: number;
  };
}, 'RentalCarDetails'>;

interface RootState {
  setting: {
    translateData: any;
  };
  zone: {
    zoneValue: any;
  };
  rentalVehicle: {
    rentalVehicleListsDetails: any;
  };
}

const CarDetailItem = React.memo(({ detail, isDark }: { detail: any; isDark: boolean }) => (
  <View style={[styles.detailIcon, { flexDirection: isDark ? 'row-reverse' : 'row' }, { backgroundColor: isDark ? appColors.bgDark : appColors.lightGray }]}>
    <detail.Icon color={isDark ? appColors.darkText : appColors.regularText} />
    <Text style={[styles.detailTitle, { color: isDark ? appColors.darkText : appColors.primaryText }]}>{detail.title}</Text>
  </View>
));

const SubImageItem = React.memo(({ img, index, mainImage, setMainImage }: { img: string; index: number; mainImage: string; setMainImage: (img: string) => void }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    key={index}
    style={[
      styles.subImgView,
      mainImage === img && styles.selectedSubImg,
    ]}
    onPress={() => setMainImage(img)}
  >
    <Image source={{ uri: img }} style={styles.subImg} />
  </TouchableOpacity>
));

export function RentalCarDetails() {
  const route = useRoute<RentalCarDetailsRouteProp>();
  const { startDate, pickUpCoords, pickupLocation, dropLocation, dropCoords, endDate, convertedStartTime, convertedEndTime, getDriver, vehicle_type_id, no_of_days, is_with_driver } = route.params;
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { rentalVehicleListsDetails } = useSelector((state: RootState) => state.rentalVehicle);
  const { zoneValue } = useSelector((state: RootState) => state.zone);
  const { translateData } = useSelector((state: RootState) => state.setting);
  const { viewRTLStyle, isDark } = useValues();
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [bookLoading, setBookloading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [rideCancelLoading, setRideCancelLoading] = useState(false);
  const [ride_req_id, setRideReqId] = useState<any>(null);
  const totalSeconds = 60;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);
  const [mainImage, setMainImage] = useState('');
  const imageIndexRef = useRef(0);
  const imageChangeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dispatch(rentalVehicleListDetsils({ vehicle_type_id: Number(vehicle_type_id), no_of_days, is_with_driver }) as any)
      .unwrap()
      .then((res: any) => {
        setLoading(false);
        if (res.status == 403) {
          notificationHelper(
            '',
            translateData.loginAgain,
            'error',
          );
          clearValue();
          navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }],
          });
        }
      })
      .catch((error: any) => {
        console.error('Error in rentalVehicleListDetsils:', error);
        setLoading(false);
      });
  }, [dispatch, vehicle_type_id, no_of_days, is_with_driver, translateData.loginAgain, navigation]);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setIsBottomSheetVisible(false);
    }
  }, []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.expand();
    setIsBottomSheetVisible(true);
  }, []);

  const handleCloseModalPress = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsBottomSheetVisible(false);
  }, []);

  const modelClose = useCallback(async () => {
    setRideCancelLoading(true);
    handleCloseModalPress();
    setBookloading(false);

    dispatch(updateRideRequest({ payload: '', ride_id: ride_req_id }))
      .then((res: any) => {
        setRideCancelLoading(false);
        if (res?.payload?.id) {
          notificationHelper("", translateData.rideReqCancel, "error")
        }
      })
  }, [dispatch, handleCloseModalPress, ride_req_id, translateData.rideReqCancel]);

  useEffect(() => {
    if (!ride_req_id) return;

    const rideReqId = String(ride_req_id);
    let echoInstance: any = null;

    const setupEcho = async () => {
      echoInstance = await getEchoInstance();
      const requestChannel = `ride-request.${rideReqId}`;

      echoInstance
        .private(requestChannel)
        .listen(".ride.status_update", (e: any) => {
          const data = e.data || e;
          if (data?.status === "canceled") {
            modelClose();
            notificationHelper("", translateData.driverRejectReq, "error");
          } else if (data?.status === "accepted") {
            handleCloseModalPress();
            notificationHelper("", translateData.driverAcceptReq, "success");
            navigation.navigate("PaymentMethod", { rideData: data });
          }
        })
        .listen(".bid.accepted", (e: any) => {
          const data = e.data || e;
          handleCloseModalPress();
          notificationHelper("", translateData.driverAcceptReq, "success");
          navigation.navigate("PaymentMethod", { rideData: data });
        })
        .listen(".ride.accepted", (e: any) => {
          const data = e.data || e;
          handleCloseModalPress();
          notificationHelper("", translateData.driverAcceptReq, "success");
          navigation.navigate("PaymentMethod", { rideData: data });
        })
        .listen(".ride.no_driver_found", (e: any) => {
          modelClose();
          notificationHelper("", translateData.driverRejectReq, "error");
        });
    };

    setupEcho();

    return () => {
      if (echoInstance) {
        echoInstance.leave(`ride-request.${rideReqId}`);
      }
    };
  }, [ride_req_id, handleCloseModalPress, navigation, translateData.driverAcceptReq, translateData.driverRejectReq, modelClose]);

  const capitalizeFirst = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const carDetails = useMemo(
    () => [
      { Icon: CarType, title: capitalizeFirst(rentalVehicleListsDetails.vehicle_subtype) },
      { Icon: FuelType, title: capitalizeFirst(rentalVehicleListsDetails.fuel_type) },
      { Icon: Milage, title: `${rentalVehicleListsDetails.mileage}` },
      { Icon: GearType, title: capitalizeFirst(rentalVehicleListsDetails.gear_type) },
      { Icon: Seat, title: `${rentalVehicleListsDetails?.seatingCapacity || 1} Seat` },
      { Icon: Speed, title: `${rentalVehicleListsDetails.vehicle_speed}` },
      { Icon: Ac, title: rentalVehicleListsDetails.is_ac == 1 ? "AC" : "Non AC" },
      { Icon: Bag, title: `${rentalVehicleListsDetails.bag_count}` },
    ],
    [rentalVehicleListsDetails]
  );


  useEffect(() => {
    if (rentalVehicleListsDetails?.rental_vehicle_galleries?.length > 0) {
      setMainImage(rentalVehicleListsDetails.rental_vehicle_galleries[0]);
    } else if (rentalVehicleListsDetails?.normal_image_url) {
      setMainImage(rentalVehicleListsDetails.normal_image_url);
    }
  }, [rentalVehicleListsDetails]);

  useEffect(() => {
    if (imageChangeIntervalRef.current) {
      clearInterval(imageChangeIntervalRef.current);
    }

    const images = rentalVehicleListsDetails?.rental_vehicle_galleries || [];
    if (images?.length > 1) {
      imageIndexRef.current = 0;

      imageChangeIntervalRef.current = setInterval(() => {
        imageIndexRef.current = (imageIndexRef.current + 1) % images?.length;
        setMainImage(images[imageIndexRef.current]);
      }, 3000);
    }

    return () => {
      if (imageChangeIntervalRef.current) {
        clearInterval(imageChangeIntervalRef.current);
      }
    };
  }, [rentalVehicleListsDetails?.rental_vehicle_galleries]);

  // Memoized function to prevent recreation on every render
  const formatDateTime = useCallback((dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return "";
    const [day, monthName, year] = dateStr.split(" ");
    const [hours, minutes] = timeStr.split(":").map(Number);

    const months: Record<string, number> = {
      January: 1, February: 2, March: 3, April: 4,
      May: 5, June: 6, July: 7, August: 8,
      September: 9, October: 10, November: 11, December: 12
    };

    const month = months[monthName];

    const yyyy = year;
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const hh = String(hours).padStart(2, "0");
    const mi = String(minutes).padStart(2, "0");
    const ss = "00";

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }, []);

  const start_time = useMemo(() => formatDateTime(startDate, convertedStartTime), [startDate, convertedStartTime, formatDateTime]);
  const end_time = useMemo(() => formatDateTime(endDate, convertedEndTime), [endDate, convertedEndTime, formatDateTime]);


  // Memoized function to prevent recreation on every render
  const bookRental = useCallback(async () => {
    setBookloading(true);
    const is_with_driver = getDriver ? "1" : "0";
    let dropLocations =
      dropLocation && dropLocation.trim() ? dropLocation : pickupLocation;

    let payload: RentalBookinginterface = {
      locations: [`${pickupLocation}`, `${dropLocations}`],
      location_coordinates: [
        {
          lat: `${pickUpCoords.lat}`,
          lng: `${pickUpCoords.lng}`,
        },
        {
          lat: `${dropCoords?.lat ?? pickUpCoords.lat}`,
          lng: `${dropCoords?.lng ?? pickUpCoords.lng}`,
        },
      ],
      service_id: '1',
      service_category_id: "5",
      vehicle_type_id: `${rentalVehicleListsDetails.vehicle_type_id}`,
      rental_vehicle_id: `${rentalVehicleListsDetails.id}`,
      is_with_driver: `${is_with_driver}`,
      payment_method: "cash",
      start_time: start_time,
      end_time: end_time,
      currency_code: zoneValue?.currency_code,
    };
    // @ts-ignore
    dispatch(rentalRideRequests(payload))
      .unwrap()
      .then(async (res: any) => {
        setBookloading(false);
        if (res.status == 403) {
          notificationHelper('', translateData.loginAgain, 'error');
          clearValue().then(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            });
          });
          return;
        }
        if (res?.id) {
          setRideReqId(res?.id);
          handlePresentModalPress();
          notificationHelper("", translateData.rentalReqSend, "success");
        } else {
          notificationHelper("", res.message, "error");
        }
      })
      .catch((error: any) => {
        console.error("Error in booking rental:", error);
        notificationHelper("", translateData.unexpectedError, "error");
        setBookloading(false);
      });
  }, [
    getDriver,
    dropLocation,
    pickupLocation,
    pickUpCoords,
    dropCoords,
    rentalVehicleListsDetails,
    start_time,
    end_time,
    zoneValue?.currency_code,
    dispatch,
    translateData,
    handlePresentModalPress,
    handleCloseModalPress,
    navigation,
  ]);

  useEffect(() => {
    if (!isBottomSheetVisible) return;
    setSecondsLeft(60);
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (isBottomSheetVisible) {
            modelClose();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBottomSheetVisible, modelClose]);

  const formatTime = useCallback((sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const formattedTime = useMemo(() => formatTime(secondsLeft), [secondsLeft, formatTime]);



  if (loading) {
    return <SkeletonRentalCarDetails />;
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={[
          styles.backBtn,
          { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor },
          { borderColor: isDark ? appColors.darkBorder : appColors.border },
        ]}
        onPress={() => navigation.goBack()}
      >
        <Back />
      </TouchableOpacity>

      <ScrollView style={{ backgroundColor: isDark ? appColors.bgDark : appColors.whiteColor }} showsVerticalScrollIndicator={false}>
        <View>
          <Image source={{ uri: mainImage }} style={styles.mainImg} />
        </View>
        <View style={[styles.subImgContainer, { flexDirection: viewRTLStyle }, { backgroundColor: isDark ? appColors.bgDark : appColors.whiteColor }]}>
          {rentalVehicleListsDetails?.rental_vehicle_galleries
            ?.map((img: string, index: number) => (
              <SubImageItem
                key={index}
                img={img}
                index={index}
                mainImage={mainImage}
                setMainImage={setMainImage}
              />
            ))}
        </View>
        <View style={[styles.container]}>
          <View style={[styles.subContainer, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }, { borderColor: isDark ? appColors.darkBorder : appColors.border }]}>
            <View style={[styles.titleView, { flexDirection: viewRTLStyle }]}>
              <Text style={[styles.title, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{rentalVehicleListsDetails.name}</Text>
              <View style={[styles.rateContainer, { flexDirection: viewRTLStyle }]}>
                <Star1 />
                <Text style={styles.rating}>
                  {(rentalVehicleListsDetails?.driver?.rating_count ?? 0).toFixed(1)}
                </Text>
              </View>
            </View>

            <View style={[styles.detailContainer, { flexDirection: viewRTLStyle }]}>
              <Text style={styles.detail}>{rentalVehicleListsDetails.description}</Text>
              <View style={external.fd_row}>
                <Text style={styles.price}>
                  {zoneValue?.currency_symbol}{rentalVehicleListsDetails.vehicle_per_day_price}
                  <Text style={styles.day}>/{translateData.day}</Text>
                </Text>
              </View>
            </View>
            <View style={[styles.border, { borderBottomColor: isDark ? appColors.darkBorder : appColors.border }]} />
            <View style={[styles.driverContainer, { flexDirection: viewRTLStyle }]}>
              <Text style={[styles.title, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{translateData.driverPriceText}</Text>
              <View style={external.fd_row}>
                <Text style={styles.price}>
                  {zoneValue?.currency_symbol}{rentalVehicleListsDetails.driver_per_day_charge}
                  <Text style={styles.day}>/{translateData.day}</Text>
                </Text>
              </View>
            </View>

            <View style={[styles.carDetails, { flexDirection: viewRTLStyle }]}>
              {carDetails?.map((detail, index) => (
                <CarDetailItem key={index} detail={detail} isDark={isDark} />
              ))}
            </View>
            <Text style={[styles.title, external.mt_5, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{translateData.moreInfoText}</Text>
            {rentalVehicleListsDetails?.interior?.map((detail: any, index: number) => (
              <Text key={index} style={styles.description}>
                <Right /> {` ${detail}`}
              </Text>
            ))}
            <Text style={[styles.title, external.mt_15, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{translateData.billSummary}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: windowHeight(5) }}>
              <Text style={{ fontFamily: appFonts.regular, color: isDark ? appColors.darkText : appColors.primaryText }}>{translateData.vehicleFare}</Text>
              <Text style={{ fontFamily: appFonts.regular, color: isDark ? appColors.darkText : appColors.primaryText }}>{rentalVehicleListsDetails?.currency_symbol}{rentalVehicleListsDetails?.charge?.vehicle_rent} ({`${rentalVehicleListsDetails?.charge?.no_of_days} ${translateData.day}`})</Text>
            </View>
            {getDriver && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: windowHeight(3) }}>
                <Text style={{ fontFamily: appFonts.regular, color: isDark ? appColors.darkText : appColors.primaryText }}>{translateData.driverFare}</Text>
                <Text style={{ fontFamily: appFonts.regular, color: isDark ? appColors.darkText : appColors.primaryText }}>{rentalVehicleListsDetails?.currency_symbol}{rentalVehicleListsDetails?.charge?.driver_rent} ({`${rentalVehicleListsDetails?.charge?.no_of_days} ${translateData.day}`})</Text>
              </View>
            )}
            {rentalVehicleListsDetails?.charge?.platform_fee > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: windowHeight(3) }}>
                <Text style={{ fontFamily: appFonts.regular, color: isDark ? appColors.darkText : appColors.primaryText }}>{translateData.platformFees}</Text>
                <Text style={{ fontFamily: appFonts.regular, color: isDark ? appColors.darkText : appColors.primaryText }}>{rentalVehicleListsDetails?.currency_symbol}{rentalVehicleListsDetails?.charge?.platform_fee}</Text>
              </View>
            )}
            {rentalVehicleListsDetails?.charge?.tax && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: windowHeight(3) }}>
                <Text style={{ fontFamily: appFonts.regular, color: isDark ? appColors.darkText : appColors.primaryText }}>{translateData.tax}</Text>
                <Text style={{ fontFamily: appFonts.regular, color: isDark ? appColors.darkText : appColors.primaryText }}>{rentalVehicleListsDetails?.currency_symbol}{rentalVehicleListsDetails?.charge?.tax}</Text>
              </View>
            )}
            {rentalVehicleListsDetails?.charge?.commission && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: windowHeight(3) }}>
                <Text style={{ fontFamily: appFonts.regular, color: isDark ? appColors.darkText : appColors.primaryText }}>{translateData.commission}</Text>
                <Text style={{ fontFamily: appFonts.regular, color: isDark ? appColors.darkText : appColors.primaryText }}>{rentalVehicleListsDetails?.currency_symbol}{rentalVehicleListsDetails?.charge?.commission}</Text>
              </View>
            )}
            <View style={{ borderBottomWidth: 1, borderColor: isDark ? appColors.darkBorder : appColors.border, borderStyle: 'dashed', marginVertical: windowHeight(5) }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: appFonts.medium, color: isDark ? appColors.darkText : appColors.primaryText }}>{translateData.total}</Text>
              <Text style={{ color: appColors.primary, fontFamily: appFonts.medium }}>{rentalVehicleListsDetails?.currency_symbol}{rentalVehicleListsDetails?.charge?.total}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[external.mv_15]}
            activeOpacity={0.7}
            disabled={bookLoading}
          >
            <Button title={translateData.bookNow} onPress={bookRental} loading={bookLoading} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {isBottomSheetVisible && (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          handleIndicatorStyle={{ backgroundColor: appColors.primary, width: '13%' }}
          enablePanDownToClose={true}
          backdropComponent={({ style }) => (
            <View style={[style, { backgroundColor: appColors.modelBg }]} />
          )}
          backgroundStyle={{ backgroundColor: isDark ? appColors.bgDark : appColors.whiteColor }}
        >
          <BottomSheetView style={{ paddingHorizontal: windowHeight(14) }}>
            <View style={styles.imageWrapper}>
              <AnimatedCircularProgress
                size={100}
                width={10}
                fill={(1 - secondsLeft / totalSeconds) * 100}
                tintColor={appColors.primary}
                backgroundColor={appColors.loaderBackground}
                rotation={0}
                lineCap="round"
              >
                {
                  () => (
                    <Text style={styles.timerText}>
                      {formattedTime}
                    </Text>
                  )
                }
              </AnimatedCircularProgress>
            </View>

            <Text
              style={[styles.requestSuccess, {
                color: isDark ? appColors.whiteColor : appColors.primaryText,
              }]}
            >
              {translateData.requestSuccessfullySent}
            </Text>
            <Text
              style={styles.modelSuccess}
            >
              {translateData.requestSentSuccess}
            </Text>
            <View
              style={styles.modelButtonView}
            >
              <Button title={translateData.cancel} onPress={modelClose} backgroundColor={appColors.alertRed} loading={rideCancelLoading} />
            </View>
          </BottomSheetView>
        </BottomSheet>
      )}
    </View>
  );
}