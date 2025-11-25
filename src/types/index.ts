/**
 * Type definitions for the Yuno SDK Example App
 */

import type {
  YunoPaymentState,
  YunoEnrollmentState,
  OneTimeTokenInfo,
} from '@yuno/yuno-sdk-react-native';

export interface PaymentConfig {
  checkoutSession: string;
  countryCode: string;
  showPaymentStatus?: boolean;
}

export interface PaymentLiteConfig extends PaymentConfig {
  paymentMethodType: string;
  vaultedToken?: string;
}

export interface EnrollmentConfig {
  customerSession: string;
  countryCode: string;
  showEnrollmentStatus?: boolean;
}

export interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  countryCode: string;
  customerSession: string;
  checkoutSession: string;
  paymentMethodType: string;
  vaultedToken: string;
  paymentStatus: string;
  enrollmentStatus: string;
  ottToken: string;
  ottTokenInfo: OneTimeTokenInfo | null;
}

export type {YunoPaymentState, YunoEnrollmentState, OneTimeTokenInfo};

