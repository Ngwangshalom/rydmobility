import React, { useContext, useEffect, useMemo, useState } from "react";
import styles from "./styles";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Location, Search } from "@src/utils/icons";
import { HomeSlider } from "@src/components";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { appColors, windowHeight } from "@src/themes";
import { useValues } from "@src/utils/context/index";
import { useSelector } from "react-redux";
import Images from "@src/utils/images";
import { commonStyles } from "@src/styles/commonStyle";
import { LocationContext } from "@src/utils/locationContext";
import { Header } from "@src/commonComponent";
import WebView from "react-native-webview";
import { getValue } from "@src/utils/localstorage";
import useStoredLocation from "@src/components/helper/useStoredLocation";
import useSmartLocation from "@src/components/helper/locationHelper";

export function FindDriverHome() {
  const { width } = Dimensions.get("window");
  const navigation = useNavigation<any>();
  const [isScrolling, setIsScrolling] = useState(true);
  const { viewRTLStyle, isDark, bgFullStyle, textRTLStyle, Google_Map_Key } =
    useValues();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isScrollable, setIsScrollable] = useState(true);
  const { homeScreenDataPrimary } = useSelector((state: any) => state.home);
  const [displayLatitude, setDisplayLatitude] = useState<number | null>(null);
  const [displayLongitude, setDisplayLongitude] = useState<number | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const { currentLatitude, currentLongitude, locationStatus } =
    useSmartLocation();
  const { latitude, longitude } = useStoredLocation();
  const { taxidoSettingData } = useSelector((state: any) => state.setting);
  const mapType = taxidoSettingData?.cabbooking_values?.location?.map_provider;
  const actualLatitude = latitude || currentLatitude;
  const actualLongitude = longitude || currentLongitude;
  const { translateData } = useSelector((state: any) => state.setting);
  const [recentDatas, setRecentDatas] = useState<any[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        const stored = await getValue("locations");
        let parsedLocations = [];
        if (stored) {
          parsedLocations = JSON.parse(stored);
          if (!Array.isArray(parsedLocations)) {
            parsedLocations = [parsedLocations];
          }
        }
        setRecentDatas(parsedLocations);
      } catch (error) {
        console.error("Error parsing recent locations:", error);
        setRecentDatas([]); // fallback
      }
    };
    if (isFocused) {
      fetchRecentData(); // only run when screen is focused
    }
  }, [isFocused]);

  useEffect(() => {
    const fetchSelectedLocation = async () => {
      // Check if there's a previously selected location
      const selectedLat = await getValue("user_latitude_Selected");
      const selectedLng = await getValue("user_longitude_Selected");

      if (selectedLat && selectedLng) {
        // Use the selected location if available
        setDisplayLatitude(parseFloat(selectedLat));
        setDisplayLongitude(parseFloat(selectedLng));
        setIsLocationLoading(false);
      } else if (actualLatitude && actualLongitude) {
        // Use current location if available
        setDisplayLatitude(actualLatitude);
        setDisplayLongitude(actualLongitude);
        setIsLocationLoading(false);
      } else {
        // Still loading, keep showing loader
        setIsLocationLoading(true);
      }
    };

    fetchSelectedLocation();
  }, [actualLatitude, actualLongitude, locationStatus]);

  const googleMapHtml = useMemo(() => {
    if (!displayLatitude || !displayLongitude) return "";

    const mapStyles = isDark
      ? [
        { elementType: "geometry", stylers: [{ color: "#212121" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        {
          elementType: "labels.text.stroke",
          stylers: [{ color: "#212121" }],
        },
        {
          featureType: "administrative",
          elementType: "geometry",
          stylers: [{ color: "#757575" }],
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [{ color: "#282828" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#383838" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#000000" }],
        },
      ]
      : [];

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <style>
          html, body, #map {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=${Google_Map_Key}"></script>
        <script>
          function initMap() {
            const center = { lat: ${displayLatitude}, lng: ${displayLongitude} };
            const map = new google.maps.Map(document.getElementById('map'), {
              center,
              zoom: 15,
              disableDefaultUI: true,
              styles: ${JSON.stringify(mapStyles)}
            });
            new google.maps.Marker({
              position: center,
              map
            });
          }
          window.onload = initMap;
        </script>
      </head>
      <body>
        <div id="map"></div>
      </body>
    </html>
    `;
  }, [displayLatitude, displayLongitude, isDark]);

  const osmHtml = useMemo(() => {
    if (!displayLatitude || !displayLongitude) return "";

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${displayLatitude}, ${displayLongitude}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);
          L.marker([${displayLatitude}, ${displayLongitude}]).addTo(map);
        </script>
      </body>
    </html>
    `;
  }, [displayLatitude, displayLongitude]);

  const locationData = [
    { id: "1", label: "Adajan, Gujarat" },
    { id: "2", label: "Adajan, Gujarat" },
  ];

  const onPress = index => {
    setSelectedIndex(index);
  };
  const serviceCategories = [
    {
      id: 1,
      name: "One Way",
    },
    {
      id: 2,
      name: "Round Trip",
    },
    {
      id: 3,
      name: "Outstation",
    },
    {
      id: 4,
      name: "Daily",
    },
  ];

  const selectedTripType = serviceCategories[selectedIndex]?.name;

  return (
    <View
      style={[
        commonStyles.flexContainer,
        { backgroundColor: appColors.lightGray },
      ]}
    >
      <Header value={"Find Driver"} />
      <View
        style={[
          styles.main,
          {
            backgroundColor: isDark ? "#1F1F1F" : appColors.lightGray,
          },
        ]}
      >
        <View style={styles.mapContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <WebView
              originWhitelist={["*"]}
              source={{
                html: mapType === "osm" ? osmHtml : googleMapHtml,
              }}
              style={{ height: windowHeight(200) }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowFileAccess={false}
              allowUniversalAccessFromFileURLs={false}
              mixedContentMode="compatibility"
              onError={error => console.log("WebView error:", error)}
              onHttpError={error => console.log("WebView HTTP error:", error)}
            />
            <View style={styles.view}>
              <View>
                <FlatList
                  horizontal
                  data={serviceCategories}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{ paddingBottom: windowHeight(8) }}
                  renderItem={({ item, index }) => {
                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onPress(index)}
                        style={[
                          styles.item,
                          { width: isScrollable ? width / 4 : width },
                        ]}
                      >
                        <Image
                          style={styles.image}
                          source={Images.imagePlaceholder}
                        />

                        <Text
                          style={[
                            styles.text,
                            {
                              color: isDark
                                ? appColors.whiteColor
                                : appColors.primaryText,
                            },
                          ]}
                        >
                          {item.name}
                        </Text>

                        {selectedIndex === index && (
                          <View style={styles.highlightLine} />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
                <View style={styles.mainLine} />
              </View>

              <TouchableOpacity
                style={[
                  styles.packageMainView,
                  {
                    backgroundColor: bgFullStyle,
                    borderColor: isDark
                      ? appColors.darkBorder
                      : appColors.border,
                  },
                ]}
                onPress={() =>
                  navigation.navigate("FindLocationScreen", {
                    defultAddress: recentDatas?.[0]?.shortAddress || "",
                    tripType: selectedTripType,
                  })
                }
              >
                <View
                  style={[
                    styles.searchView,
                    {
                      backgroundColor: isDark
                        ? appColors.darkPrimary
                        : appColors.lightGray,

                      flexDirection: viewRTLStyle,
                    },
                  ]}
                >
                  <Search />
                  <Text
                    style={[
                      styles.whereNext,
                      {
                        color: isDark
                          ? appColors.whiteColor
                          : appColors.primaryText,
                        textAlign: textRTLStyle,
                      },
                    ]}
                  >
                    {translateData.whereNext}
                  </Text>
                </View>

                {recentDatas?.length > 0 && (
                  <Text
                    style={[
                      styles.homeRecentSearch,
                      { textAlign: textRTLStyle },
                    ]}
                  >
                    Recent Search
                  </Text>
                )}
                {recentDatas?.length > 0 && (
                  <FlatList
                    data={recentDatas}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }: any) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          navigation.navigate("FindLocationScreen", {
                            defultAddress: item?.shortAddress || "",
                            latitude: item?.latitude,
                            longitude: item?.longitude,
                            tripType: selectedTripType,
                          })
                        }
                      >
                        <View
                          style={[
                            styles.centerLocation,
                            { flexDirection: viewRTLStyle },
                          ]}
                        >
                          <Location />
                          <Text
                            style={[
                              styles.adajanText,
                              {
                                color: isDark
                                  ? appColors.whiteColor
                                  : appColors.primaryText,
                              },
                            ]}
                          >
                            {item?.shortAddress?.length > 38
                              ? item?.shortAddress.slice(0, 38) + "..."
                              : item?.shortAddress}
                          </Text>
                        </View>

                        {index < recentDatas.length - 1 && (
                          <View style={styles.itemDivider} />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                )}
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: windowHeight(40) }}>
              <HomeSlider
                onSwipeStart={() => setIsScrolling(false)}
                onSwipeEnd={() => setIsScrolling(true)}
                bannerData={homeScreenDataPrimary.banners}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
