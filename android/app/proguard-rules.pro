############################################################
# React Native Core
############################################################
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.defaults.** { *; }

############################################################
# Hermes
############################################################
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

############################################################
# React Native Reanimated / Worklets
############################################################
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }
-dontwarn com.swmansion.reanimated.**

############################################################
# React Native Gesture Handler
############################################################
-keep class com.swmansion.gesturehandler.** { *; }

############################################################
# React Native Screens
############################################################
-keep class com.swmansion.rnscreens.** { *; }

############################################################
# React Native Maps
############################################################
-keep class com.airbnb.android.react.maps.** { *; }
-keep class com.google.android.gms.maps.** { *; }
-keep class com.google.maps.android.** { *; }

############################################################
# Firebase
############################################################
-keep class com.google.firebase.** { *; }
-keep class io.invertase.firebase.** { *; }
-dontwarn com.google.firebase.**

############################################################
# Google Play Services
############################################################
-keep class com.google.android.gms.** { *; }
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.android.gms.internal.** { *; }
-dontwarn com.google.android.gms.**

############################################################
# Google Mobile Ads
############################################################
-keep class com.google.android.gms.ads.** { *; }

############################################################
# Notifee
############################################################
-keep class io.invertase.notifee.** { *; }
-dontwarn io.invertase.notifee.**

############################################################
# React Native SVG
############################################################
-keep class com.horcrux.svg.** { *; }

############################################################
# React Native Linear Gradient
############################################################
-keep class com.BV.LinearGradient.** { *; }

############################################################
# React Native Device Info
############################################################
-keep class com.learnium.RNDeviceInfo.** { *; }

############################################################
# React Native Contacts
############################################################
-keep class com.rt2zz.reactnativecontacts.** { *; }

############################################################
# React Native WebView
############################################################
-keep class com.reactnativecommunity.webview.** { *; }

############################################################
# React Native AsyncStorage
############################################################
-keep class com.reactnativecommunity.asyncstorage.** { *; }

############################################################
# React Native NetInfo
############################################################
-keep class com.reactnativecommunity.netinfo.** { *; }

############################################################
# React Native Android Location Enabler
############################################################
-keep class com.heanoria.library.reactnative.locationenabler.** { *; }

############################################################
# Lottie
############################################################
-keep class com.airbnb.lottie.** { *; }
-dontwarn com.airbnb.lottie.**

############################################################
# React Native Sound
############################################################
-keep class com.zmxv.RNSound.** { *; }

############################################################
# OkHttp / Networking
############################################################
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

############################################################
# Gson
############################################################
-keep class com.google.gson.** { *; }

############################################################
# Kotlin
############################################################
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**

############################################################
# Keep Application Classes
############################################################
-keep class com.taxidouser.webiots.** { *; }

############################################################
# General Android Rules
############################################################
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes EnclosingMethod
-keepattributes InnerClasses

############################################################
# Ignore SSL warnings
############################################################
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**