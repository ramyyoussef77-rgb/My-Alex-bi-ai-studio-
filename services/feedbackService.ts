
import { FeedbackType } from '../types';
import { BaseApiService } from './apiService';

const ENDPOINT = '/webhook/user-feedback';

export class FeedbackService extends BaseApiService {
  constructor() {
    super();
    this.setupConnectivityListeners();
    this.initialize();
  }
  
  private setupConnectivityListeners() {
    window.addEventListener('online', () => this.processPendingFeedback());
  }

  private initialize() {
    // Process any pending feedback on startup if online
    if (navigator.onLine) {
        this.processPendingFeedback();
    }
  }

  async sendEventFeedback(eventId: string, userId: string, feedbackType: FeedbackType): Promise<{ success: boolean; queued?: boolean }> {
      const payload = {
        event_id: eventId,
        feedback_type: feedbackType === 'accurate' ? 'event_occurred' : 'event_missed',
        user_id: userId,
      };

      try {
          if (!navigator.onLine) throw new Error("Offline");
          await this.makeApiCall(ENDPOINT, payload);
          return { success: true };
      } catch (error) {
          console.warn('Failed to send feedback online, queueing...', error);
          this.queueOfflineFeedback(payload);
          return { success: false, queued: true };
      }
  }
  
  private queueOfflineFeedback(feedbackData: any) {
    try {
      const queue = JSON.parse(localStorage.getItem('feedback_queue') || '[]');
      queue.push({ ...feedbackData, queued_at: new Date().toISOString() });
      localStorage.setItem('feedback_queue', JSON.stringify(queue));
      console.log('[Feedback Service] Feedback queued for offline submission');
    } catch (error) {
      console.error('[Feedback Service] Failed to queue feedback:', error);
    }
  }

  async processPendingFeedback() {
    try {
      const queue = JSON.parse(localStorage.getItem('feedback_queue') || '[]');
      if (queue.length === 0 || !navigator.onLine) return;
      
      console.log(`[Feedback Service] Processing ${queue.length} pending feedback items`);
      const remaining = [...queue];

      for (const feedback of queue) {
          try {
              await this.makeApiCall(ENDPOINT, feedback);
              const index = remaining.findIndex(item => item.queued_at === feedback.queued_at);
              if (index > -1) remaining.splice(index, 1);
          } catch (error) {
              console.error('[Feedback Service] Failed to process queued feedback, will retry later:', error);
              // Stop processing if one fails to avoid flooding the server on reconnect
              break; 
          }
      }
      localStorage.setItem('feedback_queue', JSON.stringify(remaining));
      console.log(`[Feedback Service] ${queue.length - remaining.length} items processed, ${remaining.length} remaining.`);
    } catch (error) {
      console.error('[Feedback Service] Error processing feedback queue:', error);
    }
  }
}
