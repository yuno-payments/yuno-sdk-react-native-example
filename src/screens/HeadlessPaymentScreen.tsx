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

const DEFAULT_JSON = `{
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

export default function HeadlessPaymentScreen() {
  const [jsonText, setJsonText] = useState(DEFAULT_JSON);
  const [isLoading, setIsLoading] = useState(false);
  const [ott, setOtt] = useState<string | null>(null);
  const [threeDsUrl, setThreeDsUrl] = useState<string | null>(null);
  const [checkoutSession, setCheckoutSession] = useState('');

  const handleStartPayment = async () => {
    try {
      // Parse JSON
      const parsedData = JSON.parse(jsonText);
      const tokenCollectedData: TokenCollectedData = {
        checkoutSession: parsedData.checkout_session,
        customerSession: parsedData.customer_session,
        paymentMethod: {
          type: parsedData.payment_method.type,
          vaultedToken: parsedData.payment_method.vaulted_token,
          card: parsedData.payment_method.card
            ? {
                save: parsedData.payment_method.card.save,
                detail: parsedData.payment_method.card.detail
                  ? {
                      expirationMonth:
                        parsedData.payment_method.card.detail.expiration_month,
                      expirationYear:
                        parsedData.payment_method.card.detail.expiration_year,
                      number: parsedData.payment_method.card.detail.number,
                      securityCode:
                        parsedData.payment_method.card.detail.security_code,
                      holderName:
                        parsedData.payment_method.card.detail.holder_name,
                      type: parsedData.payment_method.card.detail
                        .type as CardType,
                    }
                  : undefined,
                installment: parsedData.payment_method.card.installment,
              }
            : undefined,
          customer: parsedData.payment_method.customer,
        },
      };

      // Store checkout session for later use
      setCheckoutSession(parsedData.checkout_session);

      setIsLoading(true);

      // Generate token
      console.log('🚀 Generating token...');
      const result = await YunoSdk.generateToken(
        tokenCollectedData,
        parsedData.checkout_session,
        'BR' // Country code
      );

      console.log('✅ Token generated:', result);

      if (result.token) {
        setOtt(result.token);
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

  const handleContinuePayment = async () => {
    if (!checkoutSession) {
      Alert.alert('Error', 'No checkout session available');
      return;
    }

    try {
      setIsLoading(true);
      setOtt(null); // Close OTT dialog

      console.log('🚀 Getting 3DS challenge URL...');
      const result = await YunoSdk.getThreeDSecureChallenge(
        checkoutSession,
        'BR'
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
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Headless Payment</Text>

        <Text style={styles.label}>Headless JSON:</Text>
        <TextInput
          style={styles.textInput}
          value={jsonText}
          onChangeText={setJsonText}
          multiline
          placeholder="Enter payment data JSON"
          testID="headless-json-input"
        />

        <TouchableOpacity
          style={[styles.button, !jsonText && styles.buttonDisabled]}
          onPress={handleStartPayment}
          disabled={!jsonText || isLoading}
          testID="start-payment-button"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Start Payment</Text>
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
                <Text style={styles.buttonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={handleContinuePayment}
                testID="continue-payment-button"
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setOtt(null)}
              >
                <Text style={styles.buttonText}>Close</Text>
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
                <Text style={styles.buttonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setThreeDsUrl(null)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    minHeight: 300,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    fontFamily: 'monospace',
    fontSize: 12,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#00A86B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonSecondary: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalScroll: {
    maxHeight: 200,
    marginBottom: 16,
  },
  modalText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
  },
  modalButtons: {
    gap: 8,
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
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
});

