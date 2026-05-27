import React, { useCallback } from "react";
import { Image, Text, View } from "react-native";
import styles from "./styles";
import { useValues } from "../../utils/context";

import { Button } from "../button";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../api/store";
import Images from "@src/utils/images";
import { appColors, windowHeight } from "@src/themes";
import { paymentsData } from "@src/api/store/actions";


export function LowBalance({ setLowBalance }: any) {
    const { translateData } = useSelector((state: any) => state.setting)
    const { isDark, viewRTLStyle } = useValues()
    const navigation = useNavigation<any>()

    const dispatch = useDispatch<AppDispatch>()
    useFocusEffect(
        useCallback(() => {
            dispatch(paymentsData())
        }, [dispatch]),
    )

    const colse = () => {
        setLowBalance(false)
    }


    const handeleTopUp = () => {
        setLowBalance(false)
        navigation.navigate('TopUpWallet')
    }

    return (
        <View style={[styles.flex]}>
            <View style={[styles.container, { backgroundColor: isDark ? appColors.primaryText : appColors.whiteColor }]}>
                <Image source={Images.lowBalance} style={styles.image} tintColor={appColors.primary} />
                <Text style={[styles.title, { color: isDark ? appColors.whiteColor : appColors.blackColor }]}>{translateData?.lowBalance}</Text>
                <Text style={styles.subText}>{translateData?.balanceNote}</Text>

                <View style={{ flexDirection: viewRTLStyle, alignItems: 'center', justifyContent: 'space-between', marginTop: windowHeight(2) }}>
                    <View style={{ width: '48%' }}>
                        <Button title={translateData?.cancel} backgroundColor={isDark ? appColors.bgDark : appColors.lightGray} onPress={colse} textColor={isDark ? appColors.whiteColor : appColors.blackColor} />
                    </View>
                    <View style={{ width: '48%' }}>
                        <Button title={translateData?.topUp} backgroundColor={appColors.primary} textColor={appColors.whiteColor} onPress={handeleTopUp} />
                    </View>

                </View>
            </View>
        </View>
    )
}