/**
 * Main hook to handle the Yuno SDK
 */

import {useState, useCallback, useEffect, useRef} from 'react';
import {Alert} from 'react-native';
import {YunoSdk} from '@yuno-payments/yuno-sdk-react-native';
import {yunoService} from '../services/YunoService';
import {useYunoEvents} from './useYunoEvents';
import {useAppStateForeground} from './useAppStateForeground';
import type {
  YunoPaymentState,
  YunoEnrollmentState,
  OneTimeTokenInfo,
  PaymentConfig,
  PaymentLiteConfig,
  EnrollmentConfig,
} from '../types';

export const useYunoSDK = (
  initialCountryCode: string = 'CO',
  initialConfigJson?: string,
) => {
  // Estado
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('');
  const [ottToken, setOttToken] = useState<string>('');
  const ottTokenRef = useRef(ottToken);
  ottTokenRef.current = ottToken;
  const [ottTokenInfo, setOttTokenInfo] = useState<OneTimeTokenInfo | null>(
    null,
  );

  // Inicialización
  // When initialConfigJson is provided (from native), parse it and initialize the SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        if (initialConfigJson) {
          console.log('🚀 Initializing SDK from native config JSON...');
          const config = JSON.parse(initialConfigJson);
          
          // Extract configuration (same structure as Android)
          const apiKey = config.merchantKeys?.publicKey;
          const country = config.country;
          const language = config.language;
          const cardType = config.options?.cardType || 'ONE_STEP';
          const savedCardEnable = config.options?.savedCardEnable || false;
          const showPaymentStatus = config.options?.showPaymentStatus ?? true;
          
          if (!apiKey || !country) {
            console.error('❌ Missing required fields in config JSON');
            return;
          }
          
          console.log('📋 Initializing with config:', {
            country,
            language,
            cardType,
            savedCardEnable,
            showPaymentStatus,
          });
          
          // Initialize the SDK through yunoService
          await yunoService.initialize({
            apiKey,
            countryCode: country,
            yunoConfig: {
              language: language || 'en',
              cardType,
              savedCardEnable,
              showPaymentStatus,
            },
          });
          
          console.log('✅ SDK initialized successfully from config JSON');
        } else {
          // Fallback: just mark as initialized with country code
          console.log('📱 No config JSON, marking SDK as ready...');
          await yunoService.markAsInitialized(initialCountryCode);
          console.log('✅ SDK marked as initialized with country:', initialCountryCode);
        }
      } catch (error) {
        console.error('❌ Error initializing SDK:', error);
      }
    };

    initSDK();
  }, [initialCountryCode, initialConfigJson]);

  // Manejadores de eventos
  const handlePaymentStatus = useCallback((state: YunoPaymentState) => {
    setPaymentStatus(
      `Status: ${state.status}\nType: ${state.type || 'N/A'}\nMsg: ${
        state.message || 'N/A'
      }`,
    );
  }, []);

  const handleEnrollmentStatus = useCallback((state: YunoEnrollmentState) => {
    setEnrollmentStatus(
      `Status: ${state.status}\nType: ${state.type || 'N/A'}\nMsg: ${
        state.message || 'N/A'
      }`,
    );
  }, []);

  const handleOTT = useCallback((token: string) => {
    setOttToken(token);
  }, []);

  const handleOTTInfo = useCallback((info: OneTimeTokenInfo) => {
    setOttTokenInfo(info);
  }, []);

  // Recuperar OTT cuando la app vuelve al foreground
  const handleForeground = useCallback(async () => {
    try {
      const lastOtt = await yunoService.getLastOTT();
      const lastOttInfo = await yunoService.getLastOTTInfo();

      if (lastOtt && lastOtt !== ottTokenRef.current) {
        console.log('🎉 New OTT found! Updating state...');
        setOttToken(lastOtt);
      }

      if (lastOttInfo) {
        setOttTokenInfo(lastOttInfo);
      }
    } catch (error) {
      console.error('❌ Error retrieving last OTT:', error);
    }
  }, []);

  // Setup de listeners
  useYunoEvents({
    onPaymentStatus: handlePaymentStatus,
    onEnrollmentStatus: handleEnrollmentStatus,
    onOTT: handleOTT,
    onOTTInfo: handleOTTInfo,
  });

  useAppStateForeground({
    onForeground: handleForeground,
  });

  // Métodos de pago
  const startPayment = useCallback(
    async (config: PaymentConfig) => {
      // 🧹 Clear previous status before starting new flow
      setPaymentStatus('');
      setEnrollmentStatus('');
      
      // 🧹 Clear native payment status to prevent stale status from previous flows
      try {
        await YunoSdk.clearLastPaymentStatus();
      } catch (error) {
        console.warn('[useYunoSDK] Failed to clear last payment status:', error);
      }
      
      setIsLoading(true);
      try {
        await yunoService.startPayment(config);
      } catch (error: any) {
        Alert.alert(
          'Error',
          `No se pudo iniciar el pago: ${error.message || 'Error desconocido'}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const startPaymentLite = useCallback(
    async (config: PaymentLiteConfig) => {
      // 🧹 Clear previous status before starting new flow
      setPaymentStatus('');
      setEnrollmentStatus('');
      setIsLoading(true);
      try {
        await yunoService.startPaymentLite(config);
      } catch (error: any) {
        Alert.alert(
          'Error',
          `No se pudo iniciar Payment Lite: ${
            error.message || 'Error desconocido'
          }`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const enrollmentPayment = useCallback(
    async (config: EnrollmentConfig) => {
      // 🧹 Clear previous status before starting new flow
      setPaymentStatus('');
      setEnrollmentStatus('');
      setIsLoading(true);
      try {
        await yunoService.enrollmentPayment(config);
      } catch (error: any) {
        Alert.alert(
          'Error',
          `No se pudo iniciar Enrollment: ${
            error.message || 'Error desconocido'
          }`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const startPaymentSeamlessLite = useCallback(
    async (config: PaymentLiteConfig) => {
      // 🧹 Clear previous status before starting new flow
      setPaymentStatus('');
      setEnrollmentStatus('');
      setIsLoading(true);
      try {
        await yunoService.startPaymentSeamlessLite(config);
      } catch (error: any) {
        Alert.alert(
          'Error',
          `No se pudo iniciar Seamless Payment: ${
            error.message || 'Error desconocido'
          }`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const continuePayment = useCallback(
    async (
      checkoutSession: string,
      countryCode: string,
      showPaymentStatus: boolean = true
    ) => {
      if (!ottTokenRef.current) {
        Alert.alert('Error', 'No hay OTT disponible para continuar el pago');
        return;
      }

      // 🧹 Clear previous status before starting new flow
      setPaymentStatus('');
      setEnrollmentStatus('');
      setIsLoading(true);
      try {
        await yunoService.continuePayment(checkoutSession, countryCode, showPaymentStatus);
      } catch (error: any) {
        Alert.alert(
          'Error',
          `No se pudo continuar el pago: ${
            error.message || 'Error desconocido'
          }`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearOTT = useCallback(async () => {
    try {
      await yunoService.clearLastOTT();
      setOttToken('');
      setOttTokenInfo(null);
    } catch (error: any) {
      Alert.alert(
        'Error',
        `No se pudo limpiar el OTT: ${error.message || 'Error desconocido'}`,
      );
    }
  }, []);

  const clearPaymentStatus = useCallback(() => {
    setPaymentStatus('');
  }, []);

  const clearEnrollmentStatus = useCallback(() => {
    setEnrollmentStatus('');
  }, []);

  return {
    // Estado
    isLoading,
    paymentStatus,
    enrollmentStatus,
    ottToken,
    ottTokenInfo,
    // Métodos
    startPayment,
    startPaymentLite,
    enrollmentPayment,
    startPaymentSeamlessLite,
    continuePayment,
    clearOTT,
    clearPaymentStatus,
    clearEnrollmentStatus,
  };
};

