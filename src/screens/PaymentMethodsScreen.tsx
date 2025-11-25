/**
 * Pantalla de Métodos de Pago
 * 
 * Esta pantalla muestra el componente nativo YunoPaymentMethods
 * que renderiza la lista de métodos de pago disponibles del SDK de Yuno.
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {YunoPaymentMethods} from '@yuno/yuno-sdk-react-native';
import type {
  PaymentMethodSelectedEvent,
  PaymentMethodErrorEvent,
} from '@yuno/yuno-sdk-react-native';
import {colors, spacing, typography} from '../theme';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethods'>;

export const PaymentMethodsScreen: React.FC<Props> = ({route, navigation}) => {
  const {checkoutSession, countryCode} = route.params;
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handler cuando se selecciona un método de pago
  const handlePaymentMethodSelected = useCallback(
    (event: PaymentMethodSelectedEvent) => {
      console.log('💳 Payment method selected event:', event);
      setIsPaymentMethodSelected(event.isSelected);

      if (event.isSelected) {
        Alert.alert(
          'Método de Pago Seleccionado',
          'Has seleccionado un método de pago. El flujo de pago continuará automáticamente.',
          [{text: 'OK'}]
        );
      }
    },
    []
  );

  // Handler cuando ocurre un error
  const handlePaymentMethodError = useCallback(
    (event: PaymentMethodErrorEvent) => {
      console.error('❌ Payment method error:', event);
      Alert.alert('Error', `No se pudieron cargar los métodos de pago: ${event.message}`, [
        {text: 'OK'},
        {
          text: 'Volver',
          onPress: () => navigation.goBack(),
        },
      ]);
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Métodos de Pago</Text>
        <Text style={styles.subtitle}>Selecciona tu método preferido</Text>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Checkout Session:</Text>
        <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
          {checkoutSession}
        </Text>
        <Text style={styles.infoLabel}>País:</Text>
        <Text style={styles.infoValue}>{countryCode}</Text>
      </View>

      {/* Payment Methods Component */}
      <View style={styles.paymentMethodsContainer}>
        <YunoPaymentMethods
          checkoutSession={checkoutSession}
          countryCode={countryCode}
          onPaymentMethodSelected={handlePaymentMethodSelected}
          onPaymentMethodError={handlePaymentMethodError}
          style={styles.paymentMethods}
        />
      </View>

      {/* Status Indicator */}
      {isPaymentMethodSelected && (
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Método de pago seleccionado</Text>
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Procesando pago...</Text>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
  },
  infoContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  paymentMethodsContainer: {
    flex: 1,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethods: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.surface,
    marginTop: spacing.md,
  },
  backButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    ...typography.button,
    color: colors.primary,
  },
});

