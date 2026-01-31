/**
 * Modern configuration form component
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

  const GenerateButton = ({
    onPress,
    loading,
    disabled,
  }: {
    onPress?: () => void;
    loading: boolean;
    disabled: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.generateBtn, disabled && styles.generateBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.generateBtnText}>⚡</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Card title="Configuration" icon="⚙️" subtitle="Set up your payment session">
      {/* Customer Session */}
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Input
            testID="input-customer-session"
            label="Customer Session"
            placeholder="Enter customer session..."
            hint="Required for enrollment"
            value={customerSession}
            onChangeText={onCustomerSessionChange}
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputFlex}
          />
        </View>
        {onGenerateCustomerSession && (
          <GenerateButton
            onPress={onGenerateCustomerSession}
            loading={isGeneratingCustomerSession}
            disabled={!canGenerateSessions || isGeneratingCustomerSession}
          />
        )}
      </View>

      {/* Checkout Session */}
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Input
            testID="input-checkout-session"
            label="Checkout Session"
            placeholder="Enter checkout session..."
            hint="Required for payment"
            value={checkoutSession}
            onChangeText={onCheckoutSessionChange}
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputFlex}
          />
        </View>
        {onGenerateCheckoutSession && (
          <GenerateButton
            onPress={onGenerateCheckoutSession}
            loading={isGeneratingCheckoutSession}
            disabled={!canGenerateSessions || isGeneratingCheckoutSession}
          />
        )}
      </View>

      {/* Payment Method Type */}
      <Input
        testID="input-payment-method-type"
        label="Payment Method"
        placeholder="CARD, APPLE_PAY, etc."
        hint="Required for lite flow"
        icon="💳"
        value={paymentMethodType}
        onChangeText={onPaymentMethodTypeChange}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      {/* Vaulted Token */}
      <Input
        testID="input-vaulted-token"
        label="Vaulted Token"
        placeholder="Optional saved card token..."
        hint="Use a previously saved payment method"
        icon="🔐"
        value={vaultedToken}
        onChangeText={onVaultedTokenChange}
        autoCapitalize="none"
        autoCorrect={false}
        containerStyle={styles.lastInput}
      />
    </Card>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    inputContainer: {
      flex: 1,
    },
    inputFlex: {
      marginBottom: spacing.sm,
    },
    lastInput: {
      marginBottom: 0,
    },
    generateBtn: {
      backgroundColor: colors.primary1,
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 22, // Align with input
      shadowColor: colors.primary1,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    generateBtnDisabled: {
      backgroundColor: colors.disabled,
      shadowOpacity: 0,
      elevation: 0,
    },
    generateBtnText: {
      fontSize: 20,
    },
  });
