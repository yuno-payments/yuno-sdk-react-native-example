/**
 * Main application screen
 */

import React, {useState, useCallback, useEffect} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity, BackHandler} from 'react-native';
import {YunoPaymentMethods, YunoSdk} from '@yuno/yuno-sdk-react-native';
import type {PaymentMethodSelectedEvent, PaymentMethodErrorEvent} from '@yuno/yuno-sdk-react-native';
import {useYunoSDK, useTheme} from '../hooks';
import {
  ConfigForm,
  PaymentActions,
  EnrollmentActions,
  OTTDisplay,
  StatusDisplay,
} from '../components';
import {spacing, typography} from '../theme';
import {useTranslation} from '../i18n';
import type {
  PaymentConfig,
  PaymentLiteConfig,
  EnrollmentConfig,
} from '../types';

interface HomeScreenProps {
  initialCountryCode?: string;
  initialConfigJson?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  initialCountryCode,
  initialConfigJson,
}) => {
  const t = useTranslation();
  const {colors} = useTheme();
  const styles = createStyles(colors);

  // Local state for configuration
  const [countryCode, setCountryCode] = useState('CO');
  const [customerSession, setCustomerSession] = useState('');
  const [checkoutSession, setCheckoutSession] = useState('');
  const [paymentMethodType, setPaymentMethodType] = useState('CARD');
  const [vaultedToken, setVaultedToken] = useState('');
  const [showPaymentStatus, setShowPaymentStatus] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] = useState(false);

  // Process initial configuration from native JSON
  useEffect(() => {
    if (initialCountryCode) {
      console.log('🌍 Setting country code from native:', initialCountryCode);
      setCountryCode(initialCountryCode);
    }

    if (initialConfigJson) {
      try {
        console.log('📋 Parsing config JSON from native...');
        const config = JSON.parse(initialConfigJson);
        
        // Extract showPaymentStatus from JSON
        if (config.options && typeof config.options.showPaymentStatus === 'boolean') {
          console.log('✅ Setting showPaymentStatus from JSON:', config.options.showPaymentStatus);
          setShowPaymentStatus(config.options.showPaymentStatus);
        }

        // Log to confirm we have the data
        console.log('📦 Parsed config:', {
          country: config.country,
          language: config.language,
          showPaymentStatus: config.options?.showPaymentStatus,
          cardType: config.options?.cardType,
          savedCardEnable: config.options?.savedCardEnable,
        });
      } catch (error) {
        console.error('❌ Error parsing config JSON:', error);
      }
    }
  }, [initialCountryCode, initialConfigJson]);

  // SDK Hook
  const {
    isLoading,
    paymentStatus,
    enrollmentStatus,
    ottToken,
    ottTokenInfo,
    startPayment,
    startPaymentLite,
    enrollmentPayment,
    startPaymentSeamlessLite,
    continuePayment,
    clearOTT,
    clearPaymentStatus,
    clearEnrollmentStatus,
  } = useYunoSDK(countryCode, initialConfigJson);

  // Effect to return to main view when payment flow finishes
  useEffect(() => {
    // If we're showing payment methods AND we receive a status or token, return to main view
    if (showPaymentMethods && (paymentStatus || ottToken)) {
      console.log('✅ Payment flow completed, returning to main view');
      console.log('📊 Payment Status:', paymentStatus || 'N/A');
      console.log('🎫 OTT Token:', ottToken || 'N/A');
      
      // Small delay to ensure native SDK has fully finished
      setTimeout(() => {
        setShowPaymentMethods(false);
        setIsPaymentMethodSelected(false);
      }, 300);
    }
  }, [showPaymentMethods, paymentStatus, ottToken]);

  // Handle Android "back" button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // If we're showing payment methods, return to main view
        if (showPaymentMethods) {
          console.log('🔙 Back button pressed - Returning to main view');
          setShowPaymentMethods(false);
          setIsPaymentMethodSelected(false);
          return true; // Prevent default behavior (close activity)
        }
        
        // Otherwise, allow default behavior (go to MainActivity)
        console.log('🔙 Back button pressed - Going to previous activity');
        return false;
      },
    );

    // Cleanup: remove listener when component unmounts
    return () => backHandler.remove();
  }, [showPaymentMethods]);

  // Required fields validation
  const validateRequiredFields = useCallback(
    (requireCheckout: boolean = true): boolean => {
      if (!customerSession.trim()) {
        return false;
      }
      if (requireCheckout && !checkoutSession.trim()) {
        return false;
      }
      return true;
    },
    [customerSession, checkoutSession],
  );

  // Handlers
  const handleStartPayment = useCallback(() => {
    console.log('🔵 handleStartPayment called - Showing Payment Methods');
    console.log('📋 checkoutSession:', checkoutSession || '(empty)');
    
    // Payment only requires checkoutSession
    if (!checkoutSession.trim()) {
      Alert.alert(t.payment.requiredFields, `${t.payment.pleaseEnter}: ${t.config.checkoutSession}`);
      return;
    }

    // Clear old payment status to prevent useEffect from closing the modal with stale status
    clearPaymentStatus();
    clearEnrollmentStatus();

    console.log('✅ Showing payment methods component');
    setShowPaymentMethods(true);
  }, [checkoutSession, t, clearPaymentStatus, clearEnrollmentStatus]);

  const handleStartPaymentLite = useCallback(() => {
    console.log('🔵 handleStartPaymentLite called');
    console.log('📋 checkoutSession:', checkoutSession || '(empty)');
    console.log('📋 paymentMethodType:', paymentMethodType || '(empty)');
    
    // Payment Lite requires checkoutSession + paymentMethodType
    const missingFields = [];
    if (!checkoutSession.trim()) missingFields.push(t.config.checkoutSession);
    if (!paymentMethodType.trim()) missingFields.push(t.config.paymentMethodType);
    
    if (missingFields.length > 0) {
      Alert.alert(
        t.payment.requiredFields,
        `${t.payment.pleaseEnter}: ${missingFields.join(', ')}`,
      );
      return;
    }

    const config: PaymentLiteConfig = {
      checkoutSession,
      countryCode,
      paymentMethodType,
      vaultedToken: vaultedToken || undefined,
      showPaymentStatus,
    };

    console.log('✅ Calling startPaymentLite with config:', config);
    startPaymentLite(config);
  }, [
    checkoutSession,
    countryCode,
    paymentMethodType,
    vaultedToken,
    showPaymentStatus,
    startPaymentLite,
    t,
  ]);

  const handleEnrollment = useCallback(() => {
    console.log('🔵 handleEnrollment called');
    console.log('📋 customerSession:', customerSession || '(empty)');
    console.log('📋 showPaymentStatus (state):', showPaymentStatus);
    console.log('📋 showPaymentStatus (typeof):', typeof showPaymentStatus);
    
    // Enrollment only requires customerSession
    if (!customerSession.trim()) {
      Alert.alert(t.enrollment.requiredFields, `${t.enrollment.pleaseEnter}: ${t.config.customerSession}`);
      return;
    }

    const config: EnrollmentConfig = {
      customerSession,
      countryCode,
      showPaymentStatus, // Reuse showPaymentStatus from JSON
    };

    console.log('✅ Calling enrollmentPayment with config:', JSON.stringify(config, null, 2));
    enrollmentPayment(config);
  }, [customerSession, countryCode, showPaymentStatus, enrollmentPayment, t]);

  const handleSeamlessPayment = useCallback(() => {
    console.log('🔵 handleSeamlessPayment called');
    console.log('📋 checkoutSession:', checkoutSession || '(empty)');
    console.log('📋 paymentMethodType:', paymentMethodType || '(empty)');
    
    // Seamless Payment requires checkoutSession + paymentMethodType
    const missingFields = [];
    if (!checkoutSession.trim()) missingFields.push(t.config.checkoutSession);
    if (!paymentMethodType.trim()) missingFields.push(t.config.paymentMethodType);
    
    if (missingFields.length > 0) {
      Alert.alert(
        t.payment.requiredFields,
        `${t.payment.pleaseEnter}: ${missingFields.join(', ')}`,
      );
      return;
    }

    const config: PaymentLiteConfig = {
      checkoutSession,
      countryCode,
      paymentMethodType,
      vaultedToken: vaultedToken || undefined,
      showPaymentStatus,
    };

    console.log('✅ Calling startPaymentSeamlessLite with config:', config);
    startPaymentSeamlessLite(config);
  }, [
    checkoutSession,
    countryCode,
    paymentMethodType,
    vaultedToken,
    showPaymentStatus,
    startPaymentSeamlessLite,
    t,
  ]);

  const handleContinuePayment = useCallback(() => {
    continuePayment(checkoutSession, countryCode, showPaymentStatus);
  }, [checkoutSession, countryCode, showPaymentStatus, continuePayment]);

  // Handler for when a payment method is selected
  const handlePaymentMethodSelected = useCallback(
    (event: PaymentMethodSelectedEvent) => {
      console.log('💳 Payment method selected:', event);
      setIsPaymentMethodSelected(event.isSelected);
    },
    []
  );

  // Handler for errors in payment methods component
  const handlePaymentMethodError = useCallback((event: PaymentMethodErrorEvent) => {
    console.error('❌ Payment method error:', event);
    Alert.alert('Error', `Could not load payment methods: ${event.message}`, [
      {text: 'OK'},
    ]);
  }, []);

  // Handler to go back from payment methods component
  const handleBackFromPaymentMethods = useCallback(() => {
    console.log('🔙 Going back from payment methods');
    setShowPaymentMethods(false);
    setIsPaymentMethodSelected(false);
  }, []);

  // Handler for "Pay" button (Payment Full Flow)
  const handlePayButtonPress = useCallback(() => {
    console.log('🔵 handlePayButtonPress called (Payment Full)');
    console.log('📋 checkoutSession:', checkoutSession);
    console.log('📋 countryCode:', countryCode);
    console.log('📋 showPaymentStatus:', showPaymentStatus);

    // No need to validate because it was already validated when showing the list
    const config: PaymentConfig = {
      checkoutSession,
      countryCode,
      showPaymentStatus,
    };

    console.log('✅ Calling startPayment with config:', config);
    startPayment(config);
  }, [checkoutSession, countryCode, showPaymentStatus, startPayment]);

  // If payment methods are being shown, render the component
  if (showPaymentMethods) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t.paymentMethods.title}</Text>
          <Text style={styles.subtitle}>{t.paymentMethods.subtitle}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>{t.paymentMethods.checkoutSession}:</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {checkoutSession}
          </Text>
          <Text style={styles.infoLabel}>{t.paymentMethods.country}:</Text>
          <Text style={styles.infoValue}>{countryCode}</Text>
        </View>

        {/* Flex container that takes all available space */}
        <View style={styles.paymentMethodsWrapper}>
          <YunoPaymentMethods
            testID="yuno-payment-methods-view"
            checkoutSession={checkoutSession}
            countryCode={countryCode}
            onPaymentMethodSelected={handlePaymentMethodSelected}
            onPaymentMethodError={handlePaymentMethodError}
            style={styles.paymentMethods}
          />
        </View>

        {isPaymentMethodSelected && (
          <TouchableOpacity
            testID="button-pay"
            style={styles.payButton}
            onPress={handlePayButtonPress}
            activeOpacity={0.7}>
            <Text style={styles.payButtonText}>{t.paymentMethods.payButton}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          testID="button-back"
          style={styles.backButton}
          onPress={handleBackFromPaymentMethods}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>{t.paymentMethods.backButton}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Normal form view
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.app.title}</Text>
        <Text style={styles.subtitle}>{t.app.subtitle}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
          <OTTDisplay
          token={ottToken}
          tokenInfo={ottTokenInfo}
          checkoutSession={checkoutSession}
          onContinuePayment={handleContinuePayment}
          onClear={clearOTT}
          loading={isLoading}
        />

        <StatusDisplay
          paymentStatus={paymentStatus}
          enrollmentStatus={enrollmentStatus}
        />
        <ConfigForm
          customerSession={customerSession}
          checkoutSession={checkoutSession}
          paymentMethodType={paymentMethodType}
          vaultedToken={vaultedToken}
          onCustomerSessionChange={setCustomerSession}
          onCheckoutSessionChange={setCheckoutSession}
          onPaymentMethodTypeChange={setPaymentMethodType}
          onVaultedTokenChange={setVaultedToken}
        />

        <PaymentActions
          onStartPayment={handleStartPayment}
          onStartPaymentLite={handleStartPaymentLite}
          onSeamlessPayment={handleSeamlessPayment}
          loading={isLoading}
        />

        <EnrollmentActions
          onEnrollment={handleEnrollment}
          loading={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.headerBackground,  // White in light, black in dark
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.headerText,                  // Black in light, white in dark
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.headerText,                  // Black in light, white in dark
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  infoContainer: {
    backgroundColor: colors.card,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.elevation,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  paymentMethodsWrapper: {
    flex: 1,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
  },
  paymentMethods: {
    flex: 1,
  },
  payButton: {
    backgroundColor: colors.text,      // neutralB (black in light, white in dark)
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.elevation,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textInverse,         // neutralW (white in light, black in dark)
  },
  backButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.elevation,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,                // neutralB (black in light, white in dark)
  },
});

