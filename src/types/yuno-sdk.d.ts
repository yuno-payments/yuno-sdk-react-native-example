/**
 * Declaración de tipos para el Yuno SDK desde CodeArtifact
 */

declare module '@yuno-payments/yuno-sdk-react-native' {
  export interface YunoPaymentState {
    status: string;
    type?: string;
    message?: string;
    [key: string]: any;
  }

  export interface YunoEnrollmentState {
    status: string;
    type?: string;
    message?: string;
    [key: string]: any;
  }

  export interface OneTimeTokenInfo {
    account_id?: string;
    customer_session?: string;
    checkout_session?: string;
    account_type?: string;
    category?: string;
    issuer?: string | { name?: string };
    last_four_digits?: string;
    [key: string]: any;
  }

  export enum YunoLanguage {
    ES = 'ES',
    EN = 'EN',
    PT = 'PT',
  }

  export enum CardFlow {
    ONE_TIME = 'ONE_TIME',
    CONTINUOUS = 'CONTINUOUS',
  }

  export enum YunoStatus {
    CREATED = 'CREATED',
    READY = 'READY',
    SUCCEEDED = 'SUCCEEDED',
    DECLINED = 'DECLINED',
    CANCELLED = 'CANCELLED',
    ERROR = 'ERROR',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING',
  }

  export class YunoSdk {
    static markAsInitialized(countryCode: string, language: YunoLanguage): void;
    static clearLastOneTimeToken(): Promise<void>;
    static getLastOneTimeToken(): Promise<string | null>;
    static getLastOneTimeTokenInfo(): Promise<OneTimeTokenInfo | null>;
    static startPayment(showPaymentStatus: boolean): Promise<void>;
    static startPaymentLite(
      config: {
        checkoutSession: string;
        methodSelected: {
          paymentMethodType: string;
          vaultedToken?: string;
        };
        showPaymentStatus?: boolean;
      },
      countryCode: string,
    ): Promise<void>;
    static enrollmentPayment(
      config: {
        customerSession: string;
        cardFlow: CardFlow;
        showEnrollmentStatus?: boolean;
      },
      countryCode: string,
    ): Promise<void>;
    static startPaymentSeamlessLite(
      config: {
        checkoutSession: string;
        countryCode: string;
        methodSelected: {
          paymentMethodType: string;
          vaultedToken?: string;
        };
        showPaymentStatus?: boolean;
      },
      countryCode: string,
    ): Promise<void>;
    static continuePayment(
      checkoutSession: string,
      countryCode: string,
      showPaymentStatus: boolean,
    ): Promise<void>;
  }
}
