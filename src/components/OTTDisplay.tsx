/**
 * Componente para mostrar información del OTT
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from './Card';
import {InfoRow} from './InfoRow';
import {Button} from './Button';
import {colors, spacing, typography} from '../theme';
import type {OneTimeTokenInfo} from '../types';

interface OTTDisplayProps {
  token: string;
  tokenInfo: OneTimeTokenInfo | null;
  checkoutSession: string;
  onContinuePayment: () => void;
  onClear: () => void;
  loading?: boolean;
}

export const OTTDisplay: React.FC<OTTDisplayProps> = ({
  token,
  tokenInfo,
  checkoutSession,
  onContinuePayment,
  onClear,
  loading = false,
}) => {
  if (!token) {
    return null;
  }

  return (
    <Card title="🎟️ One Time Token">
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenLabel}>Token:</Text>
        <Text style={styles.tokenValue} selectable>
          {token}
        </Text>
      </View>

      {tokenInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Información Adicional:</Text>
          <InfoRow label="Account ID" value={tokenInfo.account_id} />
          <InfoRow label="Customer Session" value={tokenInfo.customer_session} />
          <InfoRow label="Checkout Session" value={tokenInfo.checkout_session} />
          <InfoRow label="Account Type" value={tokenInfo.account_type} />
          <InfoRow label="Category" value={tokenInfo.category} />
          <InfoRow
            label="Issuer"
            value={
              typeof tokenInfo.issuer === 'object'
                ? tokenInfo.issuer?.name || 'N/A'
                : tokenInfo.issuer || 'N/A'
            }
          />
          <InfoRow label="Last 4" value={tokenInfo.last_four_digits} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        {checkoutSession && (
          <Button
            title="Continuar Pago con OTT"
            onPress={onContinuePayment}
            variant="success"
            disabled={loading}
            loading={loading}
            style={styles.button}
          />
        )}
        <Button
          title="Limpiar OTT"
          onPress={onClear}
          variant="secondary"
          disabled={loading}
          style={styles.button}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  tokenContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  tokenLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tokenValue: {
    ...typography.body,
    color: colors.text,
    fontFamily: 'monospace',
  },
  infoContainer: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    gap: spacing.sm,
  },
  button: {
    marginTop: spacing.xs,
  },
});

