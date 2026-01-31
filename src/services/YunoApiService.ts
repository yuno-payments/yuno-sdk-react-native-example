/**
 * Yuno API Service for creating customers and sessions
 */

const YUNO_API_BASE_URL = 'https://api-staging.y.uno/v1';

export interface CustomerData {
  merchantCustomerId?: string;
  email?: string;
  country?: string;
  document?: {
    documentType: string;
    documentNumber: string;
  };
  phone?: {
    countryCode: string;
    number: string;
  };
}

export interface CheckoutSessionData {
  accountId?: string;
  country?: string;
  currency?: string;
  amount?: number;
  customerId: string;
  merchantOrderId?: string;
  callbackUrl?: string;
  paymentDescription?: string;
}

export interface CustomerSessionData {
  country?: string;
  customerId: string;
  callbackUrl?: string;
}

export interface CustomerResponse {
  id: string;
  merchant_customer_id: string;
  email: string;
  country: string;
  created_at: string;
}

export interface CheckoutSessionResponse {
  checkout_session: string;
  merchant_order_id: string;
  amount: {
    currency: string;
    value: number;
  };
}

export interface CustomerSessionResponse {
  customer_session: string;
  customer_id: string;
}

class YunoApiService {
  private publicApiKey: string = '';
  private privateSecretKey: string = '';
  private accountId: string = '';

  constructor(
    publicApiKey?: string,
    privateSecretKey?: string,
    accountId?: string
  ) {
    if (publicApiKey) this.publicApiKey = publicApiKey;
    if (privateSecretKey) this.privateSecretKey = privateSecretKey;
    if (accountId) this.accountId = accountId;
  }

  isConfigured(): boolean {
    return !!(this.publicApiKey && this.privateSecretKey && this.accountId);
  }

  setKeys(publicApiKey: string, privateSecretKey: string, accountId?: string) {
    console.log('🔑 YunoApiService.setKeys called');
    console.log('  - publicKey:', publicApiKey?.substring(0, 30) + '...');
    console.log('  - privateKey:', privateSecretKey?.substring(0, 30) + '...');
    console.log('  - accountId:', accountId);
    
    this.publicApiKey = publicApiKey;
    this.privateSecretKey = privateSecretKey;
    if (accountId) {
      this.accountId = accountId;
    }
  }

  getKeys() {
    return {
      publicKey: this.publicApiKey?.substring(0, 30) + '...',
      privateKey: this.privateSecretKey?.substring(0, 30) + '...',
      accountId: this.accountId,
    };
  }

  getAccountId(): string {
    return this.accountId;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    body?: object,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'public-api-key': this.publicApiKey,
      'private-secret-key': this.privateSecretKey,
      ...additionalHeaders,
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      console.log(`📡 API Request: ${method} ${endpoint}`);
      const response = await fetch(`${YUNO_API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.message || `API Error: ${response.status}`);
      }

      console.log(`✅ API Response:`, data);
      return data as T;
    } catch (error) {
      console.error('❌ API Request Error:', error);
      throw error;
    }
  }

  async createCustomer(customerData: CustomerData = {}): Promise<CustomerResponse> {
    const payload: Record<string, any> = {
      merchant_customer_id: customerData.merchantCustomerId || `customer_${Date.now()}`,
      email: customerData.email || `test${Date.now()}@example.com`,
      country: customerData.country || 'CO',
    };

    if (customerData.document) {
      payload.document = {
        document_type: customerData.document.documentType,
        document_number: customerData.document.documentNumber,
      };
    }

    if (customerData.phone) {
      payload.phone = {
        country_code: customerData.phone.countryCode,
        number: customerData.phone.number,
      };
    }

    console.log('🔵 Creating customer with payload:', payload);
    const response = await this.request<CustomerResponse>('/customers', 'POST', payload);
    console.log('✅ Customer created:', response);
    return response;
  }

  async createCheckoutSession(sessionData: CheckoutSessionData): Promise<CheckoutSessionResponse> {
    const payload = {
      account_id: sessionData.accountId || this.accountId,
      country: sessionData.country || 'CO',
      amount: {
        currency: sessionData.currency || 'COP',
        value: sessionData.amount || 10000,
      },
      customer_id: sessionData.customerId,
      merchant_order_id: sessionData.merchantOrderId || `order_${Date.now()}`,
      callback_url: sessionData.callbackUrl || 'yunoexample://payment',
      payment_description: sessionData.paymentDescription || 'Test payment from React Native',
    };

    console.log('🔵 Creating checkout session with payload:', payload);
    const response = await this.request<CheckoutSessionResponse>('/checkout/sessions', 'POST', payload);
    console.log('✅ Checkout session created:', response);
    return response;
  }

  async createCustomerSession(sessionData: CustomerSessionData): Promise<CustomerSessionResponse> {
    const payload = {
      country: sessionData.country || 'CO',
      customer_id: sessionData.customerId,
      callback_url: sessionData.callbackUrl || 'yunoexample://enrollment',
    };

    console.log('🔵 Creating customer session with payload:', payload);
    const response = await this.request<CustomerSessionResponse>('/customers/sessions', 'POST', payload);
    console.log('✅ Customer session created:', response);
    return response;
  }

  /**
   * Creates a customer, checkout session, and customer session in one call
   */
  async createFullSession(country: string = 'CO'): Promise<{
    customer: CustomerResponse;
    checkoutSession: string;
    customerSession: string;
  }> {
    // Step 1: Create customer
    const customer = await this.createCustomer({
      country,
      document: {
        documentType: 'CC',
        documentNumber: '123456789',
      },
    });

    // Step 2: Create checkout session
    const checkoutResponse = await this.createCheckoutSession({
      customerId: customer.id,
      country,
    });

    // Step 3: Create customer session
    const customerSessionResponse = await this.createCustomerSession({
      customerId: customer.id,
      country,
    });

    return {
      customer,
      checkoutSession: checkoutResponse.checkout_session,
      customerSession: customerSessionResponse.customer_session,
    };
  }
}

// Export singleton instance with default credentials
export const yunoApiService = new YunoApiService();

export default YunoApiService;
