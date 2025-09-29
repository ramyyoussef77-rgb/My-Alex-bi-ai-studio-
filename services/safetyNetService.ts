
import { SafetyNetResponse } from '../types';
import { BaseApiService } from './apiService';

const ENDPOINT = '/webhook/safety-net-data';

export class SafetyNetService extends BaseApiService {
  async getSafetyNetData(): Promise<SafetyNetResponse> {
    return this.makeApiCall(ENDPOINT, null, 'GET');
  }
}
