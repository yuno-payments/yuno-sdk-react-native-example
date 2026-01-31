/**
 * Modern payment actions component
 */

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card} from './Card';
import {Button} from './Button';
import {spacing} from '../theme';
import {useTranslation} from '../i18n';

interface PaymentActionsProps {
  onStartPayment: () => void;
  onStartPaymentLite: () => void;
  onSeamlessPayment: () => void;
  onPaymentRender: () => void;
  loading?: boolean;
}

export const PaymentActions: React.FC<PaymentActionsProps> = ({
  onStartPayment,
  onStartPaymentLite,
  onSeamlessPayment,
  onPaymentRender,
  loading = false,
}) => {
  const t = useTranslation();

  return (
    <Card title="Payment Options" icon="💳" subtitle="Choose how to process payment">
      <View style={styles.grid}>
        <View style={styles.row}>
          <Button
            testID="button-start-payment"
            title="Full Checkout"
            icon="🛒"
            onPress={onStartPayment}
            variant="primary"
            disabled={loading}
            style={styles.gridButton}
          />
          <Button
            testID="button-start-payment-lite"
            title="Lite"
            icon="⚡"
            onPress={onStartPaymentLite}
            variant="secondary"
            disabled={loading}
            style={styles.gridButton}
          />
        </View>
        <View style={styles.row}>
          <Button
            testID="button-seamless-payment"
            title="Seamless"
            icon="✨"
            onPress={onSeamlessPayment}
            variant="secondary"
            disabled={loading}
            style={styles.gridButton}
          />
          <Button
            testID="button-payment-render"
            title="Render"
            icon="🎨"
            onPress={onPaymentRender}
            variant="primary"
            disabled={loading}
            style={styles.gridButton}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gridButton: {
    flex: 1,
  },
});
