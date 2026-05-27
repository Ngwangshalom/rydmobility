import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import { useValues } from '@src/utils/context/index';
import { appColors, windowHeight, windowWidth } from '@src/themes';

export const SkeletonVehicleCard = () => {
    const { isDark } = useValues();
    const { width: screenWidth } = useWindowDimensions();

    const marginHorizontal = windowWidth(10);
    const paddingHorizontal = windowWidth(10);
    const contentWidth = screenWidth - (marginHorizontal * 2) - (paddingHorizontal * 2);

    return (
        <View
            style={{
                backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor,
                borderRadius: windowHeight(10),
                marginHorizontal: windowWidth(10),
                marginVertical: windowHeight(5),
                paddingHorizontal: windowWidth(10),
                paddingVertical: windowHeight(10),
                borderWidth: 1,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
            }}
        >
            <ContentLoader
                speed={1.5}
                width={contentWidth}
                height={windowHeight(80)}
                backgroundColor={isDark ? appColors.bgDark : appColors.loaderBackground}
                foregroundColor={isDark ? appColors.darkPrimary : appColors.loaderLightHighlight}
            >
                {/* Vehicle image */}
                <Rect x="0" y="0" rx={windowHeight(8)} ry={windowHeight(8)} width={windowWidth(80)} height={windowHeight(60)} />

                {/* Vehicle name */}
                <Rect x={windowWidth(95)} y="5" rx="4" ry="4" width={windowWidth(120)} height={windowHeight(18)} />

                {/* Vehicle details */}
                <Rect x={windowWidth(95)} y={windowHeight(30)} rx="3" ry="3" width={windowWidth(80)} height={windowHeight(12)} />

                {/* Price */}
                <Rect x={contentWidth - windowWidth(60)} y="5" rx="4" ry="4" width={windowWidth(60)} height={windowHeight(20)} />

                {/* ETA */}
                <Rect x={contentWidth - windowWidth(50)} y={windowHeight(35)} rx="3" ry="3" width={windowWidth(50)} height={windowHeight(12)} />
            </ContentLoader>
        </View>
    );
};

export const SkeletonVehicleList = () => {
    return (
        <View>
            {[...Array(3)].map((_, index) => (
                <SkeletonVehicleCard key={index} />
            ))}
        </View>
    );
};
