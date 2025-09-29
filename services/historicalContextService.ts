
import { Settings, HistoricalContextResponse } from '../types';
import { BaseApiService } from './apiService';

const ENDPOINT = '/webhook/historical-location';

export class HistoricalContextService extends BaseApiService {
  async getHistoricalContext(latitude: number, longitude: number, settings: Settings, userId: string): Promise<HistoricalContextResponse> {
    return this.makeApiCall(ENDPOINT, { latitude, longitude, language: settings.language, user_id: userId });
  }
}