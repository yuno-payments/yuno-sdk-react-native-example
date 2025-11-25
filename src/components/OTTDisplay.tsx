/**
 * Component to display OTT information
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from './Card';
import {InfoRow} from './InfoRow';
import {Button} from './Button';
import {colors, spacing, typography} from '../theme';
import {useTranslation} from '../i18n';
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
  const t = useTranslation();

  if (!token) {
    return null;
  }

  return (
    <Card title={`🎟️ ${t.ott.title}`}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenLabel}>{t.ott.token}:</Text>
        <Text style={styles.tokenValue} selectable>
          {token}
        </Text>
      </View>

      {tokenInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>{t.ott.additionalInfo}:</Text>
          <InfoRow label={t.ott.accountId} value={tokenInfo.account_id} />
          <InfoRow label={t.ott.customerSession} value={tokenInfo.customer_session} />
          <InfoRow label={t.ott.checkoutSession} value={tokenInfo.checkout_session} />
          <InfoRow label={t.ott.accountType} value={tokenInfo.account_type} />
          <InfoRow label={t.ott.category} value={tokenInfo.category} />
          <InfoRow
            label={t.ott.issuer}
            value={
              typeof tokenInfo.issuer === 'object'
                ? tokenInfo.issuer?.name || 'N/A'
                : tokenInfo.issuer || 'N/A'
            }
          />
          <InfoRow label={t.ott.lastFourDigits} value={tokenInfo.last_four_digits} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        {checkoutSession && (
          <Button
            title={t.ott.continuePayment}
            onPress={onContinuePayment}
            variant="success"
            disabled={loading}
            loading={loading}
            style={styles.button}
          />
        )}
        <Button
          title={t.ott.clear}
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

