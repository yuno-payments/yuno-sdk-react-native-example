import React, { useState } from 'react';
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
import { YunoSdk, CardType } from '@yuno-payments/yuno-sdk-react-native';
import type { TokenCollectedData } from '@yuno-payments/yuno-sdk-react-native';
import { useTheme } from '../hooks';
import { spacing } from '../theme';

const DEFAULT_PAYMENT_JSON = `{
  "checkout_session": "73ed16c5-4481-4dce-af42-404b68e21027",
  "payment_method": {
    "type": "CARD",
    "vaulted_token": null,
    "card": {
      "save": false,
      "detail": {
        "expiration_month": 11,
        "expiration_year": 25,
        "number": "4000000000001091",
        "security_code": "123",
        "holder_name": "JOHN DOE",
        "type": "CREDIT"
      }
    }
  }
}`;

const DEFAULT_ENROLLMENT_JSON = `{
  "customer_session": "73ed16c5-4481-4dce-af42-404b68e21027",
  "payment_method": {
    "type": "CARD",
    "vaulted_token": null,
    "card": {
      "save": true,
      "detail": {
        "expiration_month": 11,
        "expiration_year": 25,
        "number": "4000000000001091",
        "security_code": "123",
        "holder_name": "JOHN DOE",
        "type": "CREDIT"
      }
    }
  }
}`;

interface HeadlessPaymentScreenProps {
  initialCountryCode?: string;
}

export default function HeadlessPaymentScreen({ initialCountryCode }: HeadlessPaymentScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [paymentJsonText, setPaymentJsonText] = useState(DEFAULT_PAYMENT_JSON);
  const [enrollmentJsonText, setEnrollmentJsonText] = useState(DEFAULT_ENROLLMENT_JSON);
  const [isLoading, setIsLoading] = useState(false);
  const [ott, setOtt] = useState<string | null>(null);
  const [vaultedToken, setVaultedToken] = useState<string | null>(null);
  const [threeDsUrl, setThreeDsUrl] = useState<string | null>(null);
  const [checkoutSession, setCheckoutSession] = useState('');
  const [countryCode, setCountryCode] = useState(initialCountryCode || 'CO');

  const handleStartPayment = async () => {
    try {
      // Parse JSON - keep snake_case names for Android native SDK
      const parsedData = JSON.parse(paymentJsonText);

      // Store checkout session for later use
      setCheckoutSession(parsedData.checkout_session);

      setIsLoading(true);

      // Generate token using headless method
      // Pass parsedData directly as it already has correct snake_case field names
      console.log('🚀 Generating token with headless flow...');
      console.log('📍 Using country code:', countryCode);
      console.log('📦 Token data:', JSON.stringify(parsedData, null, 2));
      const result = await YunoSdk.generateToken(
        parsedData as any, // Cast to any since we're passing snake_case object
        parsedData.checkout_session,
        countryCode
      );

      console.log('✅ Token generated:', result);

      if (result.token) {
        setOtt(result.token);
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error: any) {
      console.error('❌ Error generating token:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to generate token. Check the console for details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEnrollment = async () => {
    try {
      // Parse JSON - keep snake_case names for Android native SDK
      const parsedData = JSON.parse(enrollmentJsonText);

      setIsLoading(true);

      // Start enrollment using headless method
      console.log('🚀 Starting enrollment with headless flow...');
      console.log('📍 Using country code:', countryCode);
      console.log('📦 Enrollment data:', JSON.stringify(parsedData, null, 2));
      
      // TODO: Call enrollment headless method when available
      // const result = await YunoSdk.createVaultedToken(parsedData, countryCode);
      // if (result.vaultedToken) {
      //   setVaultedToken(result.vaultedToken);
      // } else if (result.error) {
      //   Alert.alert('Error', `Failed to create vaulted token: ${result.error}`);
      // }
      
      // Temporary: Show alert until method is implemented
      Alert.alert('Info', 'Enrollment headless flow will be implemented here');
      
    } catch (error: any) {
      console.error('❌ Error in enrollment:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to start enrollment. Check the console for details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinuePayment = async () => {
    if (!checkoutSession) {
      Alert.alert('Error', 'No checkout session available');
      return;
    }

    try {
      setIsLoading(true);
      setOtt(null); // Close OTT dialog

      console.log('🚀 Getting 3DS challenge URL with headless flow...');
      console.log('📍 Using country code:', countryCode);
      const result = await YunoSdk.getThreeDSecureChallenge(
        checkoutSession,
        countryCode
      );

      console.log('✅ 3DS Challenge result:', result);

      if (result.type === 'URL') {
        setThreeDsUrl(result.data);
      } else {
        Alert.alert('Error', result.data);
      }
    } catch (error: any) {
      console.error('❌ Error getting 3DS challenge:', error);
      Alert.alert('Error', error.message || 'Failed to get 3DS challenge URL');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Copy', text);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
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
          onPress={handleStartPayment}
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
          onPress={handleStartEnrollment}
          disabled={!enrollmentJsonText || isLoading}
          testID="start-enrollment-button"
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>Continue Enrollment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* One Time Token Dialog */}
      {ott && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>One Time Token</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>{ott}</Text>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => copyToClipboard(ott)}
                testID="copy-ott-button"
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleContinuePayment}
                testID="continue-payment-button"
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setOtt(null)}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Vaulted Token Dialog */}
      {vaultedToken && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Vaulted Token</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>{vaultedToken}</Text>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => copyToClipboard(vaultedToken)}
                testID="copy-vaulted-token-button"
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setVaultedToken(null)}
                testID="close-vaulted-token-button"
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 3DS URL Dialog */}
      {threeDsUrl && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>3DS Challenge URL</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>{threeDsUrl}</Text>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => copyToClipboard(threeDsUrl)}
                testID="copy-3ds-url-button"
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setThreeDsUrl(null)}
              >
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

