/**
 * Hook principal para manejar el SDK de Yuno
 */

import {useState, useCallback, useEffect} from 'react';
import {Alert} from 'react-native';
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

export const useYunoSDK = (initialCountryCode: string = 'CO') => {
  // Estado
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('');
  const [ottToken, setOttToken] = useState<string>('');
  const [ottTokenInfo, setOttTokenInfo] = useState<OneTimeTokenInfo | null>(
    null,
  );

  // Inicialización
  useEffect(() => {
    const initSDK = async () => {
      try {
        await yunoService.markAsInitialized(initialCountryCode);
      } catch (error) {
        console.error('❌ Error initializing SDK:', error);
      }
    };

    initSDK();
  }, [initialCountryCode]);

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

      if (lastOtt && lastOtt !== ottToken) {
        console.log('🎉 New OTT found! Updating state...');
        setOttToken(lastOtt);
      }

      if (lastOttInfo) {
        setOttTokenInfo(lastOttInfo);
      }
    } catch (error) {
      console.error('❌ Error retrieving last OTT:', error);
    }
  }, [ottToken]);

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
    async (checkoutSession: string, countryCode: string) => {
      if (!ottToken) {
        Alert.alert('Error', 'No hay OTT disponible para continuar el pago');
        return;
      }

      setIsLoading(true);
      try {
        await yunoService.continuePayment(checkoutSession, countryCode);
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
    [ottToken],
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
  };
};

