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
    
    console.log('✅ Yuno SDK initialized successfully');
  }
  
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
   * Muestra todos los métodos de pago disponibles
   * NOTA: El checkoutSession debe estar configurado antes en el SDK nativo
   */
  async startPayment(config: PaymentConfig): Promise<void> {
    console.log('═══════════════════════════════════════════════════════');
    console.log('💳 [YunoService] startPayment() - INICIANDO');
    console.log('📋 Config recibida:', JSON.stringify(config, null, 2));
    console.log('📋 showPaymentStatus:', config.showPaymentStatus ?? true);
    console.log('⏱️  Agregando delay de 150ms para asegurar inicialización del SDK...');

    try {
      // Workaround temporal: Pequeño delay para asegurar que el SDK esté completamente inicializado
      // Esto ayuda a evitar el crash de AnyCancellable.store(in:) que ocurre cuando el Set
      // no está correctamente inicializado en el SDK nativo
      await new Promise(resolve => setTimeout(resolve, 150));
      
      console.log('🚀 Llamando a YunoSdk.startPayment() con parámetros:');
      console.log('   - showPaymentStatus:', config.showPaymentStatus ?? true);
      
      await YunoSdk.startPayment(config.showPaymentStatus ?? true);
      
      console.log('✅ [YunoService] YunoSdk.startPayment() completado exitosamente');
    } catch (error: any) {
      console.error('❌ [YunoService] Error en startPayment():');
      console.error('   Tipo:', error?.constructor?.name || typeof error);
      console.error('   Mensaje:', error?.message || 'Sin mensaje');
      console.error('   Stack:', error?.stack || 'Sin stack trace');
      
      // Si el error es el crash de AnyCancellable, intenta nuevamente después de un delay
      const errorMessage = error?.message || '';
      const errorString = JSON.stringify(error) || '';
      
      if (
        errorMessage.includes('member:') || 
        errorMessage.includes('NSCFNumber') ||
        errorString.includes('member:') ||
        errorString.includes('NSCFNumber') ||
        errorMessage.includes('unrecognized selector')
      ) {
        console.warn('⚠️  [YunoService] Detectado error de AnyCancellable.store(in:)');
        console.warn('🔄 Intentando reintento después de 500ms...');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🚀 Reintentando YunoSdk.startPayment()...');
        await YunoSdk.startPayment(config.showPaymentStatus ?? true);
        
        console.log('✅ [YunoService] Reintento exitoso');
      } else {
        console.error('❌ [YunoService] Error no relacionado con cancellables, relanzando...');
        throw error;
      }
    }
    
    console.log('═══════════════════════════════════════════════════════');
  }

  /**
   * Inicia un flujo de pago lite
   * Requiere checkoutSession + paymentMethodType
   */
  async startPaymentLite(config: PaymentLiteConfig): Promise<void> {
    console.log('═══════════════════════════════════════════════════════');
    console.log('💳 [YunoService] startPaymentLite() - INICIANDO');
    console.log('📋 Config recibida:', JSON.stringify(config, null, 2));
    console.log('📋 checkoutSession:', config.checkoutSession || '(vacío)');
    console.log('📋 paymentMethodType:', config.paymentMethodType || '(vacío)');
    console.log('📋 countryCode:', config.countryCode || '(vacío)');
    console.log('📋 vaultedToken:', config.vaultedToken || '(no proporcionado)');
    console.log('📋 showPaymentStatus:', config.showPaymentStatus ?? true);
    console.log('⏱️  Agregando delay de 150ms para asegurar inicialización del SDK...');

    try {
      // Workaround temporal: Pequeño delay para asegurar que el SDK esté completamente inicializado
      // Esto ayuda a evitar el crash de AnyCancellable.store(in:) que ocurre cuando el Set
      // no está correctamente inicializado en el SDK nativo
      await new Promise(resolve => setTimeout(resolve, 150));

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

      console.log('📦 Params construidos para YunoSdk.startPaymentLite():');
      console.log('   - checkoutSession:', params.checkoutSession);
      console.log('   - methodSelected:', JSON.stringify(methodSelected, null, 2));
      console.log('   - showPaymentStatus:', params.showPaymentStatus);
      console.log('   - countryCode:', config.countryCode);
      
      console.log('🚀 Llamando a YunoSdk.startPaymentLite() con:');
      console.log('   - params:', JSON.stringify(params, null, 2));
      console.log('   - countryCode:', config.countryCode);
      
      await YunoSdk.startPaymentLite(params, config.countryCode);
      
      console.log('✅ [YunoService] YunoSdk.startPaymentLite() completado exitosamente');
    } catch (error: any) {
      console.error('❌ [YunoService] Error en startPaymentLite():');
      console.error('   Tipo:', error?.constructor?.name || typeof error);
      console.error('   Mensaje:', error?.message || 'Sin mensaje');
      console.error('   Stack:', error?.stack || 'Sin stack trace');
      console.error('   Error completo:', JSON.stringify(error, null, 2));
      
      // Si el error es el crash de AnyCancellable, intenta nuevamente después de un delay
      const errorMessage = error?.message || '';
      const errorString = JSON.stringify(error) || '';
      
      if (
        errorMessage.includes('member:') || 
        errorMessage.includes('NSCFNumber') ||
        errorString.includes('member:') ||
        errorString.includes('NSCFNumber') ||
        errorMessage.includes('unrecognized selector')
      ) {
        console.warn('⚠️  [YunoService] Detectado error de AnyCancellable.store(in:)');
        console.warn('🔄 Intentando reintento después de 500ms...');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
        
        console.log('🚀 Reintentando YunoSdk.startPaymentLite()...');
        await YunoSdk.startPaymentLite(params, config.countryCode);
        
        console.log('✅ [YunoService] Reintento exitoso');
      } else {
        console.error('❌ [YunoService] Error no relacionado con cancellables, relanzando...');
        throw error;
      }
    }
    
    console.log('═══════════════════════════════════════════════════════');
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
    console.log('═══════════════════════════════════════════════════════');
    console.log('💳 [YunoService] startPaymentSeamlessLite() - INICIANDO');
    console.log('📋 Config recibida:', JSON.stringify(config, null, 2));
    console.log('📋 checkoutSession:', config.checkoutSession || '(vacío)');
    console.log('📋 paymentMethodType:', config.paymentMethodType || '(vacío)');
    console.log('📋 countryCode:', config.countryCode || '(vacío)');
    console.log('📋 vaultedToken:', config.vaultedToken || '(no proporcionado)');
    console.log('📋 showPaymentStatus:', config.showPaymentStatus ?? true);
    console.log('⏱️  Agregando delay de 150ms para asegurar inicialización del SDK...');

    try {
      // Workaround temporal: Pequeño delay para asegurar que el SDK esté completamente inicializado
      await new Promise(resolve => setTimeout(resolve, 150));

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

      console.log('📦 Params construidos para YunoSdk.startPaymentSeamlessLite():');
      console.log('   - checkoutSession:', params.checkoutSession);
      console.log('   - countryCode:', params.countryCode);
      console.log('   - methodSelected:', JSON.stringify(methodSelected, null, 2));
      console.log('   - showPaymentStatus:', params.showPaymentStatus);
      
      console.log('🚀 Llamando a YunoSdk.startPaymentSeamlessLite() con:');
      console.log('   - params:', JSON.stringify(params, null, 2));
      
      await YunoSdk.startPaymentSeamlessLite(params);
      
      console.log('✅ [YunoService] YunoSdk.startPaymentSeamlessLite() completado exitosamente');
    } catch (error: any) {
      console.error('❌ [YunoService] Error en startPaymentSeamlessLite():');
      console.error('   Tipo:', error?.constructor?.name || typeof error);
      console.error('   Mensaje:', error?.message || 'Sin mensaje');
      console.error('   Stack:', error?.stack || 'Sin stack trace');
      console.error('   Error completo:', JSON.stringify(error, null, 2));
      
      // Si el error es el crash de AnyCancellable, intenta nuevamente después de un delay
      const errorMessage = error?.message || '';
      const errorString = JSON.stringify(error) || '';
      
      if (
        errorMessage.includes('member:') || 
        errorMessage.includes('NSCFNumber') ||
        errorString.includes('member:') ||
        errorString.includes('NSCFNumber') ||
        errorMessage.includes('unrecognized selector')
      ) {
        console.warn('⚠️  [YunoService] Detectado error de AnyCancellable.store(in:)');
        console.warn('🔄 Intentando reintento después de 500ms...');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
        
        console.log('🚀 Reintentando YunoSdk.startPaymentSeamlessLite()...');
        await YunoSdk.startPaymentSeamlessLite(params);
        
        console.log('✅ [YunoService] Reintento exitoso');
      } else {
        console.error('❌ [YunoService] Error no relacionado con cancellables, relanzando...');
        throw error;
      }
    }
    
    console.log('═══════════════════════════════════════════════════════');
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

