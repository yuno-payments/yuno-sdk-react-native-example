/**
 * Pantalla principal de la aplicación
 */

import React, {useState, useCallback, useEffect} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity} from 'react-native';
import {YunoPaymentMethods} from '@yuno/yuno-sdk-react-native';
import type {PaymentMethodSelectedEvent, PaymentMethodErrorEvent} from '@yuno/yuno-sdk-react-native';
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

interface HomeScreenProps {
  initialCountryCode?: string;
  initialConfigJson?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  initialCountryCode,
  initialConfigJson,
}) => {
  // Estado local para configuración
  const [countryCode, setCountryCode] = useState('CO');
  const [customerSession, setCustomerSession] = useState('');
  const [checkoutSession, setCheckoutSession] = useState('');
  const [paymentMethodType, setPaymentMethodType] = useState('CARD');
  const [vaultedToken, setVaultedToken] = useState('');
  const [showPaymentStatus, setShowPaymentStatus] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  // Procesar configuración inicial del JSON nativo
  useEffect(() => {
    if (initialCountryCode) {
      console.log('🌍 Setting country code from native:', initialCountryCode);
      setCountryCode(initialCountryCode);
    }

    if (initialConfigJson) {
      try {
        console.log('📋 Parsing config JSON from native...');
        const config = JSON.parse(initialConfigJson);
        
        // Extraer showPaymentStatus del JSON
        if (config.options && typeof config.options.showPaymentStatus === 'boolean') {
          console.log('✅ Setting showPaymentStatus from JSON:', config.options.showPaymentStatus);
          setShowPaymentStatus(config.options.showPaymentStatus);
        }

        // Log para confirmar que tenemos los datos
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
    console.log('🔵 handleStartPayment called - Showing Payment Methods');
    console.log('📋 checkoutSession:', checkoutSession || '(vacío)');
    
    // Payment solo requiere checkoutSession
    if (!checkoutSession.trim()) {
      Alert.alert('Campo Requerido', 'Por favor ingresa el Checkout Session');
      return;
    }

    console.log('✅ Showing payment methods component');
    setShowPaymentMethods(true);
  }, [checkoutSession]);

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
  ]);

  const handleEnrollment = useCallback(() => {
    console.log('🔵 handleEnrollment called');
    console.log('📋 customerSession:', customerSession || '(vacío)');
    console.log('📋 showPaymentStatus (state):', showPaymentStatus);
    console.log('📋 showPaymentStatus (typeof):', typeof showPaymentStatus);
    
    // Enrollment solo requiere customerSession
    if (!customerSession.trim()) {
      Alert.alert('Campo Requerido', 'Por favor ingresa el Customer Session');
      return;
    }

    const config: EnrollmentConfig = {
      customerSession,
      countryCode,
      showPaymentStatus, // Reutiliza showPaymentStatus del JSON
    };

    console.log('✅ Calling enrollmentPayment with config:', JSON.stringify(config, null, 2));
    enrollmentPayment(config);
  }, [customerSession, countryCode, showPaymentStatus, enrollmentPayment]);

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
  ]);

  const handleContinuePayment = useCallback(() => {
    continuePayment(checkoutSession, countryCode, showPaymentStatus);
  }, [checkoutSession, countryCode, showPaymentStatus, continuePayment]);

  // Handler para cuando se selecciona un método de pago
  const handlePaymentMethodSelected = useCallback(
    (event: PaymentMethodSelectedEvent) => {
      console.log('💳 Payment method selected:', event);
      if (event.isSelected) {
        Alert.alert(
          'Método de Pago Seleccionado',
          'Has seleccionado un método de pago. El flujo de pago continuará automáticamente.',
          [{text: 'OK'}]
        );
      }
    },
    []
  );

  // Handler para errores en el componente de métodos de pago
  const handlePaymentMethodError = useCallback((event: PaymentMethodErrorEvent) => {
    console.error('❌ Payment method error:', event);
    Alert.alert('Error', `No se pudieron cargar los métodos de pago: ${event.message}`, [
      {text: 'OK'},
    ]);
  }, []);

  // Handler para volver del componente de métodos de pago
  const handleBackFromPaymentMethods = useCallback(() => {
    console.log('🔙 Going back from payment methods');
    setShowPaymentMethods(false);
  }, []);

  // Si se están mostrando los métodos de pago, renderizar el componente
  if (showPaymentMethods) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Métodos de Pago</Text>
          <Text style={styles.subtitle}>Selecciona tu método preferido</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Checkout Session:</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {checkoutSession}
          </Text>
          <Text style={styles.infoLabel}>País:</Text>
          <Text style={styles.infoValue}>{countryCode}</Text>
        </View>

        <View style={styles.paymentMethodsContainer}>
          <YunoPaymentMethods
            checkoutSession={checkoutSession}
            countryCode={countryCode}
            onPaymentMethodSelected={handlePaymentMethodSelected}
            onPaymentMethodError={handlePaymentMethodError}
            style={styles.paymentMethods}
          />
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackFromPaymentMethods}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Vista normal del formulario
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
  infoContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 8,
    shadowColor: '#000',
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
  paymentMethodsContainer: {
    flex: 1,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethods: {
    flex: 1,
  },
  backButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

