export interface AppConfig {
  publicKey: string;
  country: string;
  language?: string;
  saveCardEnabled: boolean;
  showStatusScreen: boolean;
}

export interface PaymentConfig {
  checkoutSession: string;
  countryCode: string;
}

export interface EnrollmentConfig {
  customerSession: string;
  countryCode: string;
}

export interface StartOptions {
  createPayment: boolean;
  embedded: boolean;
}
