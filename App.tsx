/**
 * Yuno SDK React Native - Example App
 * Aplicación de ejemplo para demostrar el uso del SDK de Yuno
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Platform,
  AppState,
} from 'react-native';
import {
  YunoSdk,
  YunoLanguage,
  CardFlow,
  YunoStatus,
  type YunoPaymentState,
  type YunoEnrollmentState,
  type OneTimeTokenInfo,
} from '@y.uno/yuno-sdk-react-native';

function App(): React.JSX.Element {
  // Estado del SDK - Ya viene inicializado desde YunoActivity
  const [isInitialized, setIsInitialized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Configuración
  const [countryCode] = useState('CO');
  const [customerSession, setCustomerSession] = useState('');
  const [checkoutSession, setCheckoutSession] = useState('');

  // Payment Lite / Seamless configuration
  const [paymentMethodType, setPaymentMethodType] = useState('CARD');
  const [vaultedToken, setVaultedToken] = useState('');

  // Estados de pago
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('');
  const [ottToken, setOttToken] = useState<string>('');
  const [ottTokenInfo, setOttTokenInfo] = useState<OneTimeTokenInfo | null>(null);
  
  // Ref para detectar cambios de foreground/background
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    console.log('📱 ========================================');
    console.log('📱 APP MOUNTED - INITIALIZING');
    console.log('📱 ========================================');
    
    // Mark SDK as initialized since it was initialized in YunoActivity.onCreate()
    console.log('✅ Marking SDK as initialized...');
    YunoSdk.markAsInitialized('CO', YunoLanguage.ES);
    console.log('✅ SDK marked as initialized');
    
    console.log('🎧 Setting up event listeners...');
    setupListeners();
    console.log('✅ Event listeners setup complete');
    
    console.log('📱 ========================================');
    console.log('📱 INITIALIZATION COMPLETE');
    console.log('📱 ========================================');
  }, []);
  
  // Listener para detectar cuando la app vuelve al foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      console.log('📱 ========================================');
      console.log('📱 AppState changed from:', appState.current, 'to:', nextAppState);
      console.log('📱 ========================================');
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('✅ App has come to the foreground!');
        console.log('🎟️ Current OTT Token state:', ottToken || 'No token yet');
        
        // Intentar recuperar el último OTT del nativo (en caso de que se haya perdido el evento)
        try {
          const lastOtt = await YunoSdk.getLastOneTimeToken();
          console.log('💾 Retrieved last OTT from native:', lastOtt || 'null');
          
          // También recuperar la información completa del OTT
          const lastOttInfo = await YunoSdk.getLastOneTimeTokenInfo();
          console.log('💾 Retrieved last OTT Info from native:', lastOttInfo ? 'YES' : 'NO');
          if (lastOttInfo) {
            console.log('📋 OTT Info details:', JSON.stringify(lastOttInfo, null, 2));
          }
          
          if (lastOtt && lastOtt !== ottToken) {
            console.log('🎉 New OTT found! Updating state...');
            setOttToken(lastOtt);
            
            // También actualizar el ottTokenInfo si está disponible
            if (lastOttInfo) {
              console.log('🎉 New OTT Info found! Updating state...');
              setOttTokenInfo(lastOttInfo);
            }
            
            Alert.alert('🎟️ OTT Recibido', `Token disponible: ${lastOtt.substring(0, 20)}...`);
          } else if (ottToken) {
            console.log('ℹ️  OTT already in state, no need to update');
          } else {
            console.log('ℹ️  No OTT available yet');
          }
        } catch (error) {
          console.error('❌ Error retrieving last OTT:', error);
        }
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [ottToken]);

  const setupListeners = () => {
    console.log('🚀 ========================================');
    console.log('🚀 SETTING UP ALL EVENT LISTENERS');
    console.log('🚀 ========================================');
    
    // Listener de estado de pago
    console.log('🔧 Setting up Payment Status listener...');
    const paymentSub = YunoSdk.onPaymentStatus((state: YunoPaymentState) => {
      console.log('💳 Payment Status:', state.status);
      setPaymentStatus(state.status);

      if (state.token) {
        console.log('🎟️ OTT Token:', state.token);
        setOttToken(state.token);
      }

      switch (state.status) {
        case YunoStatus.SUCCEEDED:
          Alert.alert('✅ Éxito', 'Pago completado exitosamente');
          break;
        case YunoStatus.FAILED:
          Alert.alert('❌ Error', 'El pago falló');
          break;
        case YunoStatus.REJECTED:
          Alert.alert('⛔ Rechazado', 'El pago fue rechazado');
          break;
        case YunoStatus.CANCELLED_BY_USER:
          Alert.alert('🚫 Cancelado', 'Pago cancelado por el usuario');
          break;
      }
    });

    // Listener de enrollment
    const enrollmentSub = YunoSdk.onEnrollmentStatus(
      (state: YunoEnrollmentState) => {
        console.log('📝 Enrollment Status:', state.status);
        setEnrollmentStatus(state.status);

        if (state.status === YunoStatus.SUCCEEDED) {
          Alert.alert('✅ Éxito', 'Método de pago guardado correctamente');
        }
      },
    );

    // Listener de tokens OTT
    console.log('🔧 Setting up OTT listener...');
    const tokenSub = YunoSdk.onOneTimeToken((token: string) => {
      console.log('🎟️ ========================================');
      console.log('🎟️ RECEIVED OTT TOKEN IN JAVASCRIPT!!!');
      console.log('🎟️ Token:', token);
      console.log('🎟️ ========================================');
      setOttToken(token);
      Alert.alert('🎟️ OTT Recibido', `Token: ${token.substring(0, 20)}...`);
    });
    console.log('✅ OTT listener setup complete');

    // Listener de OneTimeTokenInfo con información extendida
    console.log('🔧 Setting up OTT Info listener...');
    const tokenInfoSub = YunoSdk.onOneTimeTokenInfo((tokenInfo: OneTimeTokenInfo) => {
      console.log('📋 ========================================');
      console.log('📋 RECEIVED OTT TOKEN INFO WITH FULL DATA!!!');
      console.log('📋 Full tokenInfo object:', JSON.stringify(tokenInfo, null, 2));
      console.log('📋 Token:', tokenInfo.token);
      console.log('📋 Type:', tokenInfo.type);
      console.log('📋 Vaulted Token:', tokenInfo.vaultedToken);
      console.log('📋 Card Data exists?:', tokenInfo.cardData ? 'YES' : 'NO');
      console.log('📋 Card Brand:', tokenInfo.cardData?.brand);
      console.log('📋 Card Last 4:', tokenInfo.cardData?.lfd);
      console.log('📋 Customer exists?:', tokenInfo.customer ? 'YES' : 'NO');
      console.log('📋 Customer:', tokenInfo.customer?.first_name, tokenInfo.customer?.last_name);
      console.log('📋 ========================================');
      
      // Guardar toda la información
      console.log('💾 Updating ottTokenInfo state...');
      setOttTokenInfo(tokenInfo);
      console.log('✅ ottTokenInfo state updated!');
      
      // También actualizar el token simple
      if (tokenInfo.token) {
        console.log('💾 Updating ottToken state...');
        setOttToken(tokenInfo.token);
        console.log('✅ ottToken state updated!');
      }
    });
    console.log('✅ OTT Info listener setup complete');

    return () => {
      paymentSub.remove();
      enrollmentSub.remove();
      tokenSub.remove();
      tokenInfoSub.remove();
    };
  };

  const handleContinuePayment = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'El SDK no está inicializado');
      return;
    }

    if (!ottToken) {
      Alert.alert('Error', 'No hay un OTT disponible. Primero realiza un pago.');
      return;
    }

    try {
      setIsLoading(true);
      await YunoSdk.continuePayment(true);
      Alert.alert('✅ Continuar Pago', 'Continuando con el proceso de pago...');
    } catch (error) {
      console.error('Error continuing payment:', error);
      Alert.alert('Error', `No se pudo continuar el pago: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPayment = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Primero debes inicializar el SDK');
      return;
    }

    try {
      setIsLoading(true);
      await YunoSdk.startPayment(true);
    } catch (error) {
      console.error('Error starting payment:', error);
      Alert.alert('Error', `No se pudo iniciar el pago: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPaymentLite = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Primero debes inicializar el SDK');
      return;
    }

    if (!checkoutSession.trim()) {
      Alert.alert('Error', 'Ingresa un checkout session');
      return;
    }

    if (!paymentMethodType.trim()) {
      Alert.alert('Error', 'Ingresa un payment method type');
      return;
    }

    try {
      setIsLoading(true);
      await YunoSdk.startPaymentLite({
        checkoutSession: checkoutSession.trim(),
        methodSelected: {
          paymentMethodType: paymentMethodType.trim(),
          vaultedToken: vaultedToken.trim() || undefined,
        },
        showPaymentStatus: true,
      });
    } catch (error) {
      console.error('Error starting payment lite:', error);
      Alert.alert('Error', `No se pudo iniciar payment lite: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Primero debes inicializar el SDK');
      return;
    }

    if (!customerSession.trim()) {
      Alert.alert('Error', 'Ingresa un customer session');
      return;
    }

    try {
      setIsLoading(true);
      await YunoSdk.enrollmentPayment({
        customerSession: customerSession.trim(),
        showPaymentStatus: true,
        countryCode: countryCode.trim() || 'CO',
      });
    } catch (error) {
      console.error('Error starting enrollment:', error);
      Alert.alert('Error', `No se pudo iniciar enrollment: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeamlessPayment = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Primero debes inicializar el SDK');
      return;
    }

    if (!checkoutSession.trim()) {
      Alert.alert('Error', 'Ingresa un checkout session');
      return;
    }

    if (!paymentMethodType.trim()) {
      Alert.alert('Error', 'Ingresa un payment method type');
      return;
    }

    try {
      setIsLoading(true);
      const status = await YunoSdk.startPaymentSeamlessLite({
        checkoutSession: checkoutSession.trim(),
        methodSelected: {
          paymentMethodType: paymentMethodType.trim(),
          vaultedToken: vaultedToken.trim() || undefined,
        },
        showPaymentStatus: false,
        countryCode: countryCode.trim() || 'CO',
      });

      Alert.alert('Estado Seamless', `Estado: ${status}`);
    } catch (error) {
      console.error('Error seamless payment:', error);
      Alert.alert('Error', `No se pudo iniciar seamless: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHideLoader = async () => {
    try {
      await YunoSdk.hideLoader();
      Alert.alert('Loader Oculto', 'El loader ha sido ocultado');
    } catch (error) {
      console.error('Error hiding loader:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#4E3DD8" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>🎯 Yuno SDK Example</Text>
          <Text style={styles.subtitle}>
            {Platform.OS === 'ios' ? '📱 iOS' : '🤖 Android'}
          </Text>
        </View>

        {/* Estado del SDK */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Estado del SDK</Text>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Estado:</Text>
            <Text
              style={[
                styles.statusBadge,
                {backgroundColor: isInitialized ? '#4CAF50' : '#F44336'},
              ]}>
              {isInitialized ? '✓ Inicializado' : '✗ No Inicializado'}
            </Text>
          </View>

          {paymentStatus && (
            <View style={styles.statusRow}>
              <Text style={styles.label}>Pago:</Text>
              <Text style={styles.value}>{paymentStatus}</Text>
            </View>
          )}

          {enrollmentStatus && (
            <View style={styles.statusRow}>
              <Text style={styles.label}>Enrollment:</Text>
              <Text style={styles.value}>{enrollmentStatus}</Text>
            </View>
          )}
        </View>

        {/* One Time Token - Sección Destacada */}
        {ottToken && (
          <View style={styles.tokenCard}>
            <Text style={styles.tokenCardTitle}>🎟️ One Time Token (OTT)</Text>
            <Text style={styles.tokenCardSubtitle}>
              Token generado para continuar el pago:
            </Text>
            
            {/* Token */}
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenTextLarge} selectable>
                {ottToken}
              </Text>
            </View>

            {/* Debug Info */}
            {console.log('🔍 Rendering OTT section. ottTokenInfo exists?:', ottTokenInfo ? 'YES' : 'NO')}
            {console.log('🔍 ottTokenInfo value:', ottTokenInfo)}

            {/* Extended Token Information */}
            {ottTokenInfo && (
              <View style={styles.tokenInfoContainer}>
                <Text style={styles.tokenInfoTitle}>📋 Información Adicional</Text>
                
                {/* Payment Type */}
                {ottTokenInfo.type && (
                  <View style={styles.tokenInfoRow}>
                    <Text style={styles.tokenInfoLabel}>Tipo de Pago:</Text>
                    <Text style={styles.tokenInfoValue}>{ottTokenInfo.type}</Text>
                  </View>
                )}

                {/* Vaulted Token */}
                {ottTokenInfo.vaultedToken && (
                  <View style={styles.tokenInfoRow}>
                    <Text style={styles.tokenInfoLabel}>Token Guardado:</Text>
                    <Text style={styles.tokenInfoValue} selectable>
                      {ottTokenInfo.vaultedToken}
                    </Text>
                  </View>
                )}

                {/* Card Information */}
                {ottTokenInfo.cardData && (
                  <View style={styles.tokenInfoSection}>
                    <Text style={styles.tokenInfoSectionTitle}>💳 Información de Tarjeta</Text>
                    
                    {ottTokenInfo.cardData.brand && (
                      <View style={styles.tokenInfoRow}>
                        <Text style={styles.tokenInfoLabel}>Marca:</Text>
                        <Text style={styles.tokenInfoValue}>{ottTokenInfo.cardData.brand}</Text>
                      </View>
                    )}
                    
                    {ottTokenInfo.cardData.lfd && (
                      <View style={styles.tokenInfoRow}>
                        <Text style={styles.tokenInfoLabel}>Últimos 4 dígitos:</Text>
                        <Text style={styles.tokenInfoValue}>**** {ottTokenInfo.cardData.lfd}</Text>
                      </View>
                    )}
                    
                    {ottTokenInfo.cardData.type && (
                      <View style={styles.tokenInfoRow}>
                        <Text style={styles.tokenInfoLabel}>Tipo:</Text>
                        <Text style={styles.tokenInfoValue}>{ottTokenInfo.cardData.type}</Text>
                      </View>
                    )}
                    
                    {ottTokenInfo.cardData.holder_name && (
                      <View style={styles.tokenInfoRow}>
                        <Text style={styles.tokenInfoLabel}>Titular:</Text>
                        <Text style={styles.tokenInfoValue}>{ottTokenInfo.cardData.holder_name}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Customer Information */}
                {ottTokenInfo.customer && (
                  <View style={styles.tokenInfoSection}>
                    <Text style={styles.tokenInfoSectionTitle}>👤 Información del Cliente</Text>
                    
                    {(ottTokenInfo.customer.first_name || ottTokenInfo.customer.last_name) && (
                      <View style={styles.tokenInfoRow}>
                        <Text style={styles.tokenInfoLabel}>Nombre:</Text>
                        <Text style={styles.tokenInfoValue}>
                          {ottTokenInfo.customer.first_name} {ottTokenInfo.customer.last_name}
                        </Text>
                      </View>
                    )}
                    
                    {ottTokenInfo.customer.email && (
                      <View style={styles.tokenInfoRow}>
                        <Text style={styles.tokenInfoLabel}>Email:</Text>
                        <Text style={styles.tokenInfoValue}>{ottTokenInfo.customer.email}</Text>
                      </View>
                    )}
                    
                    {ottTokenInfo.customer.document && (
                      <View style={styles.tokenInfoRow}>
                        <Text style={styles.tokenInfoLabel}>Documento:</Text>
                        <Text style={styles.tokenInfoValue}>
                          {ottTokenInfo.customer.document.document_type} {ottTokenInfo.customer.document.document_number}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={handleContinuePayment}
              disabled={isLoading}>
              <Text style={styles.buttonText}>
                ▶️ Continuar Pago con OTT
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sesiones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔑 Sesiones</Text>

          <Text style={styles.inputLabel}>Customer Session:</Text>
          <TextInput
            style={styles.input}
            value={customerSession}
            onChangeText={setCustomerSession}
            placeholder="customer_session_token"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Checkout Session:</Text>
          <TextInput
            style={styles.input}
            value={checkoutSession}
            onChangeText={setCheckoutSession}
            placeholder="checkout_session_token"
            placeholderTextColor="#999"
          />

          <Text style={styles.sectionSubtitle}>Para Payment Lite / Seamless:</Text>

          <Text style={styles.inputLabel}>Payment Method Type *:</Text>
          <TextInput
            style={styles.input}
            value={paymentMethodType}
            onChangeText={setPaymentMethodType}
            placeholder="CARD, PIX, NEQUI, etc."
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Vaulted Token (opcional):</Text>
          <TextInput
            style={styles.input}
            value={vaultedToken}
            onChangeText={setVaultedToken}
            placeholder="token_guardado_12345"
            placeholderTextColor="#999"
          />
        </View>

        {/* Acciones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Acciones</Text>

          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={handleStartPayment}
            disabled={isLoading}>
            <Text style={styles.buttonText}>💳 Iniciar Pago Full</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={handleStartPaymentLite}
            disabled={isLoading || !checkoutSession}>
            <Text style={styles.buttonText}>⚡ Payment Lite</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={handleEnrollment}
            disabled={isLoading || !customerSession}>
            <Text style={styles.buttonText}>📝 Enrollment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={handleSeamlessPayment}
            disabled={isLoading || !checkoutSession}>
            <Text style={styles.buttonText}>🎯 Seamless Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleHideLoader}
            disabled={isLoading}>
            <Text style={styles.buttonTextSecondary}>🚫 Ocultar Loader</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Información</Text>
          <Text style={styles.infoText}>
            El SDK de Yuno ya está inicializado y listo para usar.
          </Text>
          <Text style={styles.infoText}>
            • Ingresa las sesiones necesarias {'\n'}
            • Prueba las diferentes funcionalidades {'\n'}
            • Revisa los logs para más detalles {'\n'}
            • El OTT se mostrará después de un pago
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Yuno SDK React Native v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4E3DD8',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tokenText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#4E3DD8',
    flex: 1,
    textAlign: 'right',
  },
  tokenCard: {
    backgroundColor: '#F0F4FF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4E3DD8',
    shadowColor: '#4E3DD8',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tokenCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4E3DD8',
    marginBottom: 8,
    textAlign: 'center',
  },
  tokenCardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  tokenContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  tokenTextLarge: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#4E3DD8',
    fontWeight: '600',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#2E7D32',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4E3DD8',
    marginTop: 16,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F9F9F9',
    marginBottom: 12,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#4E3DD8',
  },
  actionButton: {
    backgroundColor: '#4E3DD8',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4E3DD8',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
    borderColor: '#CCC',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#4E3DD8',
    fontSize: 15,
    fontWeight: '600',
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1565C0',
    marginBottom: 4,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  tokenInfoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  tokenInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4E3DD8',
    marginBottom: 12,
  },
  tokenInfoSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  tokenInfoSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tokenInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 8,
  },
  tokenInfoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  tokenInfoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
});

export default App;

