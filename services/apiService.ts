export const N8N_BASE_URL = process.env.REACT_APP_N8N_BASE_URL;

if (N8N_BASE_URL === undefined || N8N_BASE_URL === null) {
  throw new Error("FATAL ERROR: REACT_APP_N8N_BASE_URL is not defined in the environment. The application cannot communicate with the backend. Please configure it in your .env file.");
}

const TIMEOUT = 15000;
const RETRY_ATTEMPTS = 3;

export abstract class BaseApiService {
  protected baseUrl: string;
  
  constructor() {
    this.baseUrl = N8N_BASE_URL!;
  }

  private _unwrapN8nResponse(response: any): any {
    if (Array.isArray(response) && response.length > 0 && response[0].json) {
      return response[0].json;
    }
    if (response && typeof response === 'object' && response.data) {
      return response.data;
    }
    return response;
  }

  protected async makeApiCall(endpoint: string, data: any = null, method: 'POST' | 'GET' = 'GET') {
    if (!navigator.onLine) {
      throw new Error('You are currently offline. Please check your connection.');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('jwt_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          method: data ? 'POST' : method,
          headers,
          body: data ? JSON.stringify(data) : null,
          signal: AbortSignal.timeout(TIMEOUT)
        });

        if (response.status === 401) {
            localStorage.removeItem('jwt_token');
            window.location.reload(); // Force reload to trigger logout state
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        const result = await response.json();
        return this._unwrapN8nResponse(result);

      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[API Service] Call to ${endpoint} failed on attempt ${attempt}:`, errorMessage);

        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error('[API Service] This error often indicates a network issue. It could be a CORS problem, a DNS failure, or the server being unreachable. Please check your browser\'s network console for more details and verify your proxy configuration.');
        }

        if (attempt === RETRY_ATTEMPTS) throw new Error(`API call to ${endpoint} failed after all retry attempts. Original error: ${errorMessage}`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('API call failed after all retry attempts.');
  }
}