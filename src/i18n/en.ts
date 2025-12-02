/**
 * English translations for Yuno SDK Example App
 */
export const en = {
  // App title and header
  app: {
    title: 'Yuno SDK',
    subtitle: 'React Native Example',
  },

  // Payment methods screen
  paymentMethods: {
    title: 'Payment Methods',
    subtitle: 'Select your preferred method',
    checkoutSession: 'Checkout Session',
    country: 'Country',
    payButton: 'Pay',
    backButton: '← Back',
  },

  // Configuration form
  config: {
    title: 'Configuration',
    customerSession: 'Customer Session',
    customerSessionPlaceholder: 'Enter customer session',
    checkoutSession: 'Checkout Session',
    checkoutSessionPlaceholder: 'Enter checkout session',
    paymentMethodType: 'Payment Method Type',
    paymentMethodTypePlaceholder: 'e.g., CARD',
    vaultedToken: 'Vaulted Token',
    vaultedTokenPlaceholder: 'Optional vaulted token',
    requiredForEnrollment: 'Required for Enrollment',
    requiredForPayment: 'Required for Payment',
    requiredForLite: 'Required for Payment Lite',
  },

  // Payment actions
  payment: {
    title: 'Payment Actions',
    startPayment: 'Start Payment (Full Flow)',
    startPaymentLite: 'Start Payment Lite',
    seamlessPayment: 'Seamless Payment',
    requiredFields: 'Required Fields',
    pleaseEnter: 'Please enter',
  },

  // Enrollment actions
  enrollment: {
    title: 'Enrollment',
    startEnrollment: 'Enrollment Payment',
    requiredFields: 'Required Fields',
    pleaseEnter: 'Please enter',
  },

  // OTT (One Time Token) display
  ott: {
    title: 'One Time Token',
    token: 'Token',
    noToken: 'No token available yet',
    continuePayment: 'Continue Payment with OTT',
    clear: 'Clear OTT',
    additionalInfo: 'Additional Information',
    accountId: 'Account ID',
    customerSession: 'Customer Session',
    checkoutSession: 'Checkout Session',
    accountType: 'Account Type',
    category: 'Category',
    issuer: 'Issuer',
    lastFourDigits: 'Last 4',
    paymentMethod: 'Payment Method',
    amount: 'Amount',
    currency: 'Currency',
    customerInfo: 'Customer Information',
    name: 'Name',
    email: 'Email',
    documentType: 'Document Type',
    documentNumber: 'Document Number',
    phone: 'Phone',
    address: 'Address',
    street: 'Street',
    city: 'City',
    state: 'State',
    zipCode: 'ZIP Code',
    country: 'Country',
  },

  // Status display
  status: {
    title: 'Status',
    paymentStatus: 'Payment Status',
    enrollmentStatus: 'Enrollment Status',
    noStatus: 'No status yet',
  },

  // Error messages
  errors: {
    paymentError: 'Payment error',
    enrollmentError: 'Enrollment error',
    errorLoadingPaymentMethods: 'Could not load payment methods',
  },

  // Buttons
  buttons: {
    ok: 'OK',
  },
};

export type TranslationKeys = typeof en;

