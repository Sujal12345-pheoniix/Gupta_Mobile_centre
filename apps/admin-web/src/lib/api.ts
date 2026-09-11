const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? 'https://gupta-mobile-centre-1.onrender.com/api/v1'
      : 'http://localhost:4000/api/v1');
  return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl.replace(/\/$/, '')}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  organizationId: string;
  organizationName: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: { authenticated?: boolean } = {},
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.authenticated !== false && this.getAccessToken()) {
      headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: data.message || 'An error occurred',
            details: data.details,
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network request failed',
        },
      };
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('POST', '/auth/login', credentials);
    if (response.success && response.data) {
      this.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    }
    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('POST', '/auth/logout');
    this.clearTokens();
    return response;
  }

  async getMe(): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('GET', '/auth/me');
  }

  async refreshTokens(): Promise<ApiResponse<AuthTokens>> {
    const refreshToken = this.refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);
    if (!refreshToken) {
      return {
        success: false,
        error: { code: 'NO_TOKEN', message: 'No refresh token' },
      };
    }

    const response = await this.request<AuthTokens>(
      'POST',
      '/auth/refresh',
      { refreshToken },
      { authenticated: false },
    );

    if (response.success && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  // Live Database APIs connected to Neon PostgreSQL
  async getStoreData(): Promise<ApiResponse<any>> {
    return this.request<any>('GET', '/store/data', undefined, { authenticated: false });
  }

  async createProduct(dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('POST', '/store/products', dto, { authenticated: false });
  }

  async updateProduct(id: string, dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('PATCH', `/store/products/${id}`, dto, { authenticated: false });
  }

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    return this.request<any>('DELETE', `/store/products/${id}`, undefined, { authenticated: false });
  }

  async adjustInventory(dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('POST', '/store/inventory/adjust', dto, { authenticated: false });
  }

  async createCustomer(dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('POST', '/store/customers', dto, { authenticated: false });
  }

  async updateCustomer(id: string, dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('PATCH', `/store/customers/${id}`, dto, { authenticated: false });
  }

  async deleteCustomer(id: string): Promise<ApiResponse<any>> {
    return this.request<any>('DELETE', `/store/customers/${id}`, undefined, { authenticated: false });
  }

  async createEmployee(dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('POST', '/store/employees', dto, { authenticated: false });
  }

  async updateEmployee(id: string, dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('PATCH', `/store/employees/${id}`, dto, { authenticated: false });
  }

  async deleteEmployee(id: string): Promise<ApiResponse<any>> {
    return this.request<any>('DELETE', `/store/employees/${id}`, undefined, { authenticated: false });
  }

  async markAttendance(dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('POST', '/store/employees/attendance', dto, { authenticated: false });
  }

  async recordSale(dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('POST', '/store/sales', dto, { authenticated: false });
  }

  async createSupplier(dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('POST', '/store/suppliers', dto, { authenticated: false });
  }

  async createPurchase(dto: any): Promise<ApiResponse<any>> {
    return this.request<any>('POST', '/store/purchases', dto, { authenticated: false });
  }

  async markPurchaseReceived(id: string): Promise<ApiResponse<any>> {
    return this.request<any>('PATCH', `/store/purchases/${id}/receive`, undefined, { authenticated: false });
  }
}

export const api = new ApiClient();
