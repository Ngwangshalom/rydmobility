import React from "react";
import { View } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { useValues } from "@src/utils/context/index";
import { appColors, windowHeight, windowWidth } from "@src/themes";
import { styles } from "../../style";
import { external } from "../../../../../../../../styles/externalStyle";

interface SkeletonProfileSectionProps {
    hasAlertZone?: boolean;
}

export function SkeletonProfileSection({ hasAlertZone = false }: SkeletonProfileSectionProps) {
    const { isDark } = useValues();

    // Create a reusable item component for consistency
    const renderSkeletonItem = (width: number, key: string) => (
        <ContentLoader
            key={key}
            speed={1.5}
            width="100%"
            height={windowHeight(50)}
            backgroundColor={isDark ? appColors.bgDark : appColors.loaderBackground}
            foregroundColor={isDark ? appColors.darkPrimary : appColors.loaderLightHighlight}
        >
            {/* Icon */}
            <Rect
                x="0"
                y={windowHeight(8)}
                rx={windowHeight(17.5)}
                ry={windowHeight(17.5)}
                width={windowHeight(35)}
                height={windowHeight(35)}
            />
            {/* Title */}
            <Rect
                x={windowWidth(60)}
                y={windowHeight(15)}
                width={windowWidth(width)}
                height={windowHeight(16)}
                rx="0"
                ry="0"
            />
            {/* Arrow */}
            <Rect
                x="95%"
                y={windowHeight(18)}
                width={windowHeight(12)}
                height={windowHeight(12)}
                rx="0"
                ry="0"
            />
        </ContentLoader>
    );

    // Create a reusable divider component
    const renderDivider = (key: string) => (
        <View key={key} style={styles.lineHeight}>
            <ContentLoader
                speed={1.5}
                width="100%"
                height={windowHeight(1)}
                backgroundColor={isDark ? appColors.bgDark : appColors.loaderBackground}
                foregroundColor={isDark ? appColors.darkPrimary : appColors.loaderLightHighlight}
            >
                <Rect
                    x="0"
                    y="0"
                    width="100%"
                    height={windowHeight(1)}
                    rx="0"
                    ry="0"
                />
            </ContentLoader>
        </View>
    );

    return (
        <View>
            {/* First Section Title */}
            <ContentLoader
                speed={1.5}
                width="100%"
                height={windowHeight(30)}
                backgroundColor={isDark ? appColors.bgDark : appColors.loaderBackground}
                foregroundColor={isDark ? appColors.darkPrimary : appColors.loaderLightHighlight}
            >
                <Rect
                    x="0"
                    y={windowHeight(12)}
                    width={windowWidth(80)}
                    height={windowHeight(14)}
                    rx="0"
                    ry="0"
                />
            </ContentLoader>

            {/* First Section Container */}
            <View style={[
                styles.container,
                {
                    backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor,
                    borderColor: isDark ? appColors.darkBorder : appColors.border
                }
            ]}>
                {renderSkeletonItem(120, "item1")}
                {renderDivider("divider1")}
                {renderSkeletonItem(100, "item2")}
            </View>

            {/* Second Section Title */}
            <ContentLoader
                speed={1.5}
                width="100%"
                height={windowHeight(30)}
                backgroundColor={isDark ? appColors.bgDark : appColors.loaderBackground}
                foregroundColor={isDark ? appColors.darkPrimary : appColors.loaderLightHighlight}
                style={{ marginTop: windowHeight(17) }}
            >
                <Rect
                    x="0"
                    y={windowHeight(12)}
                    width={windowWidth(120)}
                    height={windowHeight(14)}
                    rx="0"
                    ry="0"
                />
            </ContentLoader>

            {/* Second Section Container */}
            <View style={[
                styles.container,
                {
                    backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor,
                    borderColor: isDark ? appColors.darkBorder : appColors.border
                }
            ]}>
                {renderSkeletonItem(150, "item3")}
                {renderDivider("divider2")}
                {renderSkeletonItem(130, "item4")}
                {renderDivider("divider3")}
                {renderSkeletonItem(110, "item5")}
            </View>

            {/* Alert Zone Section (if applicable) */}
            {hasAlertZone && (
                <>
                    {/* Alert Title */}
                    <ContentLoader
                        speed={1.5}
                        width="100%"
                        height={windowHeight(30)}
                        backgroundColor={isDark ? appColors.bgDark : appColors.loaderBackground}
                        foregroundColor={isDark ? appColors.darkPrimary : appColors.loaderLightHighlight}
                        style={{ marginTop: windowHeight(20) }}
                    >
                        <Rect
                            x="0"
                            y={windowHeight(12)}
                            width={windowWidth(80)}
                            height={windowHeight(14)}
                            rx="0"
                            ry="0"
                        />
                    </ContentLoader>

                    {/* Alert Container */}
                    <View style={[
                        styles.alertManu,
                        {
                            backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor,
                            borderColor: isDark ? appColors.darkBorder : appColors.iconRed
                        }
                    ]}>
                        <ContentLoader
                            speed={1.5}
                            width="100%"
                            height={windowHeight(50)}
                            backgroundColor={isDark ? appColors.bgDark : appColors.loaderBackground}
                            foregroundColor={isDark ? appColors.darkPrimary : appColors.loaderLightHighlight}
                        >
                            {/* Icon */}
                            <Rect
                                x="10"
                                y={windowHeight(8)}
                                rx={windowHeight(17.5)}
                                ry={windowHeight(17.5)}
                                width={windowHeight(35)}
                                height={windowHeight(35)}
                            />
                            {/* Title */}
                            <Rect
                                x={windowWidth(75)}
                                y={windowHeight(15)}
                                width={windowWidth(140)}
                                height={windowHeight(16)}
                                rx="0"
                                ry="0"
                            />
                        </ContentLoader>
                    </View>

                    {/* Logout Button */}
                    <ContentLoader
                        speed={1.5}
                        width="100%"
                        height={windowHeight(50)}
                        backgroundColor={isDark ? appColors.bgDark : appColors.loaderBackground}
                        foregroundColor={isDark ? appColors.darkPrimary : appColors.loaderLightHighlight}
                        style={{
                            width: "100%",
                            alignItems: "center",
                            height: windowHeight(35),
                            marginTop: windowHeight(10),
                            justifyContent: "center"
                        }}
                    >
                        <Rect
                            x="40%"
                            y={windowHeight(15)}
                            width={windowWidth(80)}
                            height={windowHeight(18)}
                            rx="0"
                            ry="0"
                        />
                    </ContentLoader>
                </>
            )
            }
        </View >
    );
}