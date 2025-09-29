import React, { useState } from 'react';
import { PredictedEvent, FeedbackType } from '../types';
import CalendarIcon from './icons/CalendarIcon';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
import ThumbsDownIcon from './icons/ThumbsDownIcon';
import { useAppDispatch } from '../store/hooks';
import { sendEventFeedback } from '../store/slices/pulseSlice';

interface EventCardProps {
  event: PredictedEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [feedbackSent, setFeedbackSent] = useState<FeedbackType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  const confidenceScore = event.confidence_score * 100;
  const confidenceColor =
    confidenceScore > 80
      ? 'bg-green-500'
      : confidenceScore > 65
      ? 'bg-yellow-500'
      : 'bg-orange-500';

  const handleFeedback = async (type: FeedbackType) => {
    if (feedbackSent || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // The thunk now gets userId from the state, so we don't need to pass it here.
      await dispatch(sendEventFeedback({ eventId: event.event_id, feedbackType: type })).unwrap();
      setFeedbackSent(type);
    } catch (error) {
      console.error("Failed to send feedback", error);
      // Optionally show an error toast to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="event-prediction-card bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/40 transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold font-serif text-sea-blue mb-2 pr-2">{event.title}</h3>
        <div
          className={`flex-shrink-0 text-xs font-bold text-white px-3 py-1 rounded-full ${confidenceColor}`}
          title={`Prediction Confidence: ${confidenceScore.toFixed(0)}%`}
          aria-label={`Prediction Confidence: ${confidenceScore.toFixed(0)}%`}
        >
          {confidenceScore.toFixed(0)}%
        </div>
      </div>
      <div className="flex items-center text-dark-accent/80 space-x-2 mb-3">
        <CalendarIcon className="w-4 h-4" />
        <span className="font-semibold">{new Date(event.predicted_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        <span className="text-dark-accent/60">|</span>
        <span className="italic">{event.venue}</span>
      </div>
      <p className="text-dark-accent leading-relaxed text-sm mb-4">{event.reasoning}</p>
      
      {/* Feedback Section */}
      <div className="mt-4 pt-4 border-t border-light-blue">
        {feedbackSent ? (
          <p className="text-sm text-center text-green-700 font-semibold">Thank you for your feedback!</p>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-dark-accent/80">Was this prediction accurate?</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleFeedback('accurate')}
                disabled={isSubmitting}
                className="p-2 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50"
                aria-label="Mark prediction as accurate"
              >
                <ThumbsUpIcon className="w-5 h-5 text-green-600" />
              </button>
              <button 
                onClick={() => handleFeedback('inaccurate')}
                disabled={isSubmitting}
                className="p-2 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                aria-label="Mark prediction as inaccurate"
              >
                <ThumbsDownIcon className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
