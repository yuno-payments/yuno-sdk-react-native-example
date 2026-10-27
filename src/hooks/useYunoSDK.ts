import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, Linking} from 'react-native';
import {
  SdkPayments,
  Transaction,
  type OneTimeToken,
  type PaymentMethodSelected,
  type TransactionController,
  type TransactionProcess,
  type TransactionStatus,
  type YunoViewHandle,
} from '@yuno-payments/yuno-sdk-react-native';
import type {AppConfig, EnrollmentConfig, PaymentConfig, StartOptions} from '../types';

interface PendingPayment {
  resolve: () => void;
  reject: (error: Error) => void;
}

export function parseAppConfig(configJson?: string): AppConfig | null {
  if (!configJson) {
    return null;
  }
  try {
    const config = JSON.parse(configJson);
    const publicKey = config.merchantKeys?.publicKey;
    if (!publicKey || !config.country) {
      return null;
    }
    return {
      publicKey,
      country: config.country,
      language: config.language,
      saveCardEnabled: config.options?.savedCardEnable ?? false,
      showStatusScreen: config.options?.showPaymentStatus ?? true,
    };
  } catch {
    return null;
  }
}

function formatStatus(status: TransactionStatus): string {
  const message = status.message
    ? `${status.message.code ?? ''} ${status.message.reason ?? ''}`.trim()
    : '';
  return `Status: ${status.status}\nSubstatus: ${status.substatus || 'N/A'}\nMsg: ${message || 'N/A'}`;
}

