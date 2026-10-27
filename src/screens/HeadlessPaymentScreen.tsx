import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Transaction, type OneTimeToken, type TransactionStatus} from '@yuno-payments/yuno-sdk-react-native';
import {useTheme} from '../hooks';
import {spacing, typography} from '../theme';

const DEFAULT_PAYMENT_JSON = `{
  "checkoutSession": "73ed16c5-4481-4dce-af42-404b68e21027",
  "paymentSelected": {
    "type": "CARD",
    "transactionData": {
      "card": {
        "number": "4111111111111111",
        "securityCode": "123",
        "expirationMonth": 12,
        "expirationYear": 2029,
        "holderName": "JOHN DOE",
        "type": "CREDIT"
      },
      "customer": {
        "email": "john.doe@example.com",
        "document": {"documentType": "CC", "documentNumber": "1100221287"}
      }
    }
  }
}`;

const DEFAULT_ENROLLMENT_JSON = `{
  "customerSession": "4cad3fa7-82b0-4337-9e7a-a187d50289b0",
  "paymentSelected": {
    "type": "CARD",
    "transactionData": {
      "card": {
        "number": "4111111111111111",
        "securityCode": "123",
        "expirationMonth": 12,
        "expirationYear": 2029,
        "holderName": "PEPITO PEREZ",
        "type": "CREDIT"
      },
      "customer": {
        "firstName": "Pepito",
        "lastName": "Pérez",
        "email": "pepito@example.com",
        "document": {"documentType": "CC", "documentNumber": "1100221287"}
      }
    }
  }
}`;

interface HeadlessPaymentScreenProps {
  initialCountryCode?: string;
}

function formatStatus(status: TransactionStatus): string {
  const message = status.message ? `${status.message.code ?? ''} ${status.message.reason ?? ''}`.trim() : '';
  return `Status: ${status.status}\nSubstatus: ${status.substatus || 'N/A'}\nMsg: ${message || 'N/A'}`;
}

export default function HeadlessPaymentScreen({initialCountryCode}: HeadlessPaymentScreenProps) {
  const {colors} = useTheme();
  const styles = createStyles(colors);

  const [paymentJsonText, setPaymentJsonText] = useState(DEFAULT_PAYMENT_JSON);
  const [enrollmentJsonText, setEnrollmentJsonText] = useState(DEFAULT_ENROLLMENT_JSON);
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoading, setSdkLoading] = useState(false);
  const [ott, setOtt] = useState<OneTimeToken | null>(null);
  const [status, setStatus] = useState('');
  const transaction = useRef<Transaction | null>(null);
  const pendingPayment = useRef<{resolve: () => void; reject: (error: Error) => void} | null>(null);
  const countryCode = initialCountryCode || 'CO';

  useEffect(() => () => transaction.current?.dispose(), []);

  const run = async (jsonText: string, enrollment: boolean) => {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error: any) {
      Alert.alert('Invalid JSON', error.message);
      return;
    }
    transaction.current?.dispose();
    pendingPayment.current = null;
    setOtt(null);
    setStatus('');
    setIsLoading(true);
    const controller = {
      onStatus: (result: TransactionStatus) => {
        setIsLoading(false);
        setSdkLoading(false);
        pendingPayment.current = null;
        setOtt(null);
        setStatus(formatStatus(result));
      },
      showLoading: (loading: boolean) => setSdkLoading(loading),
      ...(enrollment
        ? {}
        : {
            createPayment: (token: OneTimeToken) =>
              new Promise<void>((resolve, reject) => {
                setIsLoading(false);
                pendingPayment.current = {resolve, reject};
                setOtt(token);
              }),
          }),
    };
    try {
      const created = enrollment
        ? new Transaction({countryCode, customerSession: parsed.customerSession, controller})
        : new Transaction({countryCode, checkoutSession: parsed.checkoutSession, controller});
      transaction.current = created;
      await created.start(parsed.paymentSelected);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Could not start the transaction');
    }
  };

  const handleContinuePayment = () => {
    setIsLoading(true);
    pendingPayment.current?.resolve();
    pendingPayment.current = null;
    setOtt(null);
  };

  const handleCloseOtt = () => {
    pendingPayment.current?.reject(new Error('cancelled_by_merchant'));
    pendingPayment.current = null;
    setOtt(null);
  };

  const copyToClipboard = (value: string) => {
    Clipboard.setString(value);
  };

  const token = typeof ott?.token === 'string' ? ott.token : null;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentInsetAdjustmentBehavior="automatic"
      >
        {sdkLoading ? (
          <Text testID="sdk-loading" style={styles.sdkLoading}>
            Processing...
          </Text>
        ) : null}

        <Text style={styles.title}>Headless Payment</Text>

        <Text style={styles.label}>Payment JSON:</Text>
        <TextInput
          style={styles.textInput}
          value={paymentJsonText}
          onChangeText={setPaymentJsonText}
          multiline
          placeholder="Enter payment data JSON"
          testID="headless-payment-json-input"
        />

        <TouchableOpacity
          style={[styles.button, !paymentJsonText && styles.buttonDisabled]}
          onPress={() => run(paymentJsonText, false)}
          disabled={!paymentJsonText || isLoading}
          testID="start-payment-button"
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>Start Payment</Text>
          )}
        </TouchableOpacity>

        {/* Enrollment Section */}
        <Text style={[styles.title, styles.sectionTitle]}>Headless Enrollment</Text>

        <Text style={styles.label}>Enrollment JSON:</Text>
        <TextInput
          style={styles.textInput}
          value={enrollmentJsonText}
          onChangeText={setEnrollmentJsonText}
          multiline
          placeholder="Enter enrollment data JSON"
          testID="headless-enrollment-json-input"
        />

        <TouchableOpacity
          style={[styles.button, !enrollmentJsonText && styles.buttonDisabled]}
          onPress={() => run(enrollmentJsonText, true)}
          disabled={!enrollmentJsonText || isLoading}
          testID="start-enrollment-button"
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>Start Enrollment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {status ? (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Status</Text>
            <Text style={styles.modalText} testID="headless-status-text">
              {status}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setStatus('')}
                testID="close-status-button">
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      {token && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>One Time Token</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>{token}</Text>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => copyToClipboard(token)}
                testID="copy-ott-button">
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleContinuePayment}
                testID="continue-payment-button">
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleCloseOtt}
                testID="close-ott-button">
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.textInverse} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  scrollViewContent: {
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  sectionTitle: {
    marginTop: spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 300,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    fontFamily: 'monospace',
    fontSize: 12,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.text, // neutralB (black in light, white in dark)
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: spacing.sm,
    shadowColor: colors.elevation,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.textInverse, // neutralW (white in light, black in dark)
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    color: colors.text, // neutralB (black in light, white in dark)
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '80%',
    shadowColor: colors.elevation,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  modalScroll: {
    maxHeight: 200,
    marginBottom: spacing.md,
  },
  modalText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalButtons: {
    gap: spacing.sm,
  },
  sdkLoading: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textInverse,
    marginTop: spacing.md,
    fontSize: 16,
  },
});

