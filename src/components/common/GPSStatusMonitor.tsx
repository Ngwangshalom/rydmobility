import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Animated,
    Dimensions,
    Image,
    AppState,
    BackHandler
} from 'react-native';
import { isLocationEnabled } from 'react-native-android-location-enabler';
import { Linking } from 'react-native';
import Images from '@src/utils/images';
import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from '@src/themes';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

interface GPSStatusMonitorProps {
    checkInterval?: number;
}

const GPSStatusMonitor: React.FC<GPSStatusMonitorProps> = ({
    checkInterval = 3000
}) => {
    const [isGPSEnabled, setIsGPSEnabled] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(0));
    const [fadeAnim] = useState(new Animated.Value(0));
    const { translateData } = useSelector((state: any) => state.setting);

    const hasDismissed = useRef(false);

    const checkGPSStatus = async () => {
        try {
            const enabled = await isLocationEnabled();
            setIsGPSEnabled(enabled);
        } catch (error) {
            console.warn('Error checking GPS status:', error);
        }
    };

    useEffect(() => {
        if (!isGPSEnabled && !hasDismissed.current) {
            setShowModal(true);
        } else if (isGPSEnabled) {
            setShowModal(false);
            hasDismissed.current = false;
        }
    }, [isGPSEnabled]);

    useEffect(() => {
        if (Platform.OS !== 'android') {
            return;
        }

        checkGPSStatus();

        const intervalId = setInterval(() => {
            checkGPSStatus();
        }, checkInterval);

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                checkGPSStatus();
            }
        });

        return () => {
            clearInterval(intervalId);
            subscription.remove();
        };
    }, [checkInterval]);

    useEffect(() => {
        if (showModal) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0);
            fadeAnim.setValue(0);
        }
    }, [showModal]);

    const handleEnableGPS = async () => {
        try {
            if (Platform.OS === 'android') {
                await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
            } else {
                await Linking.openSettings();
            }
        } catch (error) {
            console.error('Error opening location settings:', error);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        hasDismissed.current = true;
        BackHandler.exitApp();
    };

    if (!showModal) return null;

    return (
        <Modal
            transparent
            visible={showModal}
            animationType="none"
            onRequestClose={handleClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        <Image source={Images.gpsDisable} style={styles.iconGPS} />
                    </View>

                    <Text style={styles.title}>{translateData?.gpsAllowTitle}</Text>

                    <Text style={styles.description}>
                        {translateData?.gpsAllowDescription}
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.enableButton}
                            onPress={handleEnableGPS}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.enableButtonText}>{translateData?.gpsAllowBtn}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.closeButtonText}>{translateData?.gpsAllowExit}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: appColors.modelBg,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: windowWidth(20),
    },
    modalContainer: {
        width: width - 60,
        backgroundColor: appColors.whiteColor,
        borderRadius: windowHeight(12),
        padding: windowHeight(18),
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: windowHeight(15),
    },
    title: {
        fontSize: fontSizes.FONT26,
        color: appColors.primaryText,
        fontFamily: appFonts.bold,
        marginBottom: windowHeight(10),
        textAlign: 'center',
    },
    description: {
        fontSize: fontSizes.FONT18,
        color: appColors.regularText,
        textAlign: 'center',
        marginBottom: windowHeight(24),
        paddingHorizontal: windowHeight(6),
    },
    buttonContainer: {
        width: '100%',
        gap: windowHeight(12),
    },
    enableButton: {
        backgroundColor: appColors.primary,
        paddingVertical: windowHeight(12),
        borderRadius: windowHeight(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    enableButtonText: {
        color: appColors.whiteColor,
        fontSize: fontSizes.FONT20,
        fontFamily: appFonts.medium,
        letterSpacing: 0.5,
    },
    closeButton: {
        backgroundColor: appColors.lightGray,
        paddingVertical: windowHeight(12),
        borderRadius: windowHeight(8),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: appColors.border,
    },
    closeButtonText: {
        color: appColors.regularText,
        fontSize: fontSizes.FONT20,
        fontFamily: appFonts.medium,
    },
    iconGPS: {
        height: windowHeight(60),
        width: windowHeight(60),
    }
});

export default GPSStatusMonitor;
