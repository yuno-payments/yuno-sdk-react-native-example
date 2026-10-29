/**
 * Component to display OTT information
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Card} from './Card';
import {InfoRow} from './InfoRow';
import {Button} from './Button';
import {spacing, typography} from '../theme';
import {useTranslation} from '../i18n';
import {useTheme} from '../hooks';
import type {OneTimeToken} from '@yuno-payments/yuno-sdk-react-native';

interface OTTDisplayProps {
  ott: OneTimeToken | null;
  onContinuePayment: () => void;
  onClear: () => void;
  loading?: boolean;
}

function text(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return 'N/A';
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

export const OTTDisplay: React.FC<OTTDisplayProps> = ({
  ott,
  onContinuePayment,
  onClear,
  loading = false,
}) => {
  const t = useTranslation();
  const {colors} = useTheme();
  const styles = createStyles(colors);

  const token = typeof ott?.token === 'string' ? ott.token : '';

  const handleCopyToken = () => {
    Clipboard.setString(token);
  };

  if (!ott || !token) {
    // Return empty View to maintain position in layout
    return <View />;
  }

  return (
    <Card title={`🎟️ ${t.ott.title}`}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenLabel}>{t.ott.token}:</Text>
        <Text style={styles.tokenValue} selectable>
          {token}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          testID="button-continue-payment"
          title={t.ott.continuePayment}
          onPress={onContinuePayment}
          variant="success"
          disabled={loading}
          loading={loading}
          style={styles.button}
        />
        <Button
          testID="button-copy-ott"
          title="Copy"
          onPress={handleCopyToken}
          variant="primary"
          disabled={loading}
          style={styles.button}
        />
        <Button
          testID="button-clear-ott"
          title={t.ott.clear}
          onPress={onClear}
          variant="secondary"
          disabled={loading}
          style={styles.button}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>{t.ott.additionalInfo}:</Text>
        <InfoRow label={t.ott.paymentMethod} value={text(ott.type)} />
        <InfoRow label={t.ott.vaultOnSuccess} value={text(ott.vault_on_success)} />
        <InfoRow label={t.ott.cardData} value={text(ott.card_data)} />
        <InfoRow label={t.ott.customerInfo} value={text(ott.customer)} />
      </View>

    </Card>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  tokenContainer: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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

