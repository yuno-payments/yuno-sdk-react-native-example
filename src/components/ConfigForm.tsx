/**
 * Configuration form component
 */

import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {Card} from './Card';
import {Input} from './Input';
import {useTranslation} from '../i18n';
import {useTheme} from '../hooks';
import {spacing} from '../theme';

interface ConfigFormProps {
  customerSession: string;
  checkoutSession: string;
  paymentMethodType: string;
  vaultedToken: string;
  onCustomerSessionChange: (value: string) => void;
  onCheckoutSessionChange: (value: string) => void;
  onPaymentMethodTypeChange: (value: string) => void;
  onVaultedTokenChange: (value: string) => void;
  // Session generation props
  onGenerateCustomerSession?: () => void;
  onGenerateCheckoutSession?: () => void;
  isGeneratingCustomerSession?: boolean;
  isGeneratingCheckoutSession?: boolean;
  canGenerateSessions?: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  customerSession,
  checkoutSession,
  paymentMethodType,
  vaultedToken,
  onCustomerSessionChange,
  onCheckoutSessionChange,
  onPaymentMethodTypeChange,
  onVaultedTokenChange,
  onGenerateCustomerSession,
  onGenerateCheckoutSession,
  isGeneratingCustomerSession = false,
  isGeneratingCheckoutSession = false,
  canGenerateSessions = false,
}) => {
  const t = useTranslation();
  const {colors} = useTheme();
  const styles = createStyles(colors);

  return (
    <Card title={`⚙️ ${t.config.title}`}>
      {/* Customer Session with Generate Button */}
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Input
            testID="input-customer-session"
            label={`${t.config.customerSession} (${t.config.requiredForEnrollment})`}
            placeholder={t.config.customerSessionPlaceholder}
            value={customerSession}
            onChangeText={onCustomerSessionChange}
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputFlex}
          />
        </View>
        {onGenerateCustomerSession && (
          <TouchableOpacity
            style={[
              styles.generateBtn,
              (!canGenerateSessions || isGeneratingCustomerSession) && styles.generateBtnDisabled,
            ]}
            onPress={onGenerateCustomerSession}
            disabled={!canGenerateSessions || isGeneratingCustomerSession}
            activeOpacity={0.7}>
            {isGeneratingCustomerSession ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.generateBtnText}>+</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Checkout Session with Generate Button */}
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Input
            testID="input-checkout-session"
            label={`${t.config.checkoutSession} (${t.config.requiredForPayment}) *`}
            placeholder={t.config.checkoutSessionPlaceholder}
            value={checkoutSession}
            onChangeText={onCheckoutSessionChange}
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputFlex}
          />
        </View>
        {onGenerateCheckoutSession && (
          <TouchableOpacity
            style={[
              styles.generateBtn,
              (!canGenerateSessions || isGeneratingCheckoutSession) && styles.generateBtnDisabled,
            ]}
            onPress={onGenerateCheckoutSession}
            disabled={!canGenerateSessions || isGeneratingCheckoutSession}
            activeOpacity={0.7}>
            {isGeneratingCheckoutSession ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.generateBtnText}>+</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Input
        testID="input-payment-method-type"
        label={`${t.config.paymentMethodType} (${t.config.requiredForLite}) *`}
        placeholder={t.config.paymentMethodTypePlaceholder}
        value={paymentMethodType}
        onChangeText={onPaymentMethodTypeChange}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <Input
        testID="input-vaulted-token"
        label={t.config.vaultedToken}
        placeholder={t.config.vaultedTokenPlaceholder}
        value={vaultedToken}
        onChangeText={onVaultedTokenChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </Card>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    inputContainer: {
      flex: 1,
    },
    inputFlex: {
      marginBottom: 0,
    },
    generateBtn: {
      backgroundColor: colors.primary1,
      width: 44,
      height: 44,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    generateBtnDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.5,
    },
    generateBtnText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 26,
    },
  });
