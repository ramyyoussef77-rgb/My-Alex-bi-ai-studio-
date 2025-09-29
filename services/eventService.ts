
import { PredictedEventsResponse } from '../types';
import { BaseApiService } from './apiService';

const ENDPOINT = '/webhook/predictive-events';

export class EventService extends BaseApiService {
  async getPredictedEvents(): Promise<PredictedEventsResponse> {
    // The makeApiCall method now handles unwrapping the response correctly.
    // No special handling is needed here, simplifying the service.
    return this.makeApiCall(ENDPOINT, null, 'GET');
  }
}