export const useYunoSDK = (configJson?: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoading, setSdkLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState('');
  const [ott, setOtt] = useState<OneTimeToken | null>(null);
  const [listView, setListView] = useState<YunoViewHandle | null>(null);
  const [formView, setFormView] = useState<YunoViewHandle | null>(null);
  const [selected, setSelected] = useState<PaymentMethodSelected | null>(null);
  const transaction = useRef<Transaction | null>(null);
  const process = useRef<TransactionProcess | null>(null);
  const pendingPayment = useRef<PendingPayment | null>(null);
  const appConfig = useRef(parseAppConfig(configJson));

  useEffect(() => {
    appConfig.current = parseAppConfig(configJson);
    const config = appConfig.current;
    if (!config) {
      console.error('❌ Missing merchantKeys.publicKey or country in the config JSON');
      return;
    }
    SdkPayments.initialize(config.publicKey)
      .then(() => {
        console.log('✅ Yuno SDK initialized');
        setIsInitialized(true);
      })
      .catch(error => console.error('❌ Error initializing the Yuno SDK:', error));
  }, [configJson]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => {
      transaction.current?.handleDeeplink(url);
    });
    return () => {
      subscription.remove();
      transaction.current?.dispose();
    };
  }, []);

  const reset = useCallback(() => {
    pendingPayment.current?.reject(new Error('transaction_replaced'));
    pendingPayment.current = null;
    transaction.current?.dispose();
    transaction.current = null;
    process.current = null;
    setListView(null);
    setFormView(null);
    setSelected(null);
    setIsLoading(false);
    setSdkLoading(false);
  }, []);

  const controller = useCallback(
    (onStatus: (status: TransactionStatus) => void, options: StartOptions): TransactionController => ({
      onStatus: status => {
        console.log('📊 Status:', status.status, status.substatus ?? '', JSON.stringify(status.message ?? null));
        pendingPayment.current = null;
        setIsLoading(false);
        setSdkLoading(false);
        setFormView(null);
        setListView(null);
        onStatus(status);
      },
      showLoading: (loading: boolean) => setSdkLoading(loading),
      ...(options.embedded
        ? {
            showView: (view: YunoViewHandle | null, nextProcess: TransactionProcess) => {
              process.current = nextProcess;
              setFormView(view);
            },
          }
        : {}),
      ...(options.createPayment
        ? {
            createPayment: (token: OneTimeToken) =>
              new Promise<void>((resolve, reject) => {
                console.log('🎫 One-time token received');
                pendingPayment.current = {resolve, reject};
                setOtt(token);
              }),
          }
        : {}),
    }),
    [],
  );

  const startPayment = useCallback(
    async (config: PaymentConfig, paymentSelected: PaymentMethodSelected, options: StartOptions) => {
      reset();
      setPaymentStatus('');
      setEnrollmentStatus('');
      setOtt(null);
      const app = appConfig.current;
      try {
        const created = new Transaction({
          countryCode: config.countryCode,
          checkoutSession: config.checkoutSession,
          language: app?.language,
          saveCardEnabled: app?.saveCardEnabled,
          showStatusScreen: app?.showStatusScreen,
          controller: controller(status => setPaymentStatus(formatStatus(status)), options),
        });
        transaction.current = created;
        await created.start(paymentSelected);
      } catch (error: any) {
        Alert.alert('Error', `Could not start the payment: ${error.message || 'Unknown error'}`);
      }
    },
    [controller, reset],
  );

  const showPaymentMethods = useCallback(
    async (config: PaymentConfig) => {
      reset();
      setPaymentStatus('');
      setEnrollmentStatus('');
      setOtt(null);
      const app = appConfig.current;
      try {
        const created = new Transaction({
          countryCode: config.countryCode,
          checkoutSession: config.checkoutSession,
          language: app?.language,
          saveCardEnabled: app?.saveCardEnabled,
          showStatusScreen: app?.showStatusScreen,
          controller: controller(status => setPaymentStatus(formatStatus(status)), {
            createPayment: true,
            embedded: false,
          }),
        });
        transaction.current = created;
        const views = await created.getPaymentMethodsViews([{kind: 'PAYMENT_METHOD_LIST'}], {
          onPaymentSelected: paymentSelected => {
            console.log('💳 Payment method selected:', paymentSelected.type, paymentSelected.selectionSource);
            setSelected(paymentSelected);
          },
        });
        setListView(views[0]?.view ?? null);
      } catch (error: any) {
        Alert.alert('Error', `Could not load the payment methods: ${error.message || 'Unknown error'}`);
      }
    },
    [controller, reset],
  );

  const paySelected = useCallback(async () => {
    if (!selected || !transaction.current) {
      return;
    }
    await transaction.current.start(selected);
  }, [selected]);

  const startEnrollment = useCallback(
    async (config: EnrollmentConfig, paymentSelected: PaymentMethodSelected, options: StartOptions) => {
      reset();
      setPaymentStatus('');
      setEnrollmentStatus('');
      const app = appConfig.current;
      try {
        const created = new Transaction({
          countryCode: config.countryCode,
          customerSession: config.customerSession,
          language: app?.language,
          showStatusScreen: app?.showStatusScreen,
          controller: controller(status => setEnrollmentStatus(formatStatus(status)), options),
        });
        transaction.current = created;
        await created.start(paymentSelected);
      } catch (error: any) {
        Alert.alert('Error', `Could not start the enrollment: ${error.message || 'Unknown error'}`);
      }
    },
    [controller, reset],
  );

  const continuePayment = useCallback(() => {
    if (!pendingPayment.current) {
      Alert.alert('Error', 'There is no payment waiting for the one-time token');
      return;
    }
    setIsLoading(true);
    pendingPayment.current.resolve();
    pendingPayment.current = null;
  }, []);

  const clearOTT = useCallback(() => {
    pendingPayment.current?.reject(new Error('cancelled_by_merchant'));
    pendingPayment.current = null;
    setOtt(null);
  }, []);

  const submitForm = useCallback(() => {
    process.current?.onSubmit();
  }, []);

  return {
    isInitialized,
    isLoading,
    sdkLoading,
    paymentStatus,
    enrollmentStatus,
    ott,
    listView,
    formView,
    selected,
    showPaymentMethods,
    paySelected,
    startPayment,
    startEnrollment,
    continuePayment,
    clearOTT,
    submitForm,
    closeTransaction: reset,
  };
};
