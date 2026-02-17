/**
 * Yuno SDK Service
 * Encapsulates all Yuno SDK interaction logic
 */

import {YunoSdk} from '@yuno-payments/yuno-sdk-react-native';
import type {
  PaymentConfig,
  PaymentLiteConfig,
  EnrollmentConfig,
} from '../types';

// Local enum definitions (workaround for Metro bundler issue with local SDK)
// These match the SDK's enum values exactly
enum CardFlow {
  ONE_STEP = 'ONE_STEP',
  STEP_BY_STEP = 'STEP_BY_STEP',
}

enum YunoLanguage {
  EN = 'EN',
  ES = 'ES',
  PT = 'PT',
}

class YunoService {
  /**
   * Inicializa el SDK de Yuno con la configuración proporcionada
   */
  async initialize(params: {
    apiKey: string;
    countryCode: string;
    yunoConfig: {
      language?: string;
      cardType?: string;
      savedCardEnable?: boolean;
      showPaymentStatus?: boolean;
    };
  }): Promise<void> {
    console.log('🚀 Initializing Yuno SDK...');
    
    // Map cardType string to CardFlow enum
    let cardFlow: CardFlow = CardFlow.ONE_STEP;
    if (params.yunoConfig.cardType) {
      const cardType = params.yunoConfig.cardType.toUpperCase();
      if (cardType === 'STEP_BY_STEP' || cardType === 'TWO_STEPS' || cardType === 'MULTI_STEP') {
        cardFlow = CardFlow.STEP_BY_STEP;
      }
    }

    console.log('LANGUAGE:', params.yunoConfig.language);
    
    // Pass language as string directly - the SDK will handle the mapping
    await YunoSdk.initialize({
      apiKey: params.apiKey,
      countryCode: params.countryCode,
      yunoConfig: {
        language: params.yunoConfig.language || 'en',
        cardFlow: cardFlow as any,
        saveCardEnabled: params.yunoConfig.savedCardEnable ?? false,
        keepLoader: !(params.yunoConfig.showPaymentStatus ?? true),
      },
    });
    
    console.log('✅ Yuno SDK initialized successfully');
  }
  
  /**
   * Marca el SDK como inicializado (ya fue inicializado en YunoActivity)
   */
  async markAsInitialized(countryCode: string): Promise<void> {
    console.log('✅ Marking SDK as initialized...');
    YunoSdk.markAsInitialized(countryCode, YunoLanguage.ES as any);
    console.log('✅ SDK marked as initialized');
  }

  /**
   * Limpia el último OTT almacenado
   */
  async clearLastOTT(): Promise<void> {
    console.log('🧹 Clearing last OTT...');
    await YunoSdk.clearLastOneTimeToken();
    console.log('✅ Last OTT cleared');
  }

  /**
   * Obtiene el último OTT almacenado
   */
  async getLastOTT(): Promise<string | null> {
    console.log('💾 Retrieving last OTT...');
    const ott = await YunoSdk.getLastOneTimeToken();
    console.log('💾 Retrieved OTT:', ott || 'null');
    return ott;
  }

  /**
   * Obtiene la información completa del último OTT
   */
  async getLastOTTInfo() {
    console.log('💾 Retrieving last OTT Info...');
    const ottInfo = await YunoSdk.getLastOneTimeTokenInfo();
    console.log('💾 Retrieved OTT Info:', ottInfo ? 'YES' : 'NO');
    if (ottInfo) {
      console.log('📋 OTT Info details:', JSON.stringify(ottInfo, null, 2));
    }
    return ottInfo;
  }

  /**
   * Inicia un flujo de pago completo
   * Muestra todos los métodos de pago disponibles
   * NOTA: El checkoutSession debe estar configurado antes en el SDK nativo
   */
  async startPayment(config: PaymentConfig): Promise<void> {
    console.log('💳 Starting full payment flow...');
    console.log('Config:', config);

    // startPayment solo recibe showPaymentStatus
    // El checkoutSession debe haberse configurado previamente
    await YunoSdk.startPayment(config.showPaymentStatus ?? true);

    console.log('✅ Payment flow started');
  }

  /**
   * Inicia un flujo de pago lite
   * Requiere checkoutSession + paymentMethodType
   */
  async startPaymentLite(config: PaymentLiteConfig): Promise<void> {
    console.log('💳 Starting payment lite flow...');
    console.log('Config:', config);

    const methodSelected: any = {
      paymentMethodType: config.paymentMethodType,
    };

    if (config.vaultedToken) {
      methodSelected.vaultedToken = config.vaultedToken;
    }

    const params = {
      checkoutSession: config.checkoutSession,
      methodSelected,
      showPaymentStatus: config.showPaymentStatus ?? true,
    };

    console.log('📦 Params to send:', params);
    await YunoSdk.startPaymentLite(params, config.countryCode);
    console.log('✅ Payment lite flow started');
  }

  /**
   * Inicia un flujo de enrollment
   * Nota: Usa showPaymentStatus del JSON para el parámetro showPaymentStatus del SDK
   */
  async enrollmentPayment(config: EnrollmentConfig): Promise<void> {
    console.log('🔐 Starting enrollment flow...');
    console.log('Config:', JSON.stringify(config, null, 2));
    
    const showPaymentStatus = config.showPaymentStatus ?? true;
    console.log('📋 showPaymentStatus value:', showPaymentStatus);
    console.log('📋 showPaymentStatus typeof:', typeof showPaymentStatus);

    await YunoSdk.enrollmentPayment({
      customerSession: config.customerSession,
      countryCode: config.countryCode,
      showPaymentStatus,
    });

    console.log('✅ Enrollment flow started');
  }

  /**
   * Inicia un flujo de pago seamless
   * Requiere checkoutSession + paymentMethodType
   */
  async startPaymentSeamlessLite(config: PaymentLiteConfig): Promise<void> {
    console.log('💳 Starting seamless payment flow...');
    console.log('Config:', config);

    const methodSelected: any = {
      paymentMethodType: config.paymentMethodType,
    };

    if (config.vaultedToken) {
      methodSelected.vaultedToken = config.vaultedToken;
    }

    const params = {
      checkoutSession: config.checkoutSession,
      countryCode: config.countryCode,
      methodSelected,
      showPaymentStatus: config.showPaymentStatus ?? true,
    };

    console.log('📦 Params to send:', params);
    await YunoSdk.startPaymentSeamlessLite(params);
    console.log('✅ Seamless payment flow started');
  }

  /**
   * Continúa con un pago usando un OTT
   * NOTA: El OTT debe estar ya configurado en el SDK nativo antes de llamar continuePayment
   */
  async continuePayment(
    checkoutSession: string,
    countryCode: string,
    showPaymentStatus: boolean = true
  ): Promise<void> {
    console.log('➡️ Continuing payment...');
    console.log('Checkout Session:', checkoutSession);
    console.log('Country Code:', countryCode);
    console.log('Show Payment Status:', showPaymentStatus);

    await YunoSdk.continuePayment(checkoutSession, countryCode, showPaymentStatus);
    console.log('✅ Continue payment called');
  }
}

// Export singleton instance
export const yunoService = new YunoService();

