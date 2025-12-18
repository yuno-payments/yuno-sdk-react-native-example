/**
 * Yuno SDK Service
 * Encapsulates all Yuno SDK interaction logic
 */

import {
  YunoSdk,
  CardFlow,
  YunoLanguage,
} from '@yuno-payments/yuno-sdk-react-native';
import type {
  PaymentConfig,
  PaymentLiteConfig,
  EnrollmentConfig,
} from '../types';

class YunoService {
  private isInitialized: boolean = false;
  private lastCallTime: number = 0;
  private readonly THROTTLE_MS = 500; // Prevenir llamadas simultáneas

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry utility with exponential backoff
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 100
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          const delayMs = initialDelay * Math.pow(2, attempt);
          console.warn(`⚠️ Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms`);
          await this.delay(delayMs);
        }
      }
    }
    
    throw lastError || new Error('Unknown error in withRetry');
  }

  /**
   * Throttle para prevenir llamadas simultáneas
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.THROTTLE_MS) {
      const waitTime = this.THROTTLE_MS - timeSinceLastCall;
      console.log(`⏳ Throttling: waiting ${waitTime}ms before next call`);
      await this.delay(waitTime);
    }
    
    this.lastCallTime = Date.now();
  }

  /**
   * Asegura que el SDK esté inicializado antes de llamar métodos
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('⚠️ SDK not initialized, waiting 200ms...');
      await this.delay(200);
      // Verificar nuevamente después del delay
      if (!this.isInitialized) {
        throw new Error('SDK must be initialized before calling payment methods');
      }
    }
  }

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
    let cardFlow = CardFlow.ONE_STEP;
    if (params.yunoConfig.cardType) {
      const cardType = params.yunoConfig.cardType.toUpperCase();
      if (cardType === 'STEP_BY_STEP' || cardType === 'TWO_STEPS' || cardType === 'MULTI_STEP') {
        cardFlow = CardFlow.STEP_BY_STEP;
      }
    }

    console.log('LANGUAGE:', params.yunoConfig.language);
    
    await this.withRetry(async () => {
      // Pass language as string directly - the SDK will handle the mapping
      await YunoSdk.initialize({
        apiKey: params.apiKey,
        countryCode: params.countryCode,
        yunoConfig: {
          language: params.yunoConfig.language || 'en',
          cardFlow,
          saveCardEnabled: params.yunoConfig.savedCardEnable ?? false,
          keepLoader: !(params.yunoConfig.showPaymentStatus ?? true),
        },
      });
    });
    
    this.isInitialized = true;
    console.log('✅ Yuno SDK initialized successfully');
  }
  
  /**
   * Marca el SDK como inicializado (ya fue inicializado en YunoActivity)
   */
  async markAsInitialized(countryCode: string): Promise<void> {
    console.log('✅ Marking SDK as initialized...');
    await this.withRetry(async () => {
      YunoSdk.markAsInitialized(countryCode, YunoLanguage.ES);
    });
    this.isInitialized = true;
    console.log('✅ SDK marked as initialized');
  }

  /**
   * Limpia el último OTT almacenado
   */
  async clearLastOTT(): Promise<void> {
    console.log('🧹 Clearing last OTT...');
    await this.withRetry(async () => {
      await YunoSdk.clearLastOneTimeToken();
    });
    console.log('✅ Last OTT cleared');
  }

  /**
   * Obtiene el último OTT almacenado
   */
  async getLastOTT(): Promise<string | null> {
    console.log('💾 Retrieving last OTT...');
    const ott = await this.withRetry(async () => {
      return await YunoSdk.getLastOneTimeToken();
    });
    console.log('💾 Retrieved OTT:', ott || 'null');
    return ott;
  }

  /**
   * Obtiene la información completa del último OTT
   */
  async getLastOTTInfo() {
    console.log('💾 Retrieving last OTT Info...');
    const ottInfo = await this.withRetry(async () => {
      return await YunoSdk.getLastOneTimeTokenInfo();
    });
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

    await this.ensureInitialized();
    await this.throttle();
    
    // Pequeño delay antes de llamar al SDK nativo
    await this.delay(100);

    await this.withRetry(async () => {
      // startPayment solo recibe showPaymentStatus
      // El checkoutSession debe haberse configurado previamente
      await YunoSdk.startPayment(config.showPaymentStatus ?? true);
    });

    console.log('✅ Payment flow started');
  }

  /**
   * Inicia un flujo de pago lite
   * Requiere checkoutSession + paymentMethodType
   */
  async startPaymentLite(config: PaymentLiteConfig): Promise<void> {
    console.log('💳 Starting payment lite flow...');
    console.log('Config:', config);

    await this.ensureInitialized();
    await this.throttle();
    
    // Pequeño delay antes de llamar al SDK nativo
    await this.delay(100);

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
    
    await this.withRetry(async () => {
      await YunoSdk.startPaymentLite(params, config.countryCode);
    });
    
    console.log('✅ Payment lite flow started');
  }

  /**
   * Inicia un flujo de enrollment
   * Nota: Usa showPaymentStatus del JSON para el parámetro showPaymentStatus del SDK
   */
  async enrollmentPayment(config: EnrollmentConfig): Promise<void> {
    console.log('🔐 Starting enrollment flow...');
    console.log('Config:', JSON.stringify(config, null, 2));
    
    await this.ensureInitialized();
    await this.throttle();
    await this.delay(100);
    
    const showPaymentStatus = config.showPaymentStatus ?? true;
    console.log('📋 showPaymentStatus value:', showPaymentStatus);
    console.log('📋 showPaymentStatus typeof:', typeof showPaymentStatus);

    await this.withRetry(async () => {
      await YunoSdk.enrollmentPayment({
        customerSession: config.customerSession,
        countryCode: config.countryCode,
        showPaymentStatus,
      });
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

    await this.ensureInitialized();
    await this.throttle();
    await this.delay(100);

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
    
    await this.withRetry(async () => {
      await YunoSdk.startPaymentSeamlessLite(params);
    });
    
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

    await this.ensureInitialized();
    await this.throttle();
    await this.delay(100);

    await this.withRetry(async () => {
      await YunoSdk.continuePayment(checkoutSession, countryCode, showPaymentStatus);
    });
    
    console.log('✅ Continue payment called');
  }

  /**
   * Limpia el estado del último pago
   */
  async clearLastPaymentStatus(): Promise<void> {
    try {
      await this.withRetry(async () => {
        await YunoSdk.clearLastPaymentStatus();
      });
    } catch (error) {
      console.warn('⚠️ Failed to clear last payment status:', error);
    }
  }
}

// Export singleton instance
export const yunoService = new YunoService();

