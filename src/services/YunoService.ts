/**
 * Yuno SDK Service
 * Encapsula toda la lógica de interacción con el SDK de Yuno
 */

import {
  YunoSdk,
  YunoLanguage,
  CardFlow,
} from '@yuno/yuno-sdk-react-native';
import type {
  PaymentConfig,
  PaymentLiteConfig,
  EnrollmentConfig,
} from '../types';

class YunoService {
  /**
   * Marca el SDK como inicializado (ya fue inicializado en YunoActivity)
   */
  async markAsInitialized(countryCode: string): Promise<void> {
    console.log('✅ Marking SDK as initialized...');
    YunoSdk.markAsInitialized(countryCode, YunoLanguage.ES);
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
   */
  async startPayment(config: PaymentConfig): Promise<void> {
    console.log('💳 Starting full payment flow...');
    console.log('Config:', config);

    await YunoSdk.startPayment(
      {
        customerSession: config.customerSession,
        checkoutSession: config.checkoutSession,
      },
      config.countryCode,
    );

    console.log('✅ Payment flow started');
  }

  /**
   * Inicia un flujo de pago lite
   */
  async startPaymentLite(config: PaymentLiteConfig): Promise<void> {
    console.log('💳 Starting payment lite flow...');
    console.log('Config:', config);

    const params: any = {
      customerSession: config.customerSession,
      checkoutSession: config.checkoutSession,
      paymentMethodType: config.paymentMethodType,
    };

    if (config.vaultedToken) {
      params.vaultedToken = config.vaultedToken;
    }

    await YunoSdk.startPaymentLite(params, config.countryCode);
    console.log('✅ Payment lite flow started');
  }

  /**
   * Inicia un flujo de enrollment
   */
  async enrollmentPayment(config: EnrollmentConfig): Promise<void> {
    console.log('🔐 Starting enrollment flow...');
    console.log('Config:', config);

    await YunoSdk.enrollmentPayment(
      {
        customerSession: config.customerSession,
        cardFlow: CardFlow.ONE_TIME,
      },
      config.countryCode,
    );

    console.log('✅ Enrollment flow started');
  }

  /**
   * Inicia un flujo de pago seamless
   */
  async startPaymentSeamlessLite(config: PaymentLiteConfig): Promise<void> {
    console.log('💳 Starting seamless payment flow...');
    console.log('Config:', config);

    const params: any = {
      customerSession: config.customerSession,
      checkoutSession: config.checkoutSession,
      paymentMethodType: config.paymentMethodType,
    };

    if (config.vaultedToken) {
      params.vaultedToken = config.vaultedToken;
    }

    await YunoSdk.startPaymentSeamlessLite(params, config.countryCode);
    console.log('✅ Seamless payment flow started');
  }

  /**
   * Continúa con un pago usando un OTT
   */
  async continuePayment(checkoutSession: string, ottToken: string): Promise<void> {
    console.log('➡️ Continuing payment with OTT...');
    console.log('Checkout Session:', checkoutSession);
    console.log('OTT:', ottToken);

    await YunoSdk.continuePayment(checkoutSession, ottToken);
    console.log('✅ Continue payment called');
  }
}

// Export singleton instance
export const yunoService = new YunoService();

