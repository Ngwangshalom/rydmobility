import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Calendar } from "react-native-calendars";
import { RightArrows, LeftArrow, Back } from "@utils/icons";
import styles from "./styles";
import { months } from "../../dateTimeSchedule/data";
import Images from "@utils/images";
import { appColors, appFonts, fontSizes, windowHeight } from "@src/themes";
import { useValues } from '@src/utils/context/index';
import { Button, LineContainer, notificationHelper } from "@src/commonComponent";
import { useAppNavigation, useAppRoute } from "@src/utils/navigation";
import { useSelector } from "react-redux";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function Calander({ onPress }: any) {
  const [selecte, setSelecte] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(monthNames[new Date().getMonth()]);
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [periods, setPeriods] = useState(["AM", "PM"]);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [day, setday] = useState(new Date().getDate().toString());
  const [datee, setDate] = useState("");
  const [time, setTime] = useState("00");
  const { navigate, goBack } = useAppNavigation();
  const route = useAppRoute();
  const { fieldValue, categoryId, service_ID, service_name, service_category_slug, startDate: passedStartDate, startTime: passedStartTime, isRental } = route.params || {};
  const { linearColorStyle, textColorStyle, isDark, bgContainer, viewRTLStyle, textRTLStyle, isRTL } = useValues()
  const { translateData } = useSelector((state) => state.setting);
  const [DateValue, setDateValue] = useState("");
  const [TimeValue, setTimeValue] = useState("");
  const currentYear = new Date().getFullYear().toString();

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = (parseInt(currentYear) + i).toString();
    return { label: year, value: year };
  });

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const gotoBack = () => {
    const isDaySelected = !!selecte;
    const isTimeValid = hour !== "00" || time !== "00";
    const isPeriodSelected = selectedPeriodIndex !== null;

    if (!isDaySelected || !selectedMonth || !selectedYear || !isTimeValid || !isPeriodSelected) {
      notificationHelper("", translateData?.datevalidationText, "error");
      return;
    }

    const formattedDate = `${day} ${selectedMonth} ${selectedYear}`;
    const formattedTime = `${hour}:${time} ${periods[selectedPeriodIndex]}`;

    let selectedHour = parseInt(hour, 10);
    if (periods[selectedPeriodIndex] === "PM" && selectedHour !== 12) {
      selectedHour += 12;
    }
    if (periods[selectedPeriodIndex] === "AM" && selectedHour === 12) {
      selectedHour = 0;
    }
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthIndex = monthNames.indexOf(selectedMonth);
    const selectedMinute = parseInt(time, 10);

    const now = new Date();
    const selectedDateTime = new Date(
      selectedYear,
      monthIndex,
      parseInt(day, 10),
      selectedHour,
      selectedMinute
    );

    if (selectedDateTime <= now) {
      notificationHelper("", translateData?.dateTextInvalid, 'error');
      return;
    }

    if (fieldValue === 'endTime' && passedStartDate && passedStartTime) {
      const parts = passedStartDate.split(' ');
      const sDay = parseInt(parts[0], 10);
      const sMonth = monthNames.indexOf(parts[1]);
      const sYear = parseInt(parts[2], 10);

      const [sTimeStr, sPeriod] = passedStartTime.split(' ');
      const [sHoursStr, sMinutesStr] = sTimeStr.split(':');
      let sHours = parseInt(sHoursStr, 10);
      const sMinutes = parseInt(sMinutesStr, 10);

      if (sPeriod === 'PM' && sHours !== 12) sHours += 12;
      if (sPeriod === 'AM' && sHours === 12) sHours = 0;

      const startDateTime = new Date(sYear, sMonth, sDay, sHours, sMinutes);

      if (selectedDateTime <= startDateTime) {
        notificationHelper("", "End time must be after start time", "error");
        return;
      }
    }

    setDateValue(formattedDate);
    setTimeValue(formattedTime);

    if (fieldValue === "Ride") {
      navigate("Ride", {
        DateValue: formattedDate,
        TimeValue: formattedTime,
        service_name: service_name,
        service_ID: service_ID,
        field: "schedule",
        categoryOption: "Cab",
        service_category_ID: categoryId,
        service_category_slug: service_category_slug,
      });
    } else {
      navigate("RentalBooking", {
        DateValue: formattedDate,
        TimeValue: formattedTime,
        service_name: service_name,
        service_ID: service_ID,
        field: fieldValue,
        service_category_ID: categoryId,
        service_category_slug: service_category_slug
      });
    }
  };


  const handleLeftArrowClick = () => {
    setSelectedPeriodIndex(0);
  };

  const handleRightArrowClick = () => {
    setSelectedPeriodIndex(1);
  };

  const handleDecrease = () => {
    let newTime = parseInt(time, 10) - 1;
    if (newTime >= 0) {
      setTime(newTime.toString().padStart(2, "0"));
    }
  };

  const handleIncrease = () => {
    let newTime = parseInt(time, 10) + 1;
    if (newTime <= 60) {
      setTime(newTime.toString().padStart(2, "0"));
    }
  };

  const [hour, setHour] = useState("00");
  const handleDecreaseHour = () => {
    let newHour = parseInt(hour, 10) - 1;
    if (newHour >= 0) {
      setHour(newHour.toString().padStart(2, "0"));
    }
  };

  const handleIncreaseHour = () => {
    let newHour = parseInt(hour, 10) + 1;
    if (newHour <= 12) {
      setHour(newHour.toString().padStart(2, "0"));
    }
  };

  useEffect(() => {
    const selectedMonthObject = months.find(month => month.value === selectedMonth);
    if (selectedMonthObject) {
      setDate(`${selectedYear}-${selectedMonthObject.no}-01`);
    }
  }, [selectedMonth, selectedYear]);


  const onDayPress = (day) => {
    const selectedDate = new Date(day.dateString);

    if (fieldValue === 'startTime') {
      // For start/pickup date: allow current date to max 15 days from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 15);

      if (selectedDate < today || selectedDate > maxDate) {
        return;
      }
    } else if (fieldValue === 'endTime') {
      // For end date: allow from pickup date to max 15 days from pickup date
      if (!passedStartDate) {
        return;
      }

      // Parse the passed start date format "DD Month YYYY"
      const startDateParts = passedStartDate.split(' ');
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const startDay = parseInt(startDateParts[0], 10);
      const startMonthIndex = monthNames.indexOf(startDateParts[1]);
      const startYear = parseInt(startDateParts[2], 10);

      const startDate = new Date(startYear, startMonthIndex, startDay);
      startDate.setHours(0, 0, 0, 0);

      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(startDate.getDate() + 15);

      if (selectedDate < startDate || selectedDate > maxEndDate) {
        return;
      }
    }

    setday(day.day);
    setSelecte(day.dateString);
  };



  return (
    <ScrollView style={{ backgroundColor: isDark ? appColors.bgDark : appColors.lightGray }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={[styles.backBtn, {
        backgroundColor: bgContainer,
        borderColor: isDark ? appColors.darkBorder : appColors.border,
      }]} onPress={goBack} activeOpacity={0.7}
      >
        <Back />
      </TouchableOpacity>
      <View style={[styles.header]}>
        <Text style={[styles.headerTitle, { color: textColorStyle }]}>{translateData?.dateTimeSchedule}</Text>
      </View>
      <View style={[styles.banner, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }]}>
        <Text style={[styles.bannerTitle, { color: textColorStyle }]}>{translateData?.timeNote} </Text>
        <Text style={[styles.bannerTitle, { color: textColorStyle }]}>{translateData?.pickedUp}</Text>
      </View>
      <View style={[styles.lineContainer, { flexDirection: viewRTLStyle }]}>
        <Image source={Images.line2} style={styles.line2} />
        <Image source={Images.line2} style={styles.line2} />
      </View>
      <View style={styles.dateView1}>
        <View style={[styles.subContainer, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor, borderColor: isDark ? appColors.darkPrimary : appColors.border }]}>
          <Text style={[styles.selectDate, { textAlign: textRTLStyle }]}>
            {day} {selectedMonth} {selectedYear}, {hour}:{time}{" "}
            {periods[selectedPeriodIndex]}
          </Text>
        </View>
      </View>

      <View style={[styles.dropdownRow, { flexDirection: viewRTLStyle, zIndex: 3000 }]}>
        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={openMonth}
            value={selectedMonth}
            items={months}
            defaultValue={selectedMonth}
            setOpen={setOpenMonth}
            setValue={setSelectedMonth}
            containerStyle={styles.dropdownContainer}
            style={[styles.dropdown, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor, borderColor: isDark ? appColors.darkPrimary : appColors.border }]}
            zIndex={2}
            placeholder={selectedMonth}
            dropDownContainerStyle={{ backgroundColor: isDark ? appColors.bgDark : appColors.lightGray, borderColor: isDark ? appColors.bgDark : appColors.border, maxHeight: windowHeight(450) }}
            tickIconStyle={{
              tintColor: isDark ? appColors.whiteColor : appColors.blackColor,
            }}
            textStyle={{
              textAlign: isRTL ? "right" : "left",
              color: isDark ? appColors.whiteColor : appColors.blackColor,
            }}
            iconContainerStyle={{
              color: isDark ? appColors.whiteColor : appColors.blackColor,
            }}
            arrowIconStyle={{
              tintColor: isDark ? appColors.whiteColor : appColors.blackColor,
            }}
            placeholderStyle={{
              color: isDark ? appColors.darkText : appColors.regularText,
            }}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              showsVerticalScrollIndicator: false,
              nestedScrollEnabled: true,
            }}
          />
        </View>
        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={openYear}
            value={selectedYear}
            items={years}
            defaultValue={selectedYear}
            setOpen={setOpenYear}
            setValue={setSelectedYear}
            placeholder={currentYear}
            containerStyle={styles.dropdownContainer2}
            onChangeItem={(item: { value: React.SetStateAction<string> }) =>
              setSelectedYear(item.value)
            }
            style={[styles.dropdown, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor, borderColor: isDark ? appColors.darkPrimary : appColors.border }]}
            zIndex={2}
            dropDownContainerStyle={{ backgroundColor: isDark ? appColors.bgDark : appColors.lightGray, borderColor: isDark ? appColors.bgDark : appColors.border }}
            tickIconStyle={{
              tintColor: isDark ? appColors.whiteColor : appColors.blackColor,
            }}
            textStyle={{
              textAlign: isRTL ? "right" : "left",
              color: isDark ? appColors.whiteColor : appColors.blackColor,
            }}
            iconContainerStyle={{
              color: isDark ? appColors.whiteColor : appColors.blackColor,
            }}
            arrowIconStyle={{
              tintColor: isDark ? appColors.whiteColor : appColors.blackColor,
            }}
            placeholderStyle={{
              color: isDark ? appColors.darkText : appColors.regularText,
            }}
          />
        </View>
      </View>

      <View style={styles.calView}>
        <View style={styles.lineContainer1}>
          <LineContainer />
        </View>
        <Calendar
          key={datee + ""}
          style={styles.calendar}
          minDate={fieldValue === 'startTime' ? new Date().toISOString().split("T")[0] : (() => {
            if (!passedStartDate) return new Date().toISOString().split("T")[0];
            const startDateParts = passedStartDate.split(' ');
            const monthNames = [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ];
            const startDay = parseInt(startDateParts[0], 10);
            const startMonthIndex = monthNames.indexOf(startDateParts[1]);
            const startYear = parseInt(startDateParts[2], 10);
            const startDate = new Date(startYear, startMonthIndex, startDay);
            return startDate.toISOString().split("T")[0];
          })()}
          markedDates={{
            [selecte]: {
              selected: true,
              disableTouchEvent: true,
              customStyles: {
                container: {
                  backgroundColor: appColors.primary,
                  borderRadius: windowHeight(5),
                },
              },
            },
            ...(() => {
              const baseDate = fieldValue === 'startTime' ? new Date() : (() => {
                if (!passedStartDate) return new Date();
                const startDateParts = passedStartDate.split(' ');
                const monthNames = [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                const startDay = parseInt(startDateParts[0], 10);
                const startMonthIndex = monthNames.indexOf(startDateParts[1]);
                const startYear = parseInt(startDateParts[2], 10);
                return new Date(startYear, startMonthIndex, startDay);
              })();

              return Array.from({ length: 365 }).reduce((acc, _, i) => {
                const futureDate = new Date(baseDate);
                futureDate.setDate(baseDate.getDate() + 16 + i);
                const dateString = futureDate.toISOString().split("T")[0];

                acc[dateString] = {
                  disabled: true,
                  customStyles: {
                    container: {
                      backgroundColor: appColors.lightGray,
                    },
                    text: {
                      color: appColors.gray,
                    },
                  },
                };
                return acc;
              }, {});
            })(),
          }}
          hideExtraDays={false}
          theme={{
            backgroundColor: appColors.whiteColor,
            calendarBackground: isDark ? appColors.darkPrimary : appColors.whiteColor,
            textSectionTitleColor: appColors.textSectionTitleColor,
            selectedDayBackgroundColor: appColors.selectedDayBackgroundColor,
            selectedDayTextColor: appColors.whiteColor,
            todayTextColor: appColors.todayTextColor,
            dayTextColor: appColors.gray,
            todayBackgroundColor: appColors.whiteColor,
            arrowColor: isDark ? appColors.whiteColor : appColors.blackColor,
            dotColor: appColors.primary,
            monthTextColor: appColors.primary,
            borderColor: isDark ? appColors.bgDark : appColors.border,

            'stylesheet.calendar.header': {
              dayHeader: {
                color: appColors.gray,
                fontSize: fontSizes.FONT16,
                marginTop: windowHeight(3),
                fontFamily: appFonts.medium,
                textTransform: 'uppercase',
              },
            },
          }}
          current={datee}
          onDayPress={onDayPress}
          markingType={"custom"}

          dayComponent={({ date, state, marking, onPress }) => {
            let parent = [];
            let backgroundColor = isDark ? linearColorStyle : appColors.lightGray;
            let color = isDark ? appColors.whiteColor : appColors.blackColor;

            const selectedDate = new Date(date.dateString);

            // Determine the base date and max date based on field type
            const baseDate = fieldValue === 'startTime' ? new Date() : (() => {
              if (!passedStartDate) return new Date();
              const startDateParts = passedStartDate.split(' ');
              const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              const startDay = parseInt(startDateParts[0], 10);
              const startMonthIndex = monthNames.indexOf(startDateParts[1]);
              const startYear = parseInt(startDateParts[2], 10);
              return new Date(startYear, startMonthIndex, startDay);
            })();

            baseDate.setHours(0, 0, 0, 0);
            const maxDate = new Date(baseDate);
            maxDate.setDate(baseDate.getDate() + 15);

            // For rental dates (both pickup and end), show light green for available dates
            const isRentalDate = isRental && (fieldValue === 'startTime' || fieldValue === 'endTime');
            const isWithinRange = selectedDate >= baseDate && selectedDate <= maxDate;

            if (selectedDate > maxDate) {
              if (marking && marking.selected) {
                backgroundColor = 'green';
                color = appColors.whiteColor;
              } else {
                backgroundColor = '';
                color = appColors.gray;
              }
            } else if (isRentalDate && isWithinRange && !marking) {
              // Light green for available rental dates (both pickup and end)
              backgroundColor = appColors.dotLight;
              color = isDark ? appColors.blackColor : appColors.blackColor;
            }

            if (state === "disabled") {
              backgroundColor = isDark ? appColors.darkPrimary : "";
              color = isDark ? appColors.gray : appColors.gray;
            } else if (marking && marking.selected) {
              backgroundColor = appColors.primary;
              color = appColors.whiteColor;
            }

            parent.push(
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onPress(date)}
                style={[styles.dateView, { backgroundColor }]}
              >
                <Text style={[styles.dateText, { color }]}>{date.day}</Text>
              </TouchableOpacity>
            );
            return parent;
          }}
        />
      </View>
      {/*  */}

      <View style={[styles.timeContainer, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor, borderColor: isDark ? appColors.darkPrimary : appColors.border }, { flexDirection: viewRTLStyle }]}>
        <View style={[styles.arrowView2, { flexDirection: viewRTLStyle }]}>
          <TouchableOpacity style={styles.arrowView} onPress={handleDecreaseHour} activeOpacity={0.7}
          >
            <LeftArrow />
          </TouchableOpacity>
          <Text style={styles.time}>{hour}</Text>
          <TouchableOpacity style={styles.arrowView} onPress={handleIncreaseHour} activeOpacity={0.7}
          >
            <RightArrows />
          </TouchableOpacity>
        </View>
        <View style={[styles.line, { borderRightColor: isDark ? appColors.darkBorder : appColors.border }]} />
        <View style={[styles.arrowView1, { flexDirection: viewRTLStyle }]}>
          <TouchableOpacity style={styles.arrowView} onPress={handleDecrease} activeOpacity={0.7}
          >
            <LeftArrow />
          </TouchableOpacity>
          <Text style={styles.time}>{time}</Text>
          <TouchableOpacity style={styles.arrowView} onPress={handleIncrease} activeOpacity={0.7}
          >
            <RightArrows />
          </TouchableOpacity>
        </View>
        <View style={[styles.line, { borderRightColor: isDark ? appColors.darkBorder : appColors.border }]} />
        <View style={[styles.arrowView3, { flexDirection: viewRTLStyle }]}>
          <TouchableOpacity style={styles.arrowView} onPress={handleLeftArrowClick} activeOpacity={0.7}
          >
            <LeftArrow />
          </TouchableOpacity>
          <Text style={[styles.day, { color: textColorStyle }]}>{periods[selectedPeriodIndex]}</Text>
          <TouchableOpacity style={styles.arrowView} onPress={handleRightArrowClick} activeOpacity={0.7}
          >
            <RightArrows />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.btnView}>
        <Button title={translateData?.confirm} onPress={gotoBack} />
      </View>
    </ScrollView>
  );
}





