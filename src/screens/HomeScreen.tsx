/**
 * Main application screen
 */

import React, {useState, useCallback, useEffect, useRef} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity, BackHandler, ActivityIndicator, Dimensions} from 'react-native';
import {YunoPaymentMethods, YunoSdk, YunoPaymentForm, YunoEnrollmentForm} from '@yuno-payments/yuno-sdk-react-native';
import type {PaymentMethodSelectedEvent, PaymentMethodErrorEvent, PaymentRenderArguments, EnrollmentRenderArguments} from '@yuno-payments/yuno-sdk-react-native';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
import {useYunoSDK, useTheme} from '../hooks';
import {
  ConfigForm,
  PaymentActions,
  EnrollmentActions,
  OTTDisplay,
  StatusDisplay,
} from '../components';
import {spacing, typography} from '../theme';
import {useTranslation} from '../i18n';
import {yunoApiService} from '../services/YunoApiService';
import type {
  PaymentConfig,
  PaymentLiteConfig,
  EnrollmentConfig,
} from '../types';

interface HomeScreenProps {
  initialCountryCode?: string;
  initialConfigJson?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  initialCountryCode,
  initialConfigJson,
}) => {
  const t = useTranslation();
  const {colors} = useTheme();
  const styles = createStyles(colors);

  // Ref for ScrollView to enable auto-scroll
  const scrollViewRef = useRef<ScrollView>(null);

  // Local state for configuration
  const [countryCode, setCountryCode] = useState('CO');
  const [customerSession, setCustomerSession] = useState('');
  const [checkoutSession, setCheckoutSession] = useState('');
  const [paymentMethodType, setPaymentMethodType] = useState('CARD');
  const [vaultedToken, setVaultedToken] = useState('');
  const [showPaymentStatus, setShowPaymentStatus] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] = useState(false);

  // Payment Render state
  const [isPaymentRenderLoading, setIsPaymentRenderLoading] = useState(false);
  const [paymentRenderToken, setPaymentRenderToken] = useState<string | null>(null);
  const [paymentRenderResult, setPaymentRenderResult] = useState<string | null>(null);
  
  // Embedded Checkout state
  const [showEmbeddedCheckout, setShowEmbeddedCheckout] = useState(false);
  const [isRenderFlowReady, setIsRenderFlowReady] = useState(false);

  // Enrollment Render state
  const [isEnrollmentRenderLoading, setIsEnrollmentRenderLoading] = useState(false);
  const [enrollmentRenderToken, setEnrollmentRenderToken] = useState<string | null>(null);
  const [enrollmentRenderResult, setEnrollmentRenderResult] = useState<string | null>(null);
  const [showEmbeddedEnrollment, setShowEmbeddedEnrollment] = useState(false);
  const [isEnrollmentRenderFlowReady, setIsEnrollmentRenderFlowReady] = useState(false);

  // Order details for checkout display
  const [orderAmount, setOrderAmount] = useState(19);
  const [orderCurrency, setOrderCurrency] = useState('COP');

  // Session generation state
  const [isGeneratingCustomerSession, setIsGeneratingCustomerSession] = useState(false);
  const [isGeneratingCheckoutSession, setIsGeneratingCheckoutSession] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);

  // Process initial configuration from native JSON
  useEffect(() => {
    if (initialCountryCode) {
      console.log('🌍 Setting country code from native:', initialCountryCode);
      setCountryCode(initialCountryCode);
    }

    if (initialConfigJson) {
      try {
        console.log('📋 Parsing config JSON from native...');
        const config = JSON.parse(initialConfigJson);
        
        // Extract showPaymentStatus from JSON
        if (config.options && typeof config.options.showPaymentStatus === 'boolean') {
          console.log('✅ Setting showPaymentStatus from JSON:', config.options.showPaymentStatus);
          setShowPaymentStatus(config.options.showPaymentStatus);
        }
        
        // Extract amount and currency from JSON
        if (config.amount) {
          setOrderAmount(config.amount);
        }
        if (config.currency) {
          setOrderCurrency(config.currency);
        }

        // Configure API service with merchant keys from JSON
        console.log('🔍 Looking for merchant keys in config:', JSON.stringify(config.merchantKeys, null, 2));
        console.log('🔍 AccountId in config:', config.accountId);
        
        if (config.merchantKeys) {
          const publicKey = config.merchantKeys.publicKey;
          // Support both privateKey and secretKey
          const privateKey = config.merchantKeys.privateKey || config.merchantKeys.secretKey;
          // Support accountId, accountCode, or top-level accountId
          const accountId = config.merchantKeys.accountId || config.merchantKeys.accountCode || config.accountId || config.accountCode;
          
          console.log('🔑 Found keys:');
          console.log('  - publicKey exists:', !!publicKey);
          console.log('  - privateKey/secretKey exists:', !!privateKey);
          console.log('  - accountId/accountCode:', accountId);
          
          if (publicKey && privateKey && accountId) {
            console.log('🔑 Configuring API service with merchant keys from JSON');
            yunoApiService.setKeys(publicKey, privateKey, accountId);
            setApiKeysConfigured(true);
          } else {
            console.warn('⚠️ Missing keys in merchantKeys');
            console.warn('  - publicKey:', !!publicKey);
            console.warn('  - privateKey/secretKey:', !!privateKey);
            console.warn('  - accountId/accountCode:', !!accountId);
          }
        } else {
          console.warn('⚠️ No merchantKeys found in config JSON');
        }

        // Log to confirm we have the data
        console.log('📦 Parsed config:', {
          country: config.country,
          language: config.language,
          showPaymentStatus: config.options?.showPaymentStatus,
          cardType: config.options?.cardType,
          savedCardEnable: config.options?.savedCardEnable,
        });
      } catch (error) {
        console.error('❌ Error parsing config JSON:', error);
      }
    }
  }, [initialCountryCode, initialConfigJson]);

  // SDK Hook
  const {
    isLoading,
    paymentStatus,
    enrollmentStatus,
    ottToken,
    ottTokenInfo,
    startPayment,
    startPaymentLite,
    enrollmentPayment,
    startPaymentSeamlessLite,
    continuePayment,
    clearOTT,
    clearPaymentStatus,
    clearEnrollmentStatus,
  } = useYunoSDK(countryCode, initialConfigJson);

  // Effect to return to main view when payment flow finishes
  useEffect(() => {
    // If we're showing payment methods AND we receive a status or token, return to main view
    if (showPaymentMethods && (paymentStatus || ottToken)) {
      console.log('✅ Payment flow completed, returning to main view');
      console.log('📊 Payment Status:', paymentStatus || 'N/A');
      console.log('🎫 OTT Token:', ottToken || 'N/A');
      
      // Small delay to ensure native SDK has fully finished
      setTimeout(() => {
        setShowPaymentMethods(false);
        setIsPaymentMethodSelected(false);
      }, 300);
    }
  }, [showPaymentMethods, paymentStatus, ottToken]);

  // Handle Android "back" button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // If we're showing payment methods, return to main view
        if (showPaymentMethods) {
          console.log('🔙 Back button pressed - Returning to main view');
          setShowPaymentMethods(false);
          setIsPaymentMethodSelected(false);
          return true; // Prevent default behavior (close activity)
        }
        
        // Otherwise, allow default behavior (go to MainActivity)
        console.log('🔙 Back button pressed - Going to previous activity');
        return false;
      },
    );

    // Cleanup: remove listener when component unmounts
    return () => backHandler.remove();
  }, [showPaymentMethods]);

  // Auto-scroll to top when OTT or Status components become visible
  useEffect(() => {
    // Check if we have OTT token or any status to display
    const hasOTT = ottToken && ottToken.trim().length > 0;
    const hasPaymentStatus = paymentStatus && paymentStatus.trim().length > 0;
    const hasEnrollmentStatus = enrollmentStatus && enrollmentStatus.trim().length > 0;
    
    if (hasOTT || hasPaymentStatus || hasEnrollmentStatus) {
      console.log('📜 Auto-scrolling to top to show OTT/Status');
      // Small delay to ensure the components are rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }, 100);
    }
  }, [ottToken, paymentStatus, enrollmentStatus]);

  // Refs for payment data (needed for event listeners)
  const checkoutSessionRef = useRef(checkoutSession);
  const customerSessionRef = useRef(customerSession);
  const customerIdRef = useRef(customerId);
  const orderAmountRef = useRef(orderAmount);
  const orderCurrencyRef = useRef(orderCurrency);
  const countryCodeRef = useRef(countryCode);

  // Keep refs updated
  useEffect(() => {
    checkoutSessionRef.current = checkoutSession;
    customerSessionRef.current = customerSession;
    customerIdRef.current = customerId;
    orderAmountRef.current = orderAmount;
    orderCurrencyRef.current = orderCurrency;
    countryCodeRef.current = countryCode;
  }, [checkoutSession, customerSession, customerId, orderAmount, orderCurrency, countryCode]);

  // Handle payment creation and continuation
  const handleCreatePaymentAndContinue = useCallback(async (token: string) => {
    console.log('💳 Creating payment with OTT...');
    
    if (!checkoutSessionRef.current) {
      console.error('❌ No checkout session available');
      Alert.alert('Error', 'No checkout session available');
      return;
    }

    if (!yunoApiService.isConfigured()) {
      console.error('❌ API keys not configured');
      Alert.alert('Error', 'API keys not configured');
      return;
    }

    try {
      setIsPaymentRenderLoading(true);

      // Step 1: Create payment with the OTT
      console.log('📤 Calling createPayment API...');
      const paymentResponse = await yunoApiService.createPayment({
        checkoutSession: checkoutSessionRef.current,
        token: token,
        customerId: customerIdRef.current || undefined,
        country: countryCodeRef.current || 'CO',
        currency: orderCurrencyRef.current || 'COP',
        amount: orderAmountRef.current || 19,
        description: 'Payment from React Native Example',
        capture: true,
      });

      console.log('✅ Payment created:', paymentResponse.status);

      // Step 2: Call continuePaymentRender to complete the flow
      console.log('📤 Calling continuePaymentRender...');
      await YunoSdk.continuePaymentRender();
      console.log('✅ continuePaymentRender called successfully');

    } catch (error: any) {
      console.error('❌ Error in payment flow:', error);
      Alert.alert('Payment Error', error.message || 'Failed to process payment');
      setIsPaymentRenderLoading(false);
      setShowEmbeddedCheckout(false);
      setIsRenderFlowReady(false);
    }
  }, []);

  // NOTE: For automatic enrollment flow, token handling is done by SDK internally
  // No need for manual createEnrollment API call - SDK handles it automatically

  // Payment Render event listeners
  useEffect(() => {
    console.log('🔌 Setting up Payment Render event listeners...');

    const tokenSubscription = YunoSdk.onPaymentRenderToken(async (token: string) => {
      console.log('🎫 Payment Render Token received:', token.substring(0, 30) + '...');
      setPaymentRenderToken(token);

      // Automatically create payment and continue
      await handleCreatePaymentAndContinue(token);
    });

    const resultSubscription = YunoSdk.onPaymentRenderResult((result: string) => {
      console.log('📊 Payment Render Result:', result);
      setPaymentRenderResult(result);
      setIsPaymentRenderLoading(false);
      setPaymentRenderToken(null);

      // Close embedded checkout
      setShowEmbeddedCheckout(false);
      setIsRenderFlowReady(false);

      if (result === 'SUCCEEDED' || result === 'succeeded') {
        Alert.alert('Success', 'Payment completed successfully!');
      } else if (result === 'FAILED' || result === 'fail') {
        Alert.alert('Error', 'Payment failed. Please try again.');
      } else if (result === 'CANCELLED' || result === 'userCancelled') {
        Alert.alert('Cancelled', 'Payment was cancelled.');
      }
    });

    return () => {
      console.log('🔌 Cleaning up Payment Render event listeners...');
      tokenSubscription.remove();
      resultSubscription.remove();
    };
  }, [handleCreatePaymentAndContinue]);

  // Enrollment Render event listeners (automatic flow - SDK handles token internally)
  useEffect(() => {
    console.log('🔌 Setting up Enrollment Render event listeners...');

    // Note: No token subscription needed - SDK handles token automatically
    const resultSubscription = YunoSdk.onEnrollmentRenderResult((result: string) => {
      console.log('📊 Enrollment Render Result:', result);
      setEnrollmentRenderResult(result);
      setIsEnrollmentRenderLoading(false);
      setEnrollmentRenderToken(null);

      // Close embedded enrollment
      setShowEmbeddedEnrollment(false);
      setIsEnrollmentRenderFlowReady(false);

      if (result === 'SUCCEEDED' || result === 'succeeded') {
        Alert.alert('Success', 'Card saved successfully!');
      } else if (result === 'FAILED' || result === 'fail') {
        Alert.alert('Error', 'Failed to save card. Please try again.');
      } else if (result === 'CANCELLED' || result === 'userCancelled') {
        Alert.alert('Cancelled', 'Card enrollment was cancelled.');
      }
    });

    return () => {
      console.log('🔌 Cleaning up Enrollment Render event listeners...');
      resultSubscription.remove();
    };
  }, []);

  // Required fields validation
  const validateRequiredFields = useCallback(
    (requireCheckout: boolean = true): boolean => {
      if (!customerSession.trim()) {
        return false;
      }
      if (requireCheckout && !checkoutSession.trim()) {
        return false;
      }
      return true;
    },
    [customerSession, checkoutSession],
  );

  // Handlers
  const handleStartPayment = useCallback(() => {
    console.log('🔵 handleStartPayment called - Showing Payment Methods');
    console.log('📋 checkoutSession:', checkoutSession || '(empty)');
    
    // Payment only requires checkoutSession
    if (!checkoutSession.trim()) {
      Alert.alert(t.payment.requiredFields, `${t.payment.pleaseEnter}: ${t.config.checkoutSession}`);
      return;
    }

    // Clear old payment status to prevent useEffect from closing the modal with stale status
    clearPaymentStatus();
    clearEnrollmentStatus();

    console.log('✅ Showing payment methods component');
    setShowPaymentMethods(true);
  }, [checkoutSession, t, clearPaymentStatus, clearEnrollmentStatus]);

  const handleStartPaymentLite = useCallback(() => {
    console.log('🔵 handleStartPaymentLite called');
    console.log('📋 checkoutSession:', checkoutSession || '(empty)');
    console.log('📋 paymentMethodType:', paymentMethodType || '(empty)');
    
    // Payment Lite requires checkoutSession + paymentMethodType
    const missingFields = [];
    if (!checkoutSession.trim()) missingFields.push(t.config.checkoutSession);
    if (!paymentMethodType.trim()) missingFields.push(t.config.paymentMethodType);
    
    if (missingFields.length > 0) {
      Alert.alert(
        t.payment.requiredFields,
        `${t.payment.pleaseEnter}: ${missingFields.join(', ')}`,
      );
      return;
    }

    const config: PaymentLiteConfig = {
      checkoutSession,
      countryCode,
      paymentMethodType,
      vaultedToken: vaultedToken || undefined,
      showPaymentStatus,
    };

    console.log('✅ Calling startPaymentLite with config:', config);
    startPaymentLite(config);
  }, [
    checkoutSession,
    countryCode,
    paymentMethodType,
    vaultedToken,
    showPaymentStatus,
    startPaymentLite,
    t,
  ]);

  const handleEnrollment = useCallback(() => {
    console.log('🔵 handleEnrollment called');
    console.log('📋 customerSession:', customerSession || '(empty)');
    console.log('📋 showPaymentStatus (state):', showPaymentStatus);
    console.log('📋 showPaymentStatus (typeof):', typeof showPaymentStatus);
    
    // Enrollment only requires customerSession
    if (!customerSession.trim()) {
      Alert.alert(t.enrollment.requiredFields, `${t.enrollment.pleaseEnter}: ${t.config.customerSession}`);
      return;
    }

    const config: EnrollmentConfig = {
      customerSession,
      countryCode,
      showPaymentStatus, // Reuse showPaymentStatus from JSON
    };

    console.log('✅ Calling enrollmentPayment with config:', JSON.stringify(config, null, 2));
    enrollmentPayment(config);
  }, [customerSession, countryCode, showPaymentStatus, enrollmentPayment, t]);

  const handleSeamlessPayment = useCallback(() => {
    console.log('🔵 handleSeamlessPayment called');
    console.log('📋 checkoutSession:', checkoutSession || '(empty)');
    console.log('📋 paymentMethodType:', paymentMethodType || '(empty)');
    
    // Seamless Payment requires checkoutSession + paymentMethodType
    const missingFields = [];
    if (!checkoutSession.trim()) missingFields.push(t.config.checkoutSession);
    if (!paymentMethodType.trim()) missingFields.push(t.config.paymentMethodType);
    
    if (missingFields.length > 0) {
      Alert.alert(
        t.payment.requiredFields,
        `${t.payment.pleaseEnter}: ${missingFields.join(', ')}`,
      );
      return;
    }

    const config: PaymentLiteConfig = {
      checkoutSession,
      countryCode,
      paymentMethodType,
      vaultedToken: vaultedToken || undefined,
      showPaymentStatus,
    };

    console.log('✅ Calling startPaymentSeamlessLite with config:', config);
    startPaymentSeamlessLite(config);
  }, [
    checkoutSession,
    countryCode,
    paymentMethodType,
    vaultedToken,
    showPaymentStatus,
    startPaymentSeamlessLite,
    t,
  ]);

  const handleContinuePayment = useCallback(() => {
    continuePayment(checkoutSession, countryCode, showPaymentStatus);
  }, [checkoutSession, countryCode, showPaymentStatus, continuePayment]);

  // Handler for Payment Render - Opens embedded checkout view
  const handlePaymentRender = useCallback(async () => {
    console.log('🔵 handlePaymentRender called - Starting render flow with embedded checkout');

    // Requires checkoutSession and paymentMethodType
    const missingFields: string[] = [];
    if (!checkoutSession.trim()) missingFields.push(t.config.checkoutSession);
    if (!paymentMethodType.trim()) missingFields.push(t.config.paymentMethodType);

    if (missingFields.length > 0) {
      Alert.alert(
        t.payment.requiredFields,
        `${t.payment.pleaseEnter}: ${missingFields.join(', ')}`,
      );
      return;
    }

    // Reset state
    setPaymentRenderToken(null);
    setPaymentRenderResult(null);
    setIsPaymentRenderLoading(true);

    try {
      const params: PaymentRenderArguments = {
        checkoutSession,
        countryCode,
        paymentMethodType,
        vaultedToken: vaultedToken.trim() || null,
      };

      console.log('✅ Starting Payment Render Flow with params:', params);

      // Step 1: Start the payment render flow
      const response = await YunoSdk.startPaymentRenderFlow(params);
      console.log('✅ startPaymentRenderFlow response:', response);

      if (response.success) {
        console.log('✅ Payment render flow started, showing embedded checkout');
        setIsRenderFlowReady(true);
        setShowEmbeddedCheckout(true);
        setIsPaymentRenderLoading(false);
      } else {
        throw new Error('Failed to start payment render flow');
      }
    } catch (error: any) {
      console.error('❌ Payment Render error:', error);
      Alert.alert('Error', error.message || 'Failed to start payment render flow');
      setIsPaymentRenderLoading(false);
    }
  }, [checkoutSession, countryCode, paymentMethodType, vaultedToken, t]);

  // Handler for Enrollment Render - Opens embedded enrollment view
  const handleStartEnrollmentRender = useCallback(async () => {
    console.log('🔵 handleStartEnrollmentRender called - Starting enrollment render flow');

    // Requires customerSession and paymentMethodType
    const missingFields: string[] = [];
    if (!customerSession.trim()) missingFields.push(t.config.customerSession);
    if (!paymentMethodType.trim()) missingFields.push(t.config.paymentMethodType);

    if (missingFields.length > 0) {
      Alert.alert(
        t.enrollment.requiredFields,
        `${t.enrollment.pleaseEnter}: ${missingFields.join(', ')}`,
      );
      return;
    }

    // Reset state
    setEnrollmentRenderToken(null);
    setEnrollmentRenderResult(null);
    setIsEnrollmentRenderLoading(true);

    try {
      const params: EnrollmentRenderArguments = {
        customerSession,
        countryCode,
        paymentMethodType,
        vaultedToken: vaultedToken.trim() || null,
      };

      console.log('✅ Starting Enrollment Render Flow with params:', params);

      // Step 1: Start the enrollment render flow
      const response = await YunoSdk.startEnrollmentRenderFlow(params);
      console.log('✅ startEnrollmentRenderFlow response:', response);

      if (response.success) {
        console.log('✅ Enrollment render flow started, showing embedded enrollment');
        setIsEnrollmentRenderFlowReady(true);
        setShowEmbeddedEnrollment(true);
        setIsEnrollmentRenderLoading(false);
      } else {
        throw new Error('Failed to start enrollment render flow');
      }
    } catch (error: any) {
      console.error('❌ Enrollment Render error:', error);
      Alert.alert('Error', error.message || 'Failed to start enrollment render flow');
      setIsEnrollmentRenderLoading(false);
    }
  }, [customerSession, countryCode, paymentMethodType, vaultedToken, t]);

  // Handle form ready event
  const handleFormReady = useCallback(() => {
    console.log('✅ Payment form is ready');
  }, []);

  // Handle form submit event
  const handleFormSubmit = useCallback(() => {
    console.log('📤 Payment form submitted');
  }, []);

  // Handle form error event
  const handleFormError = useCallback((event: {message: string}) => {
    console.error('❌ Payment form error:', event.message);
    Alert.alert('Form Error', event.message);
    setShowEmbeddedCheckout(false);
    setIsRenderFlowReady(false);
  }, []);

  // Handle close embedded checkout
  const handleCloseEmbeddedCheckout = useCallback(() => {
    console.log('🔙 Closing embedded checkout');
    setShowEmbeddedCheckout(false);
    setIsRenderFlowReady(false);
  }, []);

  // Handle enrollment form ready event
  const handleEnrollmentFormReady = useCallback(() => {
    console.log('✅ Enrollment form is ready');
  }, []);

  // Handle enrollment form submit event
  const handleEnrollmentFormSubmit = useCallback(() => {
    console.log('📤 Enrollment form submitted');
  }, []);

  // Handle enrollment form error event
  const handleEnrollmentFormError = useCallback((event: {message: string}) => {
    console.error('❌ Enrollment form error:', event.message);
    Alert.alert('Form Error', event.message);
    setShowEmbeddedEnrollment(false);
    setIsEnrollmentRenderFlowReady(false);
  }, []);

  // Handle close embedded enrollment
  const handleCloseEmbeddedEnrollment = useCallback(() => {
    console.log('🔙 Closing embedded enrollment');
    setShowEmbeddedEnrollment(false);
    setIsEnrollmentRenderFlowReady(false);
  }, []);

  // Helper to ensure customer exists
  const ensureCustomerExists = useCallback(async (): Promise<string> => {
    if (customerId) {
      return customerId;
    }
    
    console.log('🔵 Creating new customer...');
    const customer = await yunoApiService.createCustomer({
      country: countryCode || 'CO',
      document: {
        documentType: 'CC',
        documentNumber: '123456789',
      },
    });
    
    console.log('✅ Customer created:', customer.id);
    setCustomerId(customer.id);
    return customer.id;
  }, [customerId, countryCode]);

  // Generate checkout session (creates customer if needed)
  const handleGenerateCheckoutSession = useCallback(async () => {
    if (!yunoApiService.isConfigured()) {
      Alert.alert(
        'API Keys Required',
        'To generate sessions, the JSON config must include:\n\n' +
        '• merchantKeys.publicKey\n' +
        '• merchantKeys.privateKey\n' +
        '• merchantKeys.accountId (or accountId)'
      );
      return;
    }

    console.log('🔵 Generating checkout session...');
    console.log('🔑 Current API keys:', yunoApiService.getKeys());
    setIsGeneratingCheckoutSession(true);

    try {
      const custId = await ensureCustomerExists();
      
      const result = await yunoApiService.createCheckoutSession({
        customerId: custId,
        country: countryCode || 'CO',
      });
      
      console.log('✅ Checkout session generated:', result);
      setCheckoutSession(result.checkout_session);
    } catch (error: any) {
      console.error('❌ Error generating checkout session:', error);
      Alert.alert('Error', error.message || 'Failed to generate checkout session');
    } finally {
      setIsGeneratingCheckoutSession(false);
    }
  }, [ensureCustomerExists, countryCode]);

  // Generate customer session (creates customer if needed)
  const handleGenerateCustomerSession = useCallback(async () => {
    if (!yunoApiService.isConfigured()) {
      Alert.alert(
        'API Keys Required',
        'To generate sessions, the JSON config must include:\n\n' +
        '• merchantKeys.publicKey\n' +
        '• merchantKeys.privateKey\n' +
        '• merchantKeys.accountId (or accountId)'
      );
      return;
    }

    console.log('🔵 Generating customer session...');
    setIsGeneratingCustomerSession(true);

    try {
      const custId = await ensureCustomerExists();
      
      const result = await yunoApiService.createCustomerSession({
        customerId: custId,
        country: countryCode || 'CO',
      });
      
      console.log('✅ Customer session generated:', result);
      setCustomerSession(result.customer_session);
    } catch (error: any) {
      console.error('❌ Error generating customer session:', error);
      Alert.alert('Error', error.message || 'Failed to generate customer session');
    } finally {
      setIsGeneratingCustomerSession(false);
    }
  }, [ensureCustomerExists, countryCode]);


  // Handler to continue Payment Render after token received
  const handleContinuePaymentRender = useCallback(async () => {
    try {
      setIsPaymentRenderLoading(true);
      console.log('🔄 Continuing payment render flow...');

      const result = await YunoSdk.continuePaymentRender();
      console.log('✅ continuePaymentRender response:', result);
    } catch (error: any) {
      console.error('❌ Continue payment render error:', error);
      Alert.alert('Error', error.message || 'Failed to continue payment');
      setIsPaymentRenderLoading(false);
    }
  }, []);

  // Handler to clear Payment Render state
  const handleClearPaymentRender = useCallback(() => {
    setPaymentRenderToken(null);
    setPaymentRenderResult(null);
    setIsPaymentRenderLoading(false);
  }, []);

  // Handler for when a payment method is selected
  const handlePaymentMethodSelected = useCallback(
    (event: PaymentMethodSelectedEvent) => {
      console.log('💳 Payment method selected:', event);
      setIsPaymentMethodSelected(event.isSelected);
    },
    []
  );

  // Handler for errors in payment methods component
  const handlePaymentMethodError = useCallback((event: PaymentMethodErrorEvent) => {
    console.error('❌ Payment method error:', event);
    Alert.alert('Error', `Could not load payment methods: ${event.message}`, [
      {text: 'OK'},
    ]);
  }, []);

  // Handler to go back from payment methods component
  const handleBackFromPaymentMethods = useCallback(() => {
    console.log('🔙 Going back from payment methods');
    setShowPaymentMethods(false);
    setIsPaymentMethodSelected(false);
  }, []);

  // Handler for "Pay" button (Payment Full Flow)
  const handlePayButtonPress = useCallback(() => {
    console.log('🔵 handlePayButtonPress called (Payment Full)');
    console.log('📋 checkoutSession:', checkoutSession);
    console.log('📋 countryCode:', countryCode);
    console.log('📋 showPaymentStatus:', showPaymentStatus);

    // No need to validate because it was already validated when showing the list
    const config: PaymentConfig = {
      checkoutSession,
      countryCode,
      showPaymentStatus,
    };

    console.log('✅ Calling startPayment with config:', config);
    startPayment(config);
  }, [checkoutSession, countryCode, showPaymentStatus, startPayment]);

  // If checkout view is being shown (Payment Render with embedded payment methods)
  // If payment methods are being shown, render the component
  if (showPaymentMethods) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t.paymentMethods.title}</Text>
          <Text style={styles.subtitle}>{t.paymentMethods.subtitle}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>{t.paymentMethods.checkoutSession}:</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {checkoutSession}
          </Text>
          <Text style={styles.infoLabel}>{t.paymentMethods.country}:</Text>
          <Text style={styles.infoValue}>{countryCode}</Text>
        </View>

        {/* Flex container that takes all available space */}
        <View style={styles.paymentMethodsWrapper}>
          <YunoPaymentMethods
            testID="yuno-payment-methods-view"
            checkoutSession={checkoutSession}
            countryCode={countryCode}
            onPaymentMethodSelected={handlePaymentMethodSelected}
            onPaymentMethodError={handlePaymentMethodError}
            style={styles.paymentMethods}
          />
        </View>

        {isPaymentMethodSelected && (
          <TouchableOpacity
            testID="button-pay"
            style={styles.payButton}
            onPress={handlePayButtonPress}
            activeOpacity={0.7}>
            <Text style={styles.payButtonText}>{t.paymentMethods.payButton}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          testID="button-back"
          style={styles.backButton}
          onPress={handleBackFromPaymentMethods}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>{t.paymentMethods.backButton}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Embedded Checkout view for Payment Render - Simulated E-commerce Checkout
  if (showEmbeddedCheckout && isRenderFlowReady) {
    return (
      <SafeAreaView style={styles.checkoutContainer}>
        {/* Checkout Header */}
        <View style={styles.checkoutHeader}>
          <TouchableOpacity
            onPress={handleCloseEmbeddedCheckout}
            style={styles.closeButton}
            activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.checkoutHeaderCenter}>
            <Text style={styles.checkoutTitle}>Checkout</Text>
          </View>
          <View style={styles.closeButton}>
            <Text style={styles.stepIndicator}>2/2</Text>
          </View>
        </View>

        <ScrollView
          style={styles.checkoutScrollView}
          contentContainerStyle={styles.checkoutScrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Order Summary Card */}
          <View style={styles.orderSummaryCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderHeaderTitle}>Order Summary</Text>
              <Text style={styles.orderHeaderSubtitle}>1 item</Text>
            </View>

            {/* Product Item */}
            <View style={styles.productItem}>
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>📦</Text>
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.productName}>Premium Subscription</Text>
                <Text style={styles.productDescription}>Monthly plan - Auto-renewal</Text>
              </View>
              <Text style={styles.productPrice}>${orderAmount.toLocaleString()}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Price Breakdown */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>${orderAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (0%)</Text>
              <Text style={styles.priceValue}>$0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${orderAmount.toLocaleString()} {orderCurrency}</Text>
            </View>
          </View>

          {/* Payment Method Section */}
          <View style={styles.paymentSection}>
            <View style={styles.paymentSectionHeader}>
              <Text style={styles.paymentSectionTitle}>💳 Payment Method</Text>
              <View style={styles.secureTag}>
                <Text style={styles.secureTagText}>🔒 Secure</Text>
              </View>
            </View>

            {/* Embedded Payment Form */}
            <View style={styles.paymentFormWrapper}>
              <YunoPaymentForm
                checkoutSession={checkoutSession}
                countryCode={countryCode}
                paymentMethodType={paymentMethodType}
                vaultedToken={vaultedToken || null}
                onReady={handleFormReady}
                onSubmit={handleFormSubmit}
                onError={handleFormError}
                style={styles.embeddedForm}
              />
            </View>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustBadges}>
            <View style={styles.trustBadge}>
              <Text style={styles.trustIcon}>🔐</Text>
              <Text style={styles.trustText}>256-bit SSL</Text>
            </View>
            <View style={styles.trustBadge}>
              <Text style={styles.trustIcon}>✓</Text>
              <Text style={styles.trustText}>PCI Compliant</Text>
            </View>
            <View style={styles.trustBadge}>
              <Text style={styles.trustIcon}>🛡️</Text>
              <Text style={styles.trustText}>Secure Payment</Text>
            </View>
          </View>

          {/* Powered By */}
          <View style={styles.poweredBy}>
            <Text style={styles.poweredByText}>Powered by</Text>
            <Text style={styles.poweredByLogo}>YUNO</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Embedded Enrollment view for Enrollment Render
  if (showEmbeddedEnrollment && isEnrollmentRenderFlowReady) {
    return (
      <SafeAreaView style={styles.checkoutContainer}>
        {/* Enrollment Header */}
        <View style={styles.checkoutHeader}>
          <TouchableOpacity
            onPress={handleCloseEmbeddedEnrollment}
            style={styles.closeButton}
            activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.checkoutHeaderCenter}>
            <Text style={styles.checkoutTitle}>Save Card</Text>
          </View>
          <View style={styles.closeButton}>
            <Text style={styles.stepIndicator}>1/1</Text>
          </View>
        </View>

        <ScrollView
          style={styles.checkoutScrollView}
          contentContainerStyle={styles.checkoutScrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Enrollment Info Card */}
          <View style={styles.orderSummaryCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderHeaderTitle}>Save Payment Method</Text>
              <Text style={styles.orderHeaderSubtitle}>For faster checkout</Text>
            </View>

            {/* Enrollment Description */}
            <View style={styles.productItem}>
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>💳</Text>
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.productName}>Secure Card Storage</Text>
                <Text style={styles.productDescription}>Save your card details for quick and easy future payments</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Benefits */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>✓ Faster checkout</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>✓ Secure encryption</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>✓ Easy management</Text>
            </View>
          </View>

          {/* Enrollment Form Section */}
          <View style={styles.paymentSection}>
            <View style={styles.paymentSectionHeader}>
              <Text style={styles.paymentSectionTitle}>💳 Card Details</Text>
              <View style={styles.secureTag}>
                <Text style={styles.secureTagText}>🔒 Secure</Text>
              </View>
            </View>

            {/* Embedded Enrollment Form */}
            <View style={styles.paymentFormWrapper}>
              <YunoEnrollmentForm
                customerSession={customerSession}
                countryCode={countryCode}
                paymentMethodType={paymentMethodType}
                vaultedToken={vaultedToken || null}
                onReady={handleEnrollmentFormReady}
                onSubmit={handleEnrollmentFormSubmit}
                onError={handleEnrollmentFormError}
                style={styles.embeddedForm}
              />
            </View>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustBadges}>
            <View style={styles.trustBadge}>
              <Text style={styles.trustIcon}>🔐</Text>
              <Text style={styles.trustText}>256-bit SSL</Text>
            </View>
            <View style={styles.trustBadge}>
              <Text style={styles.trustIcon}>✓</Text>
              <Text style={styles.trustText}>PCI Compliant</Text>
            </View>
            <View style={styles.trustBadge}>
              <Text style={styles.trustIcon}>🛡️</Text>
              <Text style={styles.trustText}>Secure Storage</Text>
            </View>
          </View>

          {/* Powered By */}
          <View style={styles.poweredBy}>
            <Text style={styles.poweredByText}>Powered by</Text>
            <Text style={styles.poweredByLogo}>YUNO</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Normal form view
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.app.title}</Text>
        <Text style={styles.subtitle}>{t.app.subtitle}</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentInsetAdjustmentBehavior="automatic">
        <OTTDisplay
          token={ottToken}
          tokenInfo={ottTokenInfo}
          checkoutSession={checkoutSession}
          onContinuePayment={handleContinuePayment}
          onClear={clearOTT}
          loading={isLoading}
        />

        <StatusDisplay
          paymentStatus={paymentStatus}
          enrollmentStatus={enrollmentStatus}
        />

        {/* Payment Render Token Display */}
        {paymentRenderToken && (
          <View style={styles.paymentRenderCard}>
            <Text style={styles.paymentRenderTitle}>🎫 Payment Render Token</Text>
            <Text style={styles.paymentRenderToken} selectable numberOfLines={3}>
              {paymentRenderToken}
            </Text>
            <Text style={styles.paymentRenderHint}>
              Send this token to your backend to create the payment
            </Text>
            <TouchableOpacity
              style={styles.continueRenderButton}
              onPress={handleContinuePaymentRender}
              disabled={isPaymentRenderLoading}
              activeOpacity={0.7}>
              {isPaymentRenderLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.continueRenderButtonText}>Continue Payment</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearRenderButton}
              onPress={handleClearPaymentRender}
              activeOpacity={0.7}>
              <Text style={styles.clearRenderButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Render Result Display */}
        {paymentRenderResult && !paymentRenderToken && (
          <View style={[
            styles.paymentRenderResultCard,
            paymentRenderResult.toLowerCase() === 'succeeded' && styles.resultSuccess,
            (paymentRenderResult.toLowerCase() === 'fail' || paymentRenderResult.toLowerCase() === 'failed') && styles.resultError,
          ]}>
            <Text style={styles.paymentRenderResultTitle}>Payment Render Result</Text>
            <Text style={styles.paymentRenderResultValue}>{paymentRenderResult}</Text>
            <TouchableOpacity
              style={styles.clearRenderButton}
              onPress={handleClearPaymentRender}
              activeOpacity={0.7}>
              <Text style={styles.clearRenderButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <ConfigForm
          customerSession={customerSession}
          checkoutSession={checkoutSession}
          paymentMethodType={paymentMethodType}
          vaultedToken={vaultedToken}
          onCustomerSessionChange={setCustomerSession}
          onCheckoutSessionChange={setCheckoutSession}
          onPaymentMethodTypeChange={setPaymentMethodType}
          onVaultedTokenChange={setVaultedToken}
          onGenerateCustomerSession={handleGenerateCustomerSession}
          onGenerateCheckoutSession={handleGenerateCheckoutSession}
          isGeneratingCustomerSession={isGeneratingCustomerSession}
          isGeneratingCheckoutSession={isGeneratingCheckoutSession}
          canGenerateSessions={apiKeysConfigured}
        />

        <PaymentActions
          onStartPayment={handleStartPayment}
          onStartPaymentLite={handleStartPaymentLite}
          onSeamlessPayment={handleSeamlessPayment}
          onPaymentRender={handlePaymentRender}
          loading={isLoading || isPaymentRenderLoading}
        />

        <EnrollmentActions
          onEnrollment={handleEnrollment}
          onStartEnrollmentRender={handleStartEnrollmentRender}
          loading={isLoading || isEnrollmentRenderLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.headerBackground,  // White in light, black in dark
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.headerText,                  // Black in light, white in dark
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.headerText,                  // Black in light, white in dark
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  infoContainer: {
    backgroundColor: colors.card,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.elevation,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  paymentMethodsWrapper: {
    flex: 1,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
  },
  paymentMethods: {
    flex: 1,
  },
  payButton: {
    backgroundColor: colors.text,      // neutralB (black in light, white in dark)
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.elevation,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textInverse,         // neutralW (white in light, black in dark)
  },
  backButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.elevation,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,                // neutralB (black in light, white in dark)
  },
  // Payment Render styles
  paymentRenderCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  paymentRenderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  paymentRenderToken: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  paymentRenderHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  continueRenderButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  continueRenderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  clearRenderButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearRenderButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  paymentRenderResultCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  resultSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: colors.success,
  },
  resultError: {
    backgroundColor: '#FFEBEE',
    borderColor: colors.error,
  },
  paymentRenderResultTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  paymentRenderResultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  
  // Checkout View Styles
  checkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.headerBackground,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backArrowButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrowText: {
    fontSize: 24,
    color: colors.primary1,
    fontWeight: '600',
  },
  checkoutHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.headerText,
  },
  checkoutContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  paymentMethodCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.elevation,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodType: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentMethodSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  embeddedFormContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    minHeight: 350,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  embeddedForm: {
    flex: 1,
    minHeight: 350,
  },
  // Checkout Container Styles
  checkoutContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  checkoutScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  stepIndicator: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Order Summary Card
  orderSummaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  orderHeaderSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  productEmoji: {
    fontSize: 28,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary1,
  },
  // Payment Section
  paymentSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  secureTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  secureTagText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  paymentFormWrapper: {
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 300,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  // Trust Badges
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  trustBadge: {
    alignItems: 'center',
  },
  trustIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  trustText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Powered By
  poweredBy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  poweredByText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 6,
  },
  poweredByLogo: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary1,
    letterSpacing: 1,
  },
  formLoadingContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  formLoadingText: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.textSecondary,
  },
  checkoutPayButton: {
    backgroundColor: colors.primary1,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary1,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutPayButtonDisabled: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0.1,
  },
  checkoutPayButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkoutPayButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  checkoutResultCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkoutResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  checkoutResultText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  securityInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  securityText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  
  // Embedded Checkout Styles
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  checkoutHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  checkoutSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    zIndex: 10,
  },
  paymentForm: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  hidden: {
    opacity: 0,
  },
  checkoutFooter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  checkoutScrollView: {
    flex: 1,
  },
  checkoutCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  checkoutCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  checkoutCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  checkoutCardValueSmall: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.secondary2,
    borderRadius: 8,
  },
  securityBadgeIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  securityBadgeText: {
    fontSize: 13,
    color: colors.tertiary1,
    fontWeight: '500',
  },
});

