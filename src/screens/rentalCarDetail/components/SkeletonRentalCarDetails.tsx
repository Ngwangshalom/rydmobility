import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { useValues } from '@src/utils/context/index';
import { appColors, windowHeight, windowWidth } from '@src/themes';

export const SkeletonRentalCarDetails = () => {
    const { isDark } = useValues();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const cardWidth = screenWidth - windowWidth(46.6);
    const contentPadding = windowWidth(15);
    const contentWidth = cardWidth - (contentPadding * 2);

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? appColors.bgDark : appColors.whiteColor }}>
            <ContentLoader
                speed={1.5}
                width={screenWidth}
                height={screenHeight}
                backgroundColor={isDark ? appColors.bgDark : appColors.loaderBackground}
                foregroundColor={isDark ? appColors.darkPrimary : appColors.loaderLightHighlight}
                viewBox={`0 0 ${screenWidth} ${screenHeight}`}
            >
                <Rect x="0" y="0" rx="0" ry="0" width={screenWidth} height={windowHeight(220)} />

                {(() => {
                    const subImgWidth = windowHeight(38.5);
                    const subImgMargin = windowWidth(6);
                    const totalSubImgWidth = (subImgWidth + subImgMargin * 2) * 5;
                    const startX = (screenWidth - totalSubImgWidth) / 2;

                    return Array.from({ length: 5 }).map((_, index) => (
                        <Rect
                            key={index}
                            x={startX + subImgMargin + index * (subImgWidth + subImgMargin * 2)}
                            y={windowHeight(180)}
                            rx={windowHeight(5)}
                            ry={windowHeight(5)}
                            width={subImgWidth}
                            height={windowHeight(36.5)}
                        />
                    ));
                })()}

                <Rect
                    x={windowWidth(23.3)}
                    y={windowHeight(230)}
                    rx={windowHeight(4)}
                    ry={windowHeight(4)}
                    width={cardWidth}
                    height={windowHeight(550)}
                />


                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(245)} rx="4" ry="4" width={windowWidth(150)} height={20} />
                <Rect x={screenWidth - windowWidth(23.3) - contentPadding - windowWidth(50)} y={windowHeight(245)} rx="4" ry="4" width={windowWidth(50)} height={20} />

                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(275)} rx="4" ry="4" width={contentWidth} height={15} />
                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(295)} rx="4" ry="4" width={contentWidth * 0.8} height={15} />

                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(320)} rx="4" ry="4" width={windowWidth(100)} height={25} />

                <Rect x={windowWidth(23.3)} y={windowHeight(355)} rx="0" ry="0" width={cardWidth} height={1} />

                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(370)} rx="4" ry="4" width={windowWidth(120)} height={20} />
                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(400)} rx="4" ry="4" width={windowWidth(100)} height={25} />

                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(440)} rx="8" ry="8" width={windowWidth(60)} height={windowWidth(60)} />
                <Rect x={windowWidth(23.3) + contentPadding + windowWidth(75)} y={windowHeight(440)} rx="8" ry="8" width={windowWidth(60)} height={windowWidth(60)} />
                <Rect x={windowWidth(23.3) + contentPadding + windowWidth(150)} y={windowHeight(440)} rx="8" ry="8" width={windowWidth(60)} height={windowWidth(60)} />
                <Rect x={windowWidth(23.3) + contentPadding + windowWidth(225)} y={windowHeight(440)} rx="8" ry="8" width={windowWidth(60)} height={windowWidth(60)} />

                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(440) + windowWidth(70)} rx="8" ry="8" width={windowWidth(60)} height={windowWidth(60)} />
                <Rect x={windowWidth(23.3) + contentPadding + windowWidth(75)} y={windowHeight(440) + windowWidth(70)} rx="8" ry="8" width={windowWidth(60)} height={windowWidth(60)} />
                <Rect x={windowWidth(23.3) + contentPadding + windowWidth(150)} y={windowHeight(440) + windowWidth(70)} rx="8" ry="8" width={windowWidth(60)} height={windowWidth(60)} />
                <Rect x={windowWidth(23.3) + contentPadding + windowWidth(225)} y={windowHeight(440) + windowWidth(70)} rx="8" ry="8" width={windowWidth(60)} height={windowWidth(60)} />

                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(600)} rx="4" ry="4" width={windowWidth(100)} height={20} />
                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(630)} rx="4" ry="4" width={contentWidth} height={15} />
                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(655)} rx="4" ry="4" width={contentWidth} height={15} />

                <Rect x={windowWidth(23.3)} y={windowHeight(690)} rx="0" ry="0" width={cardWidth} height={1} />
                <Rect x={windowWidth(23.3) + contentPadding} y={windowHeight(705)} rx="4" ry="4" width={contentWidth} height={25} />

                <Rect x={windowWidth(23.3)} y={windowHeight(750)} rx={windowHeight(10)} ry={windowHeight(10)} width={cardWidth} height={windowHeight(45)} />

            </ContentLoader>
        </View>
    );
};
