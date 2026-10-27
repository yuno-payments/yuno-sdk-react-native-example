import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {YunoView, type PaymentMethodSelected} from '@yuno-payments/yuno-sdk-react-native';
import {parseAppConfig, useTheme, useYunoSDK} from '../hooks';
import {ConfigForm, EnrollmentActions, OTTDisplay, PaymentActions, StatusDisplay} from '../components';
import {spacing, typography} from '../theme';
import {useTranslation} from '../i18n';

interface HomeScreenProps {
  initialCountryCode?: string;
  initialConfigJson?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({initialCountryCode, initialConfigJson}) => {
  const t = useTranslation();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const scrollViewRef = useRef<ScrollView>(null);

  const [countryCode, setCountryCode] = useState(
    initialCountryCode || parseAppConfig(initialConfigJson)?.country || 'CO',
  );
  const [customerSession, setCustomerSession] = useState('');
  const [checkoutSession, setCheckoutSession] = useState('');
  const [paymentMethodType, setPaymentMethodType] = useState('CARD');
  const [vaultedToken, setVaultedToken] = useState('');

  useEffect(() => {
    if (initialCountryCode) {
      setCountryCode(initialCountryCode);
    }
  }, [initialCountryCode]);

  const {
    isLoading,
    sdkLoading,
    paymentStatus,
    enrollmentStatus,
    ott,
    listView,
    formView,
    selected,
    showPaymentMethods,
    paySelected,
    startPayment,
    startEnrollment,
    continuePayment,
    clearOTT,
    submitForm,
    closeTransaction,
  } = useYunoSDK(initialConfigJson);

  const sdkView = ott ? null : listView ? 'list' : formView ? 'form' : null;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sdkView) {
        closeTransaction();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [sdkView, closeTransaction]);

  useEffect(() => {
    if (ott || paymentStatus || enrollmentStatus) {
      setTimeout(() => scrollViewRef.current?.scrollTo({y: 0, animated: true}), 100);
    }
  }, [ott, paymentStatus, enrollmentStatus]);

  const requireFields = useCallback(
    (fields: Array<[string, string]>, title: string, pleaseEnter: string): boolean => {
      const missing = fields.filter(([value]) => !value.trim()).map(([, label]) => label);
      if (missing.length > 0) {
        Alert.alert(title, `${pleaseEnter}: ${missing.join(', ')}`);
        return false;
      }
      return true;
    },
    [],
  );

  const selectedMethod = useCallback(
    (): PaymentMethodSelected => ({
      type: paymentMethodType.trim().toUpperCase(),
      vaultedToken: vaultedToken.trim() || undefined,
    }),
    [paymentMethodType, vaultedToken],
  );

  const paymentFields = useCallback(
    (withMethod: boolean) =>
      requireFields(
        withMethod
          ? [
              [checkoutSession, t.config.checkoutSession],
              [paymentMethodType, t.config.paymentMethodType],
            ]
          : [[checkoutSession, t.config.checkoutSession]],
        t.payment.requiredFields,
        t.payment.pleaseEnter,
      ),
    [checkoutSession, paymentMethodType, requireFields, t],
  );

  const handleStartPayment = useCallback(() => {
    if (paymentFields(false)) {
      showPaymentMethods({checkoutSession: checkoutSession.trim(), countryCode});
    }
  }, [paymentFields, showPaymentMethods, checkoutSession, countryCode]);

  const handleStartPaymentLite = useCallback(() => {
    if (paymentFields(true)) {
      startPayment({checkoutSession: checkoutSession.trim(), countryCode}, selectedMethod(), {
        createPayment: true,
        embedded: false,
      });
    }
  }, [paymentFields, startPayment, checkoutSession, countryCode, selectedMethod]);

  const handleSeamlessPayment = useCallback(() => {
    if (paymentFields(true)) {
      startPayment({checkoutSession: checkoutSession.trim(), countryCode}, selectedMethod(), {
        createPayment: false,
        embedded: false,
      });
    }
  }, [paymentFields, startPayment, checkoutSession, countryCode, selectedMethod]);

  const handleEmbeddedPayment = useCallback(() => {
    if (paymentFields(true)) {
      startPayment({checkoutSession: checkoutSession.trim(), countryCode}, selectedMethod(), {
        createPayment: true,
        embedded: true,
      });
    }
  }, [paymentFields, startPayment, checkoutSession, countryCode, selectedMethod]);

  const enrollment = useCallback(
    (embedded: boolean) => {
      if (
        requireFields(
          [[customerSession, t.config.customerSession]],
          t.enrollment.requiredFields,
          t.enrollment.pleaseEnter,
        )
      ) {
        startEnrollment({customerSession: customerSession.trim(), countryCode}, selectedMethod(), {
          createPayment: false,
          embedded,
        });
      }
    },
    [requireFields, customerSession, countryCode, startEnrollment, selectedMethod, t],
  );

  if (sdkView) {
    return (
      <View style={styles.container}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sdkScroll}>
          <View style={styles.header}>
            <Text style={styles.title}>{sdkView === 'list' ? t.paymentMethods.title : t.payment.embeddedPayment}</Text>
            {sdkView === 'list' ? <Text style={styles.subtitle}>{t.paymentMethods.subtitle}</Text> : null}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>{t.paymentMethods.checkoutSession}:</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
              {checkoutSession || customerSession}
            </Text>
            <Text style={styles.infoLabel}>{t.paymentMethods.country}:</Text>
            <Text style={styles.infoValue}>{countryCode}</Text>
          </View>

          <View style={styles.paymentMethodsWrapper}>
            {sdkView === 'list' && listView ? <YunoView testID="yuno-payment-methods-view" view={listView} /> : null}
            {sdkView === 'form' && formView ? <YunoView testID="yuno-embedded-form-view" view={formView} /> : null}
          </View>

          {sdkView === 'list' && selected ? (
            <TouchableOpacity testID="button-pay" style={styles.payButton} onPress={paySelected} activeOpacity={0.7}>
              <Text style={styles.payButtonText}>{t.paymentMethods.payButton}</Text>
            </TouchableOpacity>
          ) : null}
          {sdkView === 'form' ? (
            <TouchableOpacity testID="button-submit-embedded" style={styles.payButton} onPress={submitForm} activeOpacity={0.7}>
              <Text style={styles.payButtonText}>{t.payment.submitEmbedded}</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity testID="button-back" style={styles.backButton} onPress={closeTransaction} activeOpacity={0.7}>
            <Text style={styles.backButtonText}>{t.paymentMethods.backButton}</Text>
          </TouchableOpacity>
          {sdkLoading ? (
            <Text testID="sdk-loading" style={styles.sdkLoading}>
              {t.status.processing}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.app.title}</Text>
        <Text style={styles.subtitle}>{t.app.subtitle}</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentInsetAdjustmentBehavior="automatic">
        {sdkLoading ? (
          <Text testID="sdk-loading" style={styles.sdkLoading}>
            {t.status.processing}
          </Text>
        ) : null}

        <OTTDisplay ott={ott} onContinuePayment={continuePayment} onClear={clearOTT} loading={isLoading} />

        <StatusDisplay paymentStatus={paymentStatus} enrollmentStatus={enrollmentStatus} />

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
          onEmbeddedPayment={handleEmbeddedPayment}
          loading={isLoading}
        />

        <EnrollmentActions
          onEnrollment={() => enrollment(false)}
          onEmbeddedEnrollment={() => enrollment(true)}
          loading={isLoading}
        />
      </ScrollView>
    </View>
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
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
  },
  sdkScroll: {
    paddingBottom: spacing.lg,
  },
  sdkLoading: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.sm,
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

