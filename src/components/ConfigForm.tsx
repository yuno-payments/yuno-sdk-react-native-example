/**
 * Configuration form component
 */

import React from 'react';
import {Card} from './Card';
import {Input} from './Input';
import {useTranslation} from '../i18n';

interface ConfigFormProps {
  customerSession: string;
  checkoutSession: string;
  paymentMethodType: string;
  vaultedToken: string;
  onCustomerSessionChange: (value: string) => void;
  onCheckoutSessionChange: (value: string) => void;
  onPaymentMethodTypeChange: (value: string) => void;
  onVaultedTokenChange: (value: string) => void;
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
}) => {
  const t = useTranslation();

  return (
    <Card title={`⚙️ ${t.config.title}`}>
      <Input
        testID="input-customer-session"
        label={`${t.config.customerSession} (${t.config.requiredForEnrollment})`}
        placeholder={t.config.customerSessionPlaceholder}
        value={customerSession}
        onChangeText={onCustomerSessionChange}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Input
        testID="input-checkout-session"
        label={`${t.config.checkoutSession} (${t.config.requiredForPayment}) *`}
        placeholder={t.config.checkoutSessionPlaceholder}
        value={checkoutSession}
        onChangeText={onCheckoutSessionChange}
        autoCapitalize="none"
        autoCorrect={false}
      />

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

