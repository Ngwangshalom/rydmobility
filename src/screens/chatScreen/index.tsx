import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { commonStyles } from "../../styles/commonStyle";
import { external } from "../../styles/externalStyle";
import { Back, Send, Clip } from "@utils/icons";
import { appColors, windowHeight } from "@src/themes";
import { useValues } from "@src/utils/context/index";
import { styles } from "./styles";
import Images from "@utils/images";
import { useAppNavigation } from "@src/utils/navigation";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { launchImageLibrary } from "react-native-image-picker";
import getEchoInstance from "@src/utils/echo";
import { api } from "@src/api/apiClient";
import { getValue } from "@src/utils/localstorage";
import { URL } from "@src/api/config";

export function ChatScreen() {
  const { goBack } = useAppNavigation();
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { driverId, riderId, rideId, driverName, driverImage, from }: any =
    route.params || {};
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    bgFullStyle,
    isDark,
    textRTLStyle,
    textColorStyle,
    viewRTLStyle,
    bgContainer,
  } = useValues();
  const { translateData } = useSelector((state: any) => state.setting);
  const { self } = useSelector((state: any) => state.account);
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  const currentUserId = `${riderId}`;
  const adminId = "1";
  const chatWithUserId = from === "help" ? adminId : `${driverId}`;

  // roomId convention for the backend
  const roomId = from === "help"
    ? [parseInt(adminId), parseInt(currentUserId)].sort((a, b) => a - b).join("_")
    : [parseInt(rideId), parseInt(currentUserId), parseInt(chatWithUserId)].sort((a, b) => a - b).join("_");

  const scrollToBottom = () => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const focusListener = navigation.addListener("focus", () => {
      scrollToBottom();
    });
    return focusListener;
  }, [navigation]);

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  // Real-time Chat Listener
  useEffect(() => {
    if (!roomId || roomId.includes("NaN")) {
      return;
    }

    let echo: any;
    let isMounted = true;

    const setupEcho = async () => {
      try {
        echo = await getEchoInstance();
        if (!isMounted || !echo) return;


        echo.private(`chat.room.${roomId}`)
          .subscribed(() => {
            console.log(" Reverb: Successfully subscribed to private-chat.room." + roomId);
          })
          .error((err: any) => {
            console.log(" Reverb: Subscription error:", err);
          })
          .listen(".chat.message.sent", (e: any) => {
            const data = e.data || e;
            if (data && isMounted) {
              // If the message is from me, skip adding it here because it's already handled in sendMessage
              if (data.sender_id?.toString() === currentUserId) {
                return;
              }
              const newMessage = {
                ...data,
                id: data.id || data.created_at || `msg_${Date.now()}_${Math.random()}`,
              };
              setMessages((prev) => {
                const exists = prev.find((m) => m.id === newMessage.id);
                if (exists) {
                  return prev;
                }
                return [newMessage, ...prev];
              });
            }
          })
          .listen("ChatMessageSent", (e: any) => {
            const data = e.data || e;
            if (data && isMounted) {
              // If the message is from me, skip adding it here because it's already handled in sendMessage
              if (data.sender_id?.toString() === currentUserId) {
                return;
              }
              const newMessage = {
                ...data,
                id: data.id || data.created_at || `msg_${Date.now()}_${Math.random()}`,
              };
              setMessages((prev) => {
                const exists = prev.find((m) => m.id === newMessage.id);
                if (exists) {
                  return prev;
                }
                return [newMessage, ...prev];
              });
            }
          });
      } catch (err) {
        console.log(" Reverb: Error in setupEcho", err);
      }
    };

    setupEcho();

    return () => {
      isMounted = false;
      if (echo) {
        echo.leave(`chat.room.${roomId}`);
      }
    };
  }, [roomId]);

  const fetchMessages = async () => {
    if (!roomId || roomId.includes("NaN")) return;
    try {
      const response = await api.get("chat/messages", {
        params: { room_id: roomId },
      });
      if (response.data?.status && Array.isArray(response.data?.data)) {
        setMessages([...response.data.data].reverse());
      }
    } catch (e) {
      console.log("fetchMessages error", e);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  // Initial Message Fetch
  useEffect(() => {
    fetchMessages();
  }, [roomId]);

  const pickImages = async () => {
    launchImageLibrary({ mediaType: "photo", selectionLimit: 5 }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) return;
      if (response.assets && response.assets.length > 0) {
        setSelectedImages((prev) => [...prev, ...response.assets!]);
      }
    });
  };



  const sendMessage = async () => {
    if (!input.trim() && selectedImages.length === 0) return;

    const token = await getValue("token");
    const messageText = input.trim();
    const imagesToSend = [...selectedImages];

    setInput("");
    setSelectedImages([]);

    try {
      const receiverId = from === "help" ? adminId : driverId;
      const language = await getValue("selectedLanguage");
      const defaultLng = await getValue("defaultLanguage");
      const currentLng = language || defaultLng;

      let body;
      let headers: any = {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept-Lang": currentLng,
      };

      if (imagesToSend.length > 0) {
        const formData = new FormData();
        formData.append("room_id", roomId);
        formData.append("receiver_id", receiverId.toString());

        if (messageText) {
          formData.append("message", messageText);
        }

        imagesToSend.forEach((image, index) => {
          formData.append(`images[${index}]`, {
            uri: Platform.OS === "android" ? image.uri : image.uri.replace("file://", ""),
            type: image.type || "image/jpeg",
            name: image.fileName || `image_${index}.jpg`,
          } as any);
        });
        body = formData;
        // Fetch in RN often needs this explicitly for multipart
        headers["Content-Type"] = "multipart/form-data";
      } else {
        body = JSON.stringify({
          room_id: roomId,
          receiver_id: parseInt(receiverId),
          message: messageText,
        });
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(`${URL}/api/chat/send`, {
        method: "POST",
        body: body,
        headers: headers,
      });

      const responseData = await response.json();

      if (responseData?.status && responseData?.data) {
        const data = responseData.data;
        const newMessage = {
          ...data,
          id: data.id || data.created_at || `msg_send_${Date.now()}`,
        };
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === newMessage.id);
          if (exists) {
            return prev;
          }
          return [newMessage, ...prev];
        });
        scrollToBottom();
      }
    } catch (e) {
      console.log("send error", e);
    }
  };

  return (
    <View style={[commonStyles.flexContainer]}>
      <View
        style={[
          styles.view_Main,
          { backgroundColor: bgFullStyle, flexDirection: viewRTLStyle },
        ]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.backButton,
            { borderColor: isDark ? appColors.darkBorder : appColors.border },
            { backgroundColor: isDark ? bgContainer : appColors.lightGray },
          ]}
          onPress={goBack}>
          <Back />
        </TouchableOpacity>
        <View style={[external.mh_10, external.fg_1]}>
          <Text
            style={[
              styles.templetionStyle,
              { color: textColorStyle, textAlign: textRTLStyle },
            ]}>
            {from == "help" ? "Administrator" : driverName}
          </Text>
          <Text
            style={[
              commonStyles.mediumTextBlack12,
              external.mt_2,
              { color: appColors.primary, textAlign: textRTLStyle },
            ]}>
            {translateData.online}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{
          backgroundColor: isDark ? appColors.primaryText : appColors.lightGray,
          flex: 1,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
      >
        <View
          style={{
            flex: 1,
          }}>
          <FlatList
            ref={flatListRef}
            inverted
            data={messages}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            style={styles.listStyle}
            renderItem={({ item }) => {
              const isMe = item.sender_id?.toString() === currentUserId;
              const timestamp = item.created_at
                ? new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
                : translateData.sending;

              return (
                <View
                  style={[
                    styles.mainView,
                    {
                      flexDirection: isMe ? "row-reverse" : "row",
                    },
                  ]}>
                  {!isMe && (
                    <Image
                      source={
                        driverImage ? { uri: driverImage } : Images.defultImage
                      }
                      style={[styles.imageStyle, { borderColor: appColors.border }]}
                    />
                  )}
                  <View
                    style={[
                      styles.messageContainer,
                      isMe ? styles.senderMessage : styles.receiverMessage,
                    ]}>
                    {item?.message !== "" && (
                      <Text
                        style={[
                          styles.messageText,
                          !isMe
                            ? styles.senderMessageText
                            : styles.receiverMessageText,
                          { textAlign: "left" },
                        ]}>
                        {item.message}
                      </Text>
                    )}
                    {item?.images &&
                      Array.isArray(item?.images) &&
                      item?.images?.length > 0 && (
                        <ScrollView horizontal style={{ marginVertical: 5 }}>
                          {item.images.map((img: any, idx: number) => {
                            const imgUri = typeof img === 'string' ? img : img.url;
                            return (
                              <Image
                                key={idx}
                                source={{ uri: imgUri }}
                                style={{
                                  width: 120,
                                  height: 120,
                                  borderRadius: 8,
                                  marginRight: 5,
                                }}
                              />
                            );
                          })}
                        </ScrollView>
                      )}
                    <Text
                      style={[
                        styles.timeStyle,
                        {
                          color: isMe ? appColors.whiteColor : appColors.gray,
                          textAlign: isMe ? "right" : "left",
                        },
                      ]}>
                      {timestamp}
                    </Text>
                  </View>
                </View>
              );
            }}
            removeClippedSubviews={true}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[appColors.primary]}
                tintColor={appColors.primary}
              />
            }
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}></View>
            }
          />

          {selectedImages?.length > 0 && (
            <ScrollView
              horizontal
              style={{ padding: windowHeight(10), maxHeight: windowHeight(75) }}>
              {selectedImages.map((image, idx) => (
                <Image
                  key={idx}
                  source={{ uri: image.uri }}
                  style={{
                    width: windowHeight(50),
                    height: windowHeight(50),
                    borderRadius: windowHeight(5),
                    margin: windowHeight(5),
                  }}
                />
              ))}
            </ScrollView>
          )}

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark
                  ? appColors.primaryText
                  : appColors.lightGray,
              },
              { flexDirection: viewRTLStyle },
            ]}>
            <View
              style={[
                styles.textInputView,
                { backgroundColor: bgFullStyle, flexDirection: viewRTLStyle },
              ]}>
              <View style={styles.inputView}>
                <TouchableOpacity
                  style={styles.emojiView}
                  activeOpacity={0.7}
                  onPress={pickImages}>
                  <Clip />
                </TouchableOpacity>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.input,
                    { textAlign: textRTLStyle, color: textColorStyle },
                  ]}
                  value={input}
                  onChangeText={setInput}
                  placeholder={translateData.typeHere}
                  multiline
                  placeholderTextColor={appColors.subtitle}
                />
              </View>
              <View style={styles.sendBtnView}>
                {uploading ? (
                  <ActivityIndicator size="small" color={appColors.primary} />
                ) : (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={sendMessage}
                    activeOpacity={0.7}>
                    <Send />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}