
import { TrendingTopicsResponse } from '../types';
import { BaseApiService } from './apiService';

const ENDPOINT = '/webhook/trending-topics';

export class TrendingTopicsService extends BaseApiService {
  async getTrendingTopics(): Promise<TrendingTopicsResponse> {
    return this.makeApiCall(ENDPOINT, null, 'GET');
  }
}
