import { CulturalResponse, Settings, UserType } from '../types';
import { BaseApiService } from './apiService';

// CRITICAL SECURITY FIX:
// The Gemini API key should NEVER be on the client. These new endpoints
// point to your n8n backend, which will securely add the key before
// proxying the request to Google's servers.
const GENERATIVE_ENDPOINT = '/webhook/generative-ask';
const VISUAL_ENDPOINT = '/webhook/visual-analysis';

// Ensure the environment variable is checked for clarity, though it's used on the server.
if (!process.env.REACT_APP_API_KEY) {
  console.warn("REACT_APP_API_KEY is not set in the environment. Ensure it is configured securely on your n8n server.");
}

class GeminiService extends BaseApiService {
  async getGenerativeResponse(query: string, userType: UserType, settings: Settings): Promise<CulturalResponse> {
    const payload = {
        query,
        userType,
        settings,
    };
    // Route the call through the secure backend service.
    return this.makeApiCall(GENERATIVE_ENDPOINT, payload, 'POST');
  }

  async getVisualAnalysis(base64ImageData: string, mimeType: string, settings: Settings): Promise<CulturalResponse> {
    const payload = {
        imageData: base64ImageData,
        mimeType,
        settings,
    };
    // Route the call through the secure backend service.
    return this.makeApiCall(VISUAL_ENDPOINT, payload, 'POST');
  }
}

export const geminiService = new GeminiService();