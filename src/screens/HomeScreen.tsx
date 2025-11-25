/**
 * Pantalla principal de la aplicación
 */

import React, {useState, useCallback} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useYunoSDK} from '../hooks';
import {
  ConfigForm,
  PaymentActions,
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
    if (!validateRequiredFields()) {
      return;
    }

    const config: PaymentConfig = {
      customerSession,
      checkoutSession,
      countryCode,
    };

    startPayment(config);
  }, [customerSession, checkoutSession, countryCode, startPayment, validateRequiredFields]);

  const handleStartPaymentLite = useCallback(() => {
    if (!validateRequiredFields()) {
      return;
    }

    const config: PaymentLiteConfig = {
      customerSession,
      checkoutSession,
      countryCode,
      paymentMethodType,
      vaultedToken: vaultedToken || undefined,
    };

    startPaymentLite(config);
  }, [
    customerSession,
    checkoutSession,
    countryCode,
    paymentMethodType,
    vaultedToken,
    startPaymentLite,
    validateRequiredFields,
  ]);

  const handleEnrollment = useCallback(() => {
    if (!validateRequiredFields(false)) {
      return;
    }

    const config: EnrollmentConfig = {
      customerSession,
      countryCode,
    };

    enrollmentPayment(config);
  }, [customerSession, countryCode, enrollmentPayment, validateRequiredFields]);

  const handleSeamlessPayment = useCallback(() => {
    if (!validateRequiredFields()) {
      return;
    }

    const config: PaymentLiteConfig = {
      customerSession,
      checkoutSession,
      countryCode,
      paymentMethodType,
      vaultedToken: vaultedToken || undefined,
    };

    startPaymentSeamlessLite(config);
  }, [
    customerSession,
    checkoutSession,
    countryCode,
    paymentMethodType,
    vaultedToken,
    startPaymentSeamlessLite,
    validateRequiredFields,
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
          onEnrollment={handleEnrollment}
          onSeamlessPayment={handleSeamlessPayment}
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

