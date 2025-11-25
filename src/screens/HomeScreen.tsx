/**
 * Pantalla principal de la aplicación
 */

import React, {useState, useCallback} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View, Alert} from 'react-native';
import {useYunoSDK} from '../hooks';
import {
  ConfigForm,
  PaymentActions,
  EnrollmentActions,
  OTTDisplay,
  StatusDisplay,
} from '../components';
import {colors, spacing, typography} from '../theme';
import type {
  PaymentConfig,
  PaymentLiteConfig,
  EnrollmentConfig,
} from '../types';

export const HomeScreen: React.FC = () => {
  // Estado local para configuración
  const [countryCode] = useState('CO');
  const [customerSession, setCustomerSession] = useState('');
  const [checkoutSession, setCheckoutSession] = useState('');
  const [paymentMethodType, setPaymentMethodType] = useState('CARD');
  const [vaultedToken, setVaultedToken] = useState('');

  // Hook del SDK
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
  } = useYunoSDK(countryCode);

  // Validación de campos requeridos
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
    console.log('🔵 handleStartPayment called');
    console.log('📋 checkoutSession:', checkoutSession || '(vacío)');
    
    // Payment solo requiere checkoutSession
    if (!checkoutSession.trim()) {
      Alert.alert('Campo Requerido', 'Por favor ingresa el Checkout Session');
      return;
    }

    const config: PaymentConfig = {
      checkoutSession,
      countryCode,
    };

    console.log('✅ Calling startPayment with config:', config);
    startPayment(config);
  }, [checkoutSession, countryCode, startPayment]);

  const handleStartPaymentLite = useCallback(() => {
    console.log('🔵 handleStartPaymentLite called');
    console.log('📋 checkoutSession:', checkoutSession || '(vacío)');
    console.log('📋 paymentMethodType:', paymentMethodType || '(vacío)');
    
    // Payment Lite requiere checkoutSession + paymentMethodType
    const missingFields = [];
    if (!checkoutSession.trim()) missingFields.push('Checkout Session');
    if (!paymentMethodType.trim()) missingFields.push('Payment Method Type');
    
    if (missingFields.length > 0) {
      Alert.alert(
        'Campos Requeridos',
        `Por favor ingresa: ${missingFields.join(', ')}`,
      );
      return;
    }

    const config: PaymentLiteConfig = {
      checkoutSession,
      countryCode,
      paymentMethodType,
      vaultedToken: vaultedToken || undefined,
    };

    console.log('✅ Calling startPaymentLite with config:', config);
    startPaymentLite(config);
  }, [
    checkoutSession,
    countryCode,
    paymentMethodType,
    vaultedToken,
    startPaymentLite,
  ]);

  const handleEnrollment = useCallback(() => {
    console.log('🔵 handleEnrollment called');
    console.log('📋 customerSession:', customerSession || '(vacío)');
    
    // Enrollment solo requiere customerSession
    if (!customerSession.trim()) {
      Alert.alert('Campo Requerido', 'Por favor ingresa el Customer Session');
      return;
    }

    const config: EnrollmentConfig = {
      customerSession,
      countryCode,
    };

    console.log('✅ Calling enrollmentPayment with config:', config);
    enrollmentPayment(config);
  }, [customerSession, countryCode, enrollmentPayment]);

  const handleSeamlessPayment = useCallback(() => {
    console.log('🔵 handleSeamlessPayment called');
    console.log('📋 checkoutSession:', checkoutSession || '(vacío)');
    console.log('📋 paymentMethodType:', paymentMethodType || '(vacío)');
    
    // Seamless Payment requiere checkoutSession + paymentMethodType
    const missingFields = [];
    if (!checkoutSession.trim()) missingFields.push('Checkout Session');
    if (!paymentMethodType.trim()) missingFields.push('Payment Method Type');
    
    if (missingFields.length > 0) {
      Alert.alert(
        'Campos Requeridos',
        `Por favor ingresa: ${missingFields.join(', ')}`,
      );
      return;
    }

    const config: PaymentLiteConfig = {
      checkoutSession,
      countryCode,
      paymentMethodType,
      vaultedToken: vaultedToken || undefined,
    };

    console.log('✅ Calling startPaymentSeamlessLite with config:', config);
    startPaymentSeamlessLite(config);
  }, [
    checkoutSession,
    countryCode,
    paymentMethodType,
    vaultedToken,
    startPaymentSeamlessLite,
  ]);

  const handleContinuePayment = useCallback(() => {
    continuePayment(checkoutSession);
  }, [checkoutSession, continuePayment]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yuno SDK</Text>
        <Text style={styles.subtitle}>React Native Example</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
});

