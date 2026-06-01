import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Keyboard, SafeAreaView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import styles from "./styles";
import { Button } from "@src/commonComponent";
import MapView, { Marker } from "react-native-maps";
import { Location } from "@src/utils/icons";
import { appColors, windowHeight, windowWidth } from "@src/themes";
import { HeaderContainer, HomeSlider } from "@src/components";
import { BannerLoader } from "../bannerLoader";
import useStoredLocation from "@src/components/helper/useStoredLocation";
import { useValues } from "@src/utils/context/index";;
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { getValue, setValue } from "@src/utils/localstorage";
import { ambulanceAction } from "@src/api/store/actions";
import { commonStyles } from "@src/styles/commonStyle";
import { AppDispatch } from "@src/api/store";

type Coordinates = {
    latitude: number;
    longitude: number;
};

type AddressSuggestion = {
    place_id: string;
    osm_id: string;
    display_name: string;
    [key: string]: any; // Allow other properties
};

type RecentAddress = {
    address: string;
    timestamp: string;
};

export function AmbulanceHome() {
    const [pickup, setPickup] = useState<string>("");
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isPickupField, setIsPickupField] = useState<boolean>(true);
    const inputTimer = useRef<NodeJS.Timeout | null>(null);
    const [recentAddresses, setRecentAddresses] = useState<RecentAddress[]>([]);
    const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
    const navigation = useNavigation<any>();
    const mapRef = useRef<MapView>(null);
    const [isScrolling, setIsScrolling] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { homeScreenData } = useSelector((state: any) => state.home);
    const dispatch = useDispatch<AppDispatch>();
    const { bgFullStyle, viewRTLStyle, textRTLStyle, isDark, bgContainer } = useValues();
    const { translateData } = useSelector((state: any) => state.setting);
    const { latitude, longitude } = useStoredLocation();

    useEffect(() => {
        loadRecentAddresses();
        if (latitude && longitude) {
            fetchAddressFromCoords(latitude, longitude);
        }
    }, [latitude, longitude]);

    const loadRecentAddresses = async () => {
        const savedAddresses = await getValue("ambulanceLocations");
        if (savedAddresses) {
            try {                
                const parsed: RecentAddress[] = JSON.parse(savedAddresses);
                setRecentAddresses(parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            } catch (error) {
                console.error("Error parsing recent addresses:", error);
            }
        }
    };

    // OSM Reverse Geocoding (coordinates to address)
    const fetchAddressFromCoords = async (latitude: number | null, longitude: number | null) => {
        if (!latitude || !longitude) return;
        setIsLoading(true);
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Ryd/1.0 (mail@rydmobi;ity.com)',
                    'Accept-Language': 'en'
                }
            });
            const json = await response.json();
            
            if (json.display_name) {
                const address = json.display_name;
                setPickup(address);
                setPickupCoords({ latitude, longitude });
                
                // Animate map to location
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude,
                        longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }, 1000);
                }
            }
        } catch (error) {
            console.error("Error fetching address from OSM:", error);
        }
        finally { setIsLoading(false); }
    };

    // OSM Forward Geocoding (address to coordinates)
    const fetchCoordinates = async (address: string, isPickup: boolean) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Ryd/1.0 (mail@rydmobi;ity.com)',
                    'Accept-Language': 'en'
                }
            });
            const json = await response.json();
            
            if (json && json.length > 0) {
                const location = json[0];
                const coords = { 
                    latitude: parseFloat(location.lat), 
                    longitude: parseFloat(location.lon) 
                };
                
                if (isPickup) {
                    setPickupCoords(coords);
                }
                
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        ...coords,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }, 1000);
                }
                
                return coords;
            }
        } catch (error) {
            console.error("Error fetching coordinates from OSM:", error);
        }
        return null;
    };

    const handleSelectSuggestion = async (address: any, isPickup: boolean) => {
        const addressText = address?.display_name || address?.address || address;
        
        if (isPickup) {
            setPickup(addressText);
            await fetchCoordinates(addressText, true);
        } 
        
        setSuggestions([]);
        Keyboard.dismiss();
    };

    // OSM Address Autocomplete
    const fetchAddressSuggestions = useCallback(async (text: string) => {
        if (text?.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=5`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Ryd/1.0 (mail@rydmobi;ity.com)',
                    'Accept-Language': 'en'
                }
            });
            const json = await response.json();
            
            if (json && json.length > 0) {
                setSuggestions(json); 
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching address suggestions from OSM:", error);
            setSuggestions([]);
        } finally { setIsLoading(false);
        }
    }, []);

    const handleInputChange = (text: string, isPickup?: boolean) => {
        if (isPickup) {
            setPickup(text);
            setIsPickupField(true);
        } else {
            setIsPickupField(false);
        }
        
        if (inputTimer.current) {
            clearTimeout(inputTimer.current);
        }
        
        inputTimer.current = setTimeout(() => {
            fetchAddressSuggestions(text);
        }, 500);
    };

    const gotoBookAmbulance = async () => {
        if (!pickup.trim() || !pickupCoords) {
            console.warn("Please enter a pickup location");
            return;
        }

        try {
            // Save to recent addresses
            const newLocation: RecentAddress = { 
                address: pickup,
                timestamp: new Date().toISOString()
            };
            
            let updatedLocations = [newLocation, ...recentAddresses.filter(loc => loc.address !== pickup)];
            if (updatedLocations.length > 5) { // Keep only the 5 most recent
                updatedLocations = updatedLocations.slice(0, 5);
            }

            await setValue("ambulanceLocations", JSON.stringify(updatedLocations));
            setRecentAddresses(updatedLocations);

            // Using already fetched coordinates. If not available, fetch them.
            const coords = await fetchCoordinates(pickup, true);
            
            if (coords) {
                dispatch(ambulanceAction({ 
                    lat: coords.latitude, 
                    lng: coords.longitude 
                }));
                
                navigation.navigate("BookAmbulance", { 
                    location: pickup, 
                    lat: coords.latitude, 
                    lng: coords.longitude 
                });
                
                return coords;
            } else {
                console.error("Could not geocode address:", pickup);
            }
        } catch (error) {
            console.error("Error in gotoBookAmbulance:", error);
        }
    };

    // Helper function to format address from OSM response
    const formatOSMAddress = (item: any) => {
        return item?.display_name || item?.address || (typeof item === 'string' ? item : '');
    };

    // Helper function to get address short description
    const getShortAddress = (item: any) => {
        if (item.display_name) {
            return item.display_name.split(',')[0];
        }
        return item?.address || item;
    };

    return (
        <View
            style={[
                commonStyles.flexContainer,
                { backgroundColor: appColors.lightGray },
            ]}
        >
            <SafeAreaView style={styles.containerHeader}>
                <HeaderContainer />
            </SafeAreaView>
            <View style={[styles.container, { backgroundColor: bgFullStyle }]}>
                <View style={[styles.inputContainer, { backgroundColor: bgFullStyle }]}>
                    <View style={{ height: windowHeight(180) }}>
                        {homeScreenData?.banners && homeScreenData.banners?.length > 0 ? (
                            <HomeSlider
                                onSwipeStart={() => setIsScrolling(false)}
                                onSwipeEnd={() => setIsScrolling(true)}
                                bannerData={homeScreenData.banners}
                            />
                        ) : (
                            <BannerLoader />
                        )}
                    </View>
                    <View style={{ paddingHorizontal: windowWidth(20) }}>
                        <View >
                            <View style={[styles.inputBox, { flexDirection: viewRTLStyle }, { backgroundColor: isDark ? bgContainer : appColors.lightGray }]}>
                                <View style={[styles.iconContainer, { backgroundColor: bgFullStyle }]}>
                                    <Location />
                                </View>
                                <TextInput
                                    placeholderTextColor={isDark ? appColors.whiteColor : appColors.blackColor}
                                    placeholder={translateData.pickupLocation || "Enter pickup location"}
                                    style={[styles.input, { 
                                        textAlign: textRTLStyle,
                                        color: isDark ? appColors.whiteColor : appColors.blackColor 
                                    }]}
                                    value={pickup}
                                    onChangeText={(text) => handleInputChange(text, true)}
                                />
                                {isLoading && (
                                    <ActivityIndicator style={{marginRight: 10}} color={isDark ? appColors.whiteColor : appColors.blackColor} />
                                )}
                            </View>
                        </View>
                        <Text style={[styles.suggestionText, { 
                            textAlign: textRTLStyle,
                            color: isDark ? appColors.whiteColor : appColors.blackColor 
                        }]}>
                            {suggestions?.length > 0 ? 
                                translateData?.suggestedAddresses || "Suggested Addresses" : 
                                translateData?.recentAddresses || "Recent Addresses"}
                        </Text>
                        <View style={styles.listView}>
                            {/* Suggestions List */}
                            <FlatList
                                data={suggestions}
                                keyExtractor={(item) => 
                                    item?.place_id || item?.osm_id || index.toString()
                                }
                                renderItem={({ item, index }) => {
                                    const isLastItem = index === suggestions.length - 1;
                                    const addressText = formatOSMAddress(item);
                                    
                                    return (
                                        <View>
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => handleSelectSuggestion(item, isPickupField)}
                                                style={[styles.suggestionItem, { flexDirection: viewRTLStyle }]}
                                            >
                                                <View><Location /></View>
                                                <Text style={[styles.suggestionText, {
                                                    color: isDark ? appColors.whiteColor : appColors.blackColor
                                                }]}>
                                                    {getShortAddress(item)}
                                                </Text>
                                            </TouchableOpacity>
                                            {!isLastItem && (
                                                <View style={{ 
                                                    borderBottomWidth: windowHeight(1), 
                                                    borderColor: appColors.border 
                                                }} />
                                            )}
                                        </View>
                                    );
                                }}
                                ListEmptyComponent={suggestions.length === 0 ? null : undefined}
                            />
                            
                            {/* Recent Addresses List */}
                            {suggestions.length === 0 && recentAddresses.length > 0 && (
                                <FlatList
                                    data={recentAddresses}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item, index }) => {
                                        const isLastItem = index === recentAddresses.length - 1;
                                        const addressText = item.address;
                                        return (
                                            <View>
                                                <TouchableOpacity
                                                    activeOpacity={0.7}
                                                    onPress={() => handleSelectSuggestion(addressText, isPickupField)}
                                                    style={[styles.suggestionItem, {
                                                        flexDirection: viewRTLStyle,
                                                    }]}
                                                >
                                                    <View><Location /></View>
                                                    <Text style={[styles.suggestionText, { 
                                                        textAlign: textRTLStyle,
                                                        color: isDark ? appColors.whiteColor : appColors.blackColor
                                                    }]}>
                                                        {getShortAddress(addressText)}
                                                    </Text>
                                                </TouchableOpacity>
                                                {!isLastItem && (
                                                    <View style={{ 
                                                        borderBottomWidth: windowHeight(1), 
                                                        borderColor: appColors.border 
                                                    }} />
                                                )}
                                            </View>
                                        );
                                    }}
                                />
                            )}
                            
                            {/* No data message */}
                            {suggestions.length === 0 && recentAddresses.length === 0 && (
                                <View style={styles.noDataContainer}>
                                    <Text style={{ 
                                        color: isDark ? appColors.whiteColor : appColors.blackColor,
                                        textAlign: 'center'
                                    }}>
                                        {translateData?.nodataFound || "No addresses found"}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Map View */}
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: pickupCoords?.latitude || (latitude || 37.7749),
                            longitude: pickupCoords?.longitude || (longitude || -122.4194),
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                    >
                        {pickupCoords && (
                            <Marker 
                                coordinate={pickupCoords} 
                                title={translateData?.PickupAmbulance || "Pickup Location"}
                                description={pickup}
                            />
                        )}
                    </MapView>
                </View>
                
                <View style={styles.buttonView}>
                    <View style={styles.buttonHz_Space}>
                        <Button 
                            title={translateData?.confirmLocation || "Confirm Location"} 
                            onPress={gotoBookAmbulance} 
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}