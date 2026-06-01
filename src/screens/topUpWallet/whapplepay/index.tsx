import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Clipboard,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Header } from '@src/commonComponent';
import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from '@src/themes';
import { useValues } from '@src/utils/context/index';
import { external } from '@src/styles/externalStyle';
import Images from '@src/utils/images';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { POST_API } from '@src/api/methods';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Skeleton Shimmer ─────────────────────────────────────────────────────────
const Shimmer = ({ width, height, borderRadius = 8, style = {} }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 850, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <Animated.View style={[{ width, height, borderRadius, opacity }, style]} />
  );
};

// ─── Skeleton Screen ──────────────────────────────────────────────────────────
const SkeletonScreen = ({ isDark }) => {
  const bone = isDark ? appColors.darkBorder : appColors.border;
  const cardBg = isDark ? appColors.darkHeader : appColors.whiteColor;

  const Bone = ({ w, h, r = 8, style = {} }) => (
    <Shimmer width={w} height={h} borderRadius={r} style={[{ backgroundColor: bone }, style]} />
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero skeleton */}
      <View style={[sk.heroCard, { backgroundColor: bone }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Bone w={56} h={56} r={16} />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Bone w={130} h={17} r={6} />
            <Bone w={180} h={12} r={5} style={{ marginTop: 8 }} />
          </View>
        </View>
        <Bone w={170} h={26} r={13} style={{ marginTop: 16 }} />
      </View>

      {/* Amount card skeleton */}
      <View style={[sk.card, { backgroundColor: cardBg, borderColor: bone }]}>
        <Bone w={110} h={12} r={4} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 10 }}>
          <Bone w={32} h={26} r={6} />
          <Bone w={160} h={40} r={8} />
        </View>
      </View>

      {/* Details card skeleton */}
      <View style={[sk.card, { backgroundColor: cardBg, borderColor: bone }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <Bone w={170} h={16} r={5} />
          <Bone w={68} h={26} r={13} />
        </View>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={[sk.row, { borderBottomColor: bone }]}>
            <Bone w={38} h={38} r={19} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Bone w={80} h={11} r={4} />
              <Bone w={140} h={16} r={5} style={{ marginTop: 6 }} />
            </View>
            {i !== 3 && <Bone w={60} h={30} r={9} />}
          </View>
        ))}
      </View>

      {/* Steps skeleton */}
      <View style={[sk.card, { backgroundColor: cardBg, borderColor: bone }]}>
        <Bone w={210} h={15} r={5} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={[sk.stepBox, { backgroundColor: bone, borderColor: bone }]}>
              <Bone w={30} h={30} r={15} style={{ alignSelf: 'center' }} />
              <Bone w={70} h={11} r={4} style={{ alignSelf: 'center', marginTop: 10 }} />
              <Bone w={52} h={11} r={4} style={{ alignSelf: 'center', marginTop: 4 }} />
            </View>
          ))}
        </View>
      </View>

      {/* Notes skeleton */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[1, 2].map(i => (
          <View key={i} style={[sk.noteBox, { backgroundColor: cardBg, borderColor: bone }]}>
            <Bone w={28} h={28} r={14} style={{ alignSelf: 'center' }} />
            <Bone w={80} h={11} r={4} style={{ alignSelf: 'center', marginTop: 8 }} />
            <Bone w={55} h={11} r={4} style={{ alignSelf: 'center', marginTop: 4 }} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const sk = StyleSheet.create({
  heroCard: { borderRadius: 20, padding: 20, marginBottom: 14 },
  card: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 14 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, borderBottomWidth: 1,
  },
  stepBox: {
    width: (SCREEN_WIDTH - 60) / 2,
    borderRadius: 12, borderWidth: 1, padding: 14,
  },
  noteBox: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WhapplePayScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { paymentData } = route.params || {};
  const { isDark, textColorStyle } = useValues();
  const { translateData } = useSelector(state => state.setting);
  const { zoneValue } = useSelector((state: any) => state.zone);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [showProcessingSheet, setShowProcessingSheet] = useState(false);

  const bottomSheetRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const MIN_AMOUNT = 500;

  useEffect(() => {
    generateAccountNumber();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 55, useNativeDriver: true }),
    ]).start();
  };

  const generateAccountNumber = async () => {
    setIsLoading(true);
    try {
      const response = await POST_API(
        { amount: paymentData?.amount, currency_code: 'XAF', currency_symbol: zoneValue?.currency_symbol },
        'whapplepay/generate-account'
      );
      if (response.data?.success) {
        setAccountDetails(response.data.data);
        animateIn();
      } else {
        throw new Error(response.data?.message || 'Failed to generate account details');
      }
    } catch (error: any) {
      Alert.alert(
        'Account Generation Failed',
        "We couldn't generate your account number. Please try again later.",
        [{ text: 'OK', onPress: () => navigation.goBack() }],
        { cancelable: false }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    await Clipboard.setString(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePaymentConfirmed = () => {
    if (paymentData?.amount < MIN_AMOUNT) {
      Alert.alert(
        translateData.minimumAmount || 'Minimum Amount',
        (translateData.minimumAmountMessage || 'Minimum deposit amount is :currency_symbol:min_amount')
          .replace(':currency_symbol', paymentData?.currency_symbol || '')
          .replace(':min_amount', MIN_AMOUNT)
      );
      return;
    }
    setShowProcessingSheet(true);
    bottomSheetRef.current?.expand();
  };

  const simulatePaymentProcessing = async () => {
    setIsProcessing(true);
    try {
      const response = await POST_API(
        {
          amount: paymentData?.amount,
          currency: paymentData?.currency,
          accountNumber: accountDetails?.accountNumber,
          reference: accountDetails?.reference,
        },
        'verify-payment'
      );
      if (response.data?.success) {
        setIsProcessing(false);
        Alert.alert(
          translateData.paymentSuccess || 'Payment Successful',
          translateData.paymentVerifiedMessage || 'Your payment has been verified successfully.',
          [{
            text: translateData.ok || 'OK',
            onPress: () => {
              bottomSheetRef.current?.close();
              setShowProcessingSheet(false);
              navigation.navigate('PaymentSuccess', { paymentData, transactionId: response.data.transactionId });
            },
          }]
        );
      } else {
        throw new Error(response.data?.message || 'Payment verification failed');
      }
    } catch {
      setTimeout(() => {
        setIsProcessing(false);
        Alert.alert(
          translateData.paymentPending || 'Payment Pending',
          translateData.paymentVerificationMessage || 'Your payment is being verified. You will receive a notification once completed.',
          [{
            text: translateData.ok || 'OK',
            onPress: () => {
              bottomSheetRef.current?.close();
              setShowProcessingSheet(false);
            },
          }]
        );
      }, 4000);
    }
  };

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" opacity={0.5} />
    ),
    []
  );

  const isAmountValid = paymentData?.amount >= MIN_AMOUNT;
  const cardBg = isDark ? appColors.darkHeader : appColors.whiteColor;
  const borderCol = isDark ? appColors.darkBorder : appColors.border;

  const detailRows = [
    { icon: '🔢', label: translateData.accountNumber || 'Account Number', value: accountDetails?.accountNumber, field: 'account' },
    { icon: '👤', label: translateData.accountName || 'Account Name', value: accountDetails?.accountName, field: 'name' },
    { icon: '🏛️', label: translateData.bankName || 'Bank Name', value: accountDetails?.bankName },
    { icon: '📋', label: translateData.reference || 'Reference', value: accountDetails?.reference, field: 'reference' },
  ];

  const ProcessingBottomSheet = () => (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['46%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: cardBg }}
      handleIndicatorStyle={{ backgroundColor: appColors.primary, width: 40 }}
    >
      <BottomSheetView style={s.sheetContent}>
        <View style={[s.sheetIconWrap, { backgroundColor: appColors.primary + '18' }]}>
          <ActivityIndicator size="large" color={appColors.primary} />
        </View>
        <Text style={[s.sheetTitle, { color: textColorStyle }]}>
          {translateData.verifyingPayment || 'Verifying Payment'}
        </Text>
        <Text style={[s.sheetSub, { color: appColors.regularText }]}>
          {translateData.confirmingDepositDetails || 'We are confirming your deposit details'}
        </Text>

        <View style={s.sheetSteps}>
          {[
            { num: '✓', label: translateData.paymentInitiated || 'Payment initiated', done: true, active: false },
            { num: '2', label: translateData.verifyingFunds || 'Verifying funds', done: false, active: true },
            { num: '3', label: translateData.completingDeposit || 'Completing deposit', done: false, active: false },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <View style={s.sheetStepRow}>
                <View style={[
                  s.sheetStepDot,
                  {
                    backgroundColor:
                      step.done ? appColors.success :
                      step.active && isProcessing ? appColors.primary :
                      isDark ? appColors.bgDark : appColors.border,
                  },
                ]}>
                  {step.active && isProcessing
                    ? <ActivityIndicator size="small" color={appColors.whiteColor} />
                    : <Text style={s.sheetStepDotText}>{step.num}</Text>
                  }
                </View>
                <Text style={[s.sheetStepLabel, {
                  color: step.done || (step.active && isProcessing) ? textColorStyle : appColors.regularText,
                }]}>
                  {step.label}
                </Text>
              </View>
              {i < 2 && <View style={[s.sheetStepLine, { backgroundColor: borderCol }]} />}
            </React.Fragment>
          ))}
        </View>

        {!isProcessing && (
          <TouchableOpacity
            style={[s.sheetConfirmBtn, { backgroundColor: appColors.primary }]}
            onPress={simulatePaymentProcessing}
            activeOpacity={0.85}
          >
            <Text style={s.sheetConfirmBtnText}>
              {translateData.startVerification || 'Start Verification'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={s.sheetCancelBtn}
          onPress={() => { bottomSheetRef.current?.close(); setShowProcessingSheet(false); }}
        >
          <Text style={[s.sheetCancelText, { color: appColors.regularText }]}>
            {translateData.cancel || 'Cancel'}
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );

  return (
    <View style={[external.fx_1, { backgroundColor: isDark ? appColors.bgDark : appColors.whiteColor }]}>
      <Header
        value={translateData.whapplePay || 'WhapplePay'}
        onBackPress={() => navigation.goBack()}
      />

      {/* ── Skeleton / Content ───────────────────────────────── */}
      {isLoading ? (
        <SkeletonScreen isDark={isDark} />
      ) : (
        <Animated.ScrollView
          style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero Banner ─────────────────────────────────── */}
          <View style={[s.heroCard, { backgroundColor: appColors.primary }]}>
            <View style={s.heroBubble1} />
            <View style={s.heroBubble2} />
            <View style={s.heroRow}>
              <View style={s.heroLogoWrap}>
                <Image
                  source={{ uri: 'https://www.f6s.com/content-resource/media/6016574_2476f6e757c31d9c7c9250722109f954239d529d.webp' }}
                  style={s.heroLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.heroTitle}>
                  {translateData.quickDeposit || 'Quick Deposit'}
                </Text>
                <Text style={s.heroSub}>
                  {translateData.sendMoneyToAccount || 'Send money to the account below'}
                </Text>
              </View>
            </View>
            <View style={s.heroSecurePill}>
              <View style={s.heroSecureDot} />
              <Text style={s.heroSecureText}>Secure · Encrypted Transfer</Text>
            </View>
          </View>

          {/* ── Amount Card ──────────────────────────────────── */}
          <View style={[s.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <Text style={[s.cardMiniLabel, { color: appColors.regularText }]}>
              {translateData.depositAmount || 'Deposit Amount'}
            </Text>
            <View style={s.amountRow}>
              <Text style={[s.amountCurrency, { color: appColors.primary }]}>
                {paymentData?.currency_symbol}
              </Text>
              <Text style={[s.amountFigure, { color: appColors.primary }]}>
                {Number(paymentData?.amount || 0).toLocaleString()}
              </Text>
            </View>
            {!isAmountValid && (
              <View style={[s.warningBadge, { backgroundColor: appColors.warning + '18', borderColor: appColors.warning + '40' }]}>
                <Text style={{ fontSize: 13, color: appColors.warning, fontWeight: '600' }}>
                  ⚠️  {translateData.minimumDeposit || 'Min.'}{' '}
                  {paymentData?.currency_symbol}{Number(MIN_AMOUNT).toLocaleString()} required
                </Text>
              </View>
            )}
          </View>

          {/* ── Bank Details ─────────────────────────────────── */}
          <View style={[s.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <View style={s.cardHeadRow}>
              <Text style={[s.cardTitle, { color: textColorStyle }]}>
                🏦 {translateData.bankTransferDetails || 'Bank Transfer Details'}
              </Text>
              <View style={[s.lockPill, { backgroundColor: appColors.success + '18', borderColor: appColors.success + '40' }]}>
                <Text style={[s.lockPillText, { color: appColors.readyText }]}>🔒 Secure</Text>
              </View>
            </View>

            {detailRows.map((item, i) => (
              <View
                key={i}
                style={[
                  s.detailRow,
                  i < detailRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderCol },
                ]}
              >
                <View style={[s.detailIconCircle, { backgroundColor: isDark ? appColors.bgDark : appColors.primary + '10' }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[s.detailLabel, { color: appColors.regularText }]}>{item.label}</Text>
                  <Text style={[s.detailValue, { color: textColorStyle }]} numberOfLines={1}>
                    {item.value || '—'}
                  </Text>
                </View>
                {item.field && (
                  <TouchableOpacity
                    style={[
                      s.copyBtn,
                      {
                        backgroundColor: copiedField === item.field ? appColors.success : appColors.primary + '15',
                        borderColor: copiedField === item.field ? appColors.success : appColors.primary + '40',
                      },
                    ]}
                    onPress={() => copyToClipboard(item.value, item.field)}
                    activeOpacity={0.75}
                  >
                    <Text style={[
                      s.copyBtnText,
                      { color: copiedField === item.field ? appColors.whiteColor : appColors.primary },
                    ]}>
                      {copiedField === item.field
                        ? '✓ ' + (translateData.copied || 'Copied')
                        : (translateData.copy || 'Copy')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* ── Steps ────────────────────────────────────────── */}
          <View style={[s.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <Text style={[s.cardTitle, { color: textColorStyle, marginBottom: 16 }]}>
              📝 {translateData.howToCompleteDeposit || 'How to Complete Your Deposits'}
            </Text>
            <View style={s.stepsGrid}>
              {[
                { num: '1', text: translateData.step1 || 'Open your banking app' },
                { num: '2', text: translateData.step2 || 'Transfer the exact amount' },
                {
                  num: '3',
                  text: (translateData.step3 || 'Use the reference above').replace(':reference', accountDetails?.reference),
                },
                { num: '4', text: translateData.step4 || 'Return & confirm payment' },
              ].map((step, i) => (
                <View
                  key={i}
                  style={[
                    s.stepBox,
                    {
                      backgroundColor: isDark ? appColors.bgDark : appColors.primary + '08',
                      borderColor: appColors.primary + '25',
                    },
                  ]}
                >
                  <View style={[s.stepNumBubble, { backgroundColor: appColors.primary }]}>
                    <Text style={s.stepNum}>{step.num}</Text>
                  </View>
                  <Text style={[s.stepText, { color: textColorStyle }]}>{step.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Notes ────────────────────────────────────────── */}
          <View style={s.notesRow}>
            <View style={[s.noteCard, { backgroundColor: cardBg, borderColor: borderCol, borderLeftColor: appColors.warning }]}>
              <Text style={s.noteEmoji}>⏰</Text>
              <Text style={[s.noteText, { color: textColorStyle }]}>
                {(translateData.transferExpires || 'Expires in :hours hrs').replace(':hours', accountDetails?.expiresIn)}
              </Text>
            </View>
            <View style={[s.noteCard, { backgroundColor: cardBg, borderColor: borderCol, borderLeftColor: appColors.primary }]}>
              <Text style={s.noteEmoji}>💰</Text>
              <Text style={[s.noteText, { color: textColorStyle }]}>
                {translateData.transferExactAmount || 'Transfer the exact amount shown'}
              </Text>
            </View>
          </View>
        </Animated.ScrollView>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
      {!isLoading && (
        <View style={[s.footer, { backgroundColor: cardBg, borderTopColor: borderCol }]}>
          <TouchableOpacity
            style={[s.mainBtn, { backgroundColor: isAmountValid ? appColors.primary : appColors.gray }]}
            onPress={handlePaymentConfirmed}
            disabled={!isAmountValid}
            activeOpacity={0.85}
          >
            <Text style={s.mainBtnText}>
              💳  {translateData.iveSentMoney || "I've Sent the Money"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={[s.cancelBtnText, { color: appColors.regularText }]}>
              {translateData.cancelDeposit || 'Cancel Deposit'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showProcessingSheet && <ProcessingBottomSheet />}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Hero
  heroCard: {
    borderRadius: 20, padding: 20,
    marginBottom: 14, overflow: 'hidden',
  },
  heroBubble1: {
    position: 'absolute', top: -40, right: -40,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroBubble2: {
    position: 'absolute', bottom: -30, left: 30,
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroLogoWrap: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroLogo: { width: 38, height: 38 },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 3 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 18 },
  heroSecurePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    marginTop: 14, gap: 6,
  },
  heroSecureDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  heroSecureText: { fontSize: 11.5, color: '#fff', fontWeight: '600' },

  // Card base
  card: {
    borderRadius: 16, borderWidth: 1,
    padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  cardMiniLabel: {
    fontSize: 11, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6,
  },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  amountCurrency: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  amountFigure: { fontSize: 36, fontWeight: '800', letterSpacing: -0.5 },
  warningBadge: {
    marginTop: 10, borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start',
  },
  cardHeadRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  cardTitle: { fontSize: 14.5, fontWeight: '700' },
  lockPill: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  lockPillText: { fontSize: 11, fontWeight: '600' },

  // Detail Row
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  detailIconCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 11, fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2,
  },
  detailValue: { fontSize: 15, fontWeight: '600' },
  copyBtn: {
    borderRadius: 9, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 7,
    minWidth: 72, alignItems: 'center',
  },
  copyBtnText: { fontSize: 12, fontWeight: '700' },

  // Steps
  stepsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  stepBox: {
    width: (SCREEN_WIDTH - 100) / 2,
    borderRadius: 12, borderWidth: 1,
    padding: 14, alignItems: 'center',
  },
  stepNumBubble: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  stepNum: { fontSize: 13, fontWeight: '800', color: '#fff' },
  stepText: { fontSize: 12, textAlign: 'center', lineHeight: 17 },

  // Notes
  notesRow: { flexDirection: 'row', gap: 10 },
  noteCard: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    borderLeftWidth: 3, padding: 12, alignItems: 'center',
  },
  noteEmoji: { fontSize: 20, marginBottom: 6 },
  noteText: { fontSize: 12, textAlign: 'center', lineHeight: 17 },

  // Footer
  footer: {
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1, gap: 10,
  },
  mainBtn: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.18, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8, elevation: 4,
  },
  mainBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelBtnText: { fontSize: 14, fontWeight: '500' },

  // Bottom Sheet
  sheetContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 32, alignItems: 'center' },
  sheetIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  sheetTitle: { fontSize: 19, fontWeight: '800', marginBottom: 4 },
  sheetSub: { fontSize: 13, marginBottom: 24, textAlign: 'center' },
  sheetSteps: { width: '100%', marginBottom: 24 },
  sheetStepRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 2 },
  sheetStepLine: { width: 2, height: 18, marginLeft: 17 },
  sheetStepDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetStepDotText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  sheetStepLabel: { fontSize: 14, fontWeight: '500' },
  sheetConfirmBtn: {
    width: '100%', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 10,
  },
  sheetConfirmBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  sheetCancelBtn: { paddingVertical: 8, alignItems: 'center' },
  sheetCancelText: { fontSize: 14, fontWeight: '500' },
});