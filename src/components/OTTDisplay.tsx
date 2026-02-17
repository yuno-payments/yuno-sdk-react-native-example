/**
 * Modern OTT display component
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Card} from './Card';
import {InfoRow} from './InfoRow';
import {Button} from './Button';
import {spacing} from '../theme';
import {useTranslation} from '../i18n';
import {useTheme} from '../hooks';
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
  const {colors} = useTheme();
  const styles = createStyles(colors);

  const handleCopyToken = () => {
    Clipboard.setString(token);
  };

  if (!token) {
    return <View />;
  }

  return (
    <Card title="One-Time Token" icon="🎟️" subtitle="Use this token to complete payment">
      {/* Token Display */}
      <View style={styles.tokenContainer}>
        <View style={styles.tokenHeader}>
          <Text style={styles.tokenLabel}>Token</Text>
          <Text style={styles.tokenBadge}>OTT</Text>
        </View>
        <Text style={styles.tokenValue} selectable numberOfLines={2}>
          {token}
        </Text>
      </View>

      {/* Token Info */}
      {tokenInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoGrid}>
            {tokenInfo.last_four_digits && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>💳</Text>
                <View>
                  <Text style={styles.infoLabel}>Card</Text>
                  <Text style={styles.infoValue}>•••• {tokenInfo.last_four_digits}</Text>
                </View>
              </View>
            )}
            {tokenInfo.category && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🏷️</Text>
                <View>
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>{tokenInfo.category}</Text>
                </View>
              </View>
            )}
            {tokenInfo.issuer && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🏦</Text>
                <View>
                  <Text style={styles.infoLabel}>Issuer</Text>
                  <Text style={styles.infoValue}>
                    {typeof tokenInfo.issuer === 'object'
                      ? tokenInfo.issuer?.name || 'N/A'
                      : tokenInfo.issuer || 'N/A'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.buttonContainer}>
        {checkoutSession && (
          <Button
            testID="button-continue-payment"
            title="Continue Payment"
            icon="✓"
            onPress={onContinuePayment}
            variant="success"
            disabled={loading}
            loading={loading}
          />
        )}
        <View style={styles.buttonRow}>
          <Button
            testID="button-copy-ott"
            title="Copy"
            icon="📋"
            onPress={handleCopyToken}
            variant="secondary"
            disabled={loading}
            style={styles.halfButton}
          />
          <Button
            testID="button-clear-ott"
            title="Clear"
            icon="🗑️"
            onPress={onClear}
            variant="ghost"
            disabled={loading}
            style={styles.halfButton}
          />
        </View>
      </View>
    </Card>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    tokenContainer: {
      backgroundColor: colors.surfaceVariant,
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    tokenHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    tokenLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tokenBadge: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary1,
      backgroundColor: colors.secondary1,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 4,
    },
    tokenValue: {
      fontSize: 13,
      color: colors.text,
      fontFamily: 'monospace',
      lineHeight: 20,
    },
    infoContainer: {
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    infoGrid: {
      gap: spacing.sm,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      padding: spacing.sm,
      borderRadius: 8,
      gap: spacing.sm,
    },
    infoIcon: {
      fontSize: 20,
    },
    infoLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    buttonContainer: {
      gap: spacing.sm,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    halfButton: {
      flex: 1,
    },
  });
