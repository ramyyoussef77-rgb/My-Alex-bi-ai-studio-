import { BaseApiService } from './apiService';
import { LoginResponse, UserType } from '../types';

const LOGIN_ENDPOINT = '/webhook/auth/login';
const SIGNUP_ENDPOINT = '/webhook/auth/signup';
const ME_ENDPOINT = '/webhook/auth/me';
const TOKEN_KEY = 'jwt_token';

class AuthService extends BaseApiService {

  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const response = await this.makeApiCall(LOGIN_ENDPOINT, credentials, 'POST');
    if (response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
    }
    return response;
  }

  async signup(details: { displayName: string; email: string; password: string; profile: UserType }): Promise<LoginResponse> {
    const response = await this.makeApiCall(SIGNUP_ENDPOINT, details, 'POST');
    if (response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
    }
    return response;
  }
  
  async getMe(): Promise<LoginResponse> {
    // This call will automatically include the token due to the BaseApiService enhancement
    return this.makeApiCall(ME_ENDPOINT, null, 'GET');
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}

export const authService = new AuthService();
