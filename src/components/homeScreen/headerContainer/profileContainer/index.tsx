import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useValues } from "@src/utils/context/index";;
import styles from "./styles";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ArrowDown, LocationMarker } from "@src/utils/icons";
import { appColors } from "@src/themes";
import { getValue } from "@src/utils/localstorage";
import useStoredLocation from "@src/components/helper/useStoredLocation";

export function ProfileContainer() {
  const navigation = useNavigation<any>();
  const { viewRTLStyle, isRTL } = useValues();
  const { self } = useSelector((state: any) => state.account);
  const { translateData } = useSelector((state: any) => state.setting);
  const { latitude, longitude } = useStoredLocation();
  const char = self?.name ? self.name.charAt(0) : "";
  const [city, setCity] = useState<string>('');
  const [fullAddress, setFullAddress] = useState<string>('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  useEffect(() => {
    const getAddress = async () => {
      let lat = await getValue('user_latitude_Selected');
      let lng = await getValue('user_longitude_Selected');

      let finalLat = lat ? parseFloat(lat) : latitude;
      let finalLng = lng ? parseFloat(lng) : longitude;

      if (!finalLat || !finalLng) {
        setCity(translateData?.npfoundcity || 'City not found');
        setFullAddress(translateData?.addressnot || 'Address not found');
        return;
      }

      try {
        // Use OSM Nominatim for free reverse geocoding
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${finalLat}&lon=${finalLng}&zoom=18&addressdetails=1`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'RYD/1.0',
            'Accept-Language': 'en'
          }
        });
        const data = await response.json();

        if (data && data.address) {
          const address = data.address;
          
          // Extract city/town from address components
          const foundCity = address.neighbourhood || 
                           address.town || 
                           address.village || 
                           address.municipality || 
                           address.county ||
                           'City not found';
          
          const fullAddr = data.display_name || 'Address not found';

          setCity(foundCity);
          setFullAddress(fullAddr);
        } else {
          setCity(translateData?.npfoundcity || 'City not found');
          setFullAddress(translateData?.addressnot || 'Address not found');
          console.warn('OSM Geocoding failed: No address data');
        }
      } catch (error) {
        console.error('Error fetching address from OSM:', error);
        setCity(translateData?.cityerror || 'Error fetching city');
        setFullAddress(translateData?.addresserror || 'Error fetching address');
      }
    };
    getAddress();
  }, [latitude, longitude, translateData]);

  const handleImagePress = async () => {
    const token = await getValue("token")
    if (token) {
      navigation.navigate("EditProfile")
    }
  }

  useFocusEffect(
    useCallback(() => {
      const fetchStoredImage = async () => {
        const storedImageUri = await getValue("profile_image_uri");
        setLocalImageUri(storedImageUri);
      };
      fetchStoredImage();
    }, [])
  );

  const gotoLocation = () => {
    navigation.navigate("LocationSelect", { screenValue: "HomeScreen" })
  }
  
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchStoredImage = async () => {
        const storedImageUri = await getValue("profile_image_uri");
        setLocalImageUri(storedImageUri);
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      };
      fetchStoredImage();
    }, [])
  );

  return (
    <View style={[styles.mainView, { flexDirection: viewRTLStyle }]}>

      <TouchableOpacity onPress={gotoLocation} style={styles.viewText}>
        <Text style={[styles.selfName, { textAlign: isRTL ? 'right' : 'left' }]}>
          <LocationMarker /> {city?.split(" ")[0] || translateData?.fecthing || 'Fetching...'} <ArrowDown color={appColors.whiteColor} />
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={styles.text}>
            {fullAddress.length > 32 ? `${fullAddress.substring(0, 32)}...` : fullAddress}
          </Text>
        </View>
      </TouchableOpacity >

      <TouchableOpacity onPress={handleImagePress} style={styles.imageView} activeOpacity={0.7}>
        {self?.profile_image_url ? (
          <Image
            style={styles.imageStyle}
            source={{ uri: self.profile_image_url }}
          />
        ) : localImageUri ? (
          <Image
            style={styles.imageStyle}
            source={{ uri: localImageUri }}
          />
        ) : (
          <View style={styles.textView}>
            {loading ? <ActivityIndicator size="small" color={appColors.primary} /> : <Text style={styles.charText}>{char || translateData?.guestChar || 'G'}</Text>}
          </View>
        )}
      </TouchableOpacity>
    </View >
  );
}