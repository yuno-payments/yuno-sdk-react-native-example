/**
 * Componente para el formulario de configuración
 */

import React from 'react';
import {Card} from './Card';
import {Input} from './Input';

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
  return (
    <Card title="⚙️ Configuración">
      <Input
        label="Customer Session (solo para Enrollment)"
        placeholder="Ingresa el customer session"
        value={customerSession}
        onChangeText={onCustomerSessionChange}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Input
        label="Checkout Session (para Payment flows) *"
        placeholder="Ingresa el checkout session"
        value={checkoutSession}
        onChangeText={onCheckoutSessionChange}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Input
        label="Payment Method Type (para Lite/Seamless)"
        placeholder="Ej: CARD, BANCOLOMBIA_TRANSFER, etc."
        value={paymentMethodType}
        onChangeText={onPaymentMethodTypeChange}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <Input
        label="Vaulted Token (opcional para Lite/Seamless)"
        placeholder="Ingresa el vaulted token"
        value={vaultedToken}
        onChangeText={onVaultedTokenChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </Card>
  );
};

