/**
 * Definición de tipos para React Navigation
 */

export type RootStackParamList = {
  Home: undefined;
  PaymentMethods: {
    checkoutSession: string;
    countryCode: string;
  };
};

