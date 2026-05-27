import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import { useValues } from '@src/utils/context/index';
import { appColors, windowHeight, windowWidth } from '@src/themes';

export const SkeletonVehicleCard = () => {
    const { isDark } = useValues();
    const { width: screenWidth } = useWindowDimensions();

    const marginHorizontal = windowWidth(18.9);
    const paddingHorizontal = windowWidth(15);
    const borderWidth = windowHeight(1);
    const contentWidth = screenWidth - (marginHorizontal * 2) - (paddingHorizontal * 2) - (borderWidth * 2);

    return (
        <View
            style={{
                backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor,
                borderRadius: windowHeight(5),
                marginHorizontal: windowWidth(18.9),
                marginTop: windowHeight(3),
                paddingTop: windowHeight(10),
                paddingHorizontal: windowWidth(15),
                borderWidth: windowHeight(1),
                borderColor: isDark ? appColors.darkBorder : appColors.border,
            }}
        >
            <ContentLoader
                speed={1.5}
                width={contentWidth}
                height={windowHeight(340)}
                backgroundColor={isDark ? appColors.bgDark : appColors.loaderBackground}
                foregroundColor={isDark ? appColors.darkPrimary : appColors.loaderLightHighlight}
            >
                <Rect x="0" y="0" rx={windowHeight(5)} ry={windowHeight(5)} width={contentWidth} height={windowHeight(100)} />

                <Rect x="0" y={windowHeight(115)} rx="4" ry="4" width={windowWidth(150)} height={windowHeight(20)} />
                <Circle cx={contentWidth - windowWidth(40)} cy={windowHeight(125)} r="8" />
                <Rect x={contentWidth - windowWidth(25)} y={windowHeight(120)} rx="3" ry="3" width="20" height="12" />

                <Rect x="0" y={windowHeight(150)} rx="3" ry="3" width={windowWidth(200)} height={windowHeight(14)} />
                <Rect x={contentWidth - windowWidth(70)} y={windowHeight(148)} rx="4" ry="4" width="60" height={windowHeight(18)} />

                <Rect x="0" y={windowHeight(180)} rx="0" ry="0" width={contentWidth} height="1" />

                <Rect x="0" y={windowHeight(200)} rx="3" ry="3" width="100" height={windowHeight(16)} />
                <Rect x={contentWidth - windowWidth(70)} y={windowHeight(198)} rx="4" ry="4" width="60" height={windowHeight(18)} />

                <Rect x="0" y={windowHeight(235)} rx={windowWidth(7)} ry={windowWidth(7)} width={windowWidth(70)} height={windowHeight(35)} />
                <Rect x={windowWidth(85)} y={windowHeight(235)} rx={windowWidth(7)} ry={windowWidth(7)} width={windowWidth(70)} height={windowHeight(35)} />
                <Rect x={windowWidth(170)} y={windowHeight(235)} rx={windowWidth(7)} ry={windowWidth(7)} width={windowWidth(70)} height={windowHeight(35)} />
                <Rect x={windowWidth(255)} y={windowHeight(235)} rx={windowWidth(7)} ry={windowWidth(7)} width={windowWidth(70)} height={windowHeight(35)} />

                <Rect x="0" y={windowHeight(285)} rx={windowWidth(7)} ry={windowWidth(7)} width={windowWidth(70)} height={windowHeight(35)} />
                <Rect x={windowWidth(85)} y={windowHeight(285)} rx={windowWidth(7)} ry={windowWidth(7)} width={windowWidth(70)} height={windowHeight(35)} />
                <Rect x={windowWidth(170)} y={windowHeight(285)} rx={windowWidth(7)} ry={windowWidth(7)} width={windowWidth(70)} height={windowHeight(35)} />
                <Rect x={windowWidth(255)} y={windowHeight(285)} rx={windowWidth(7)} ry={windowWidth(7)} width={windowWidth(70)} height={windowHeight(35)} />
            </ContentLoader>
        </View>
    );
};

export const SkeletonVehicleList = () => {
    return (
        <View style={{ paddingBottom: windowHeight(18.6) }}>
            {[...Array(3)].map((_, index) => (
                <SkeletonVehicleCard key={index} />
            ))}
        </View>
    );
};
