
import { SocialAnalysisResponse } from '../types';
import { BaseApiService } from './apiService';

const ENDPOINT = '/webhook/user-activity';

export class SocialGraphService extends BaseApiService {
  async getRoomSuggestions(userId: string): Promise<SocialAnalysisResponse> {
      const mockActivityPayload = {
        user_id: userId,
        user_text: "I love exploring the history of Alexandria, especially the Roman Amphitheatre and the Citadel of Qaitbay. I'm also looking for the best local seafood restaurants.",
        location_history: [{ neighborhood: 'Anfoushi' }, { neighborhood: 'Roushdy' }],
        interaction_history: []
      };
      return this.makeApiCall(ENDPOINT, mockActivityPayload);
  }
}
