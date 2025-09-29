
import React, { useMemo, useEffect } from 'react';
import EventCard from './EventCard';
import EventFilter, { ConfidenceFilter } from './EventFilter';
import InsightsCarousel from './InsightsCarousel';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPulseData, selectPulse, setFilter } from '../store/slices/pulseSlice';
import { useSettings } from '../hooks/useSettings';

const EventCardSkeleton: React.FC = () => (
    <div className="event-prediction-card bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/30">
        <div className="flex justify-between items-start mb-3">
            <div className="skeleton skeleton-text w-3/5" style={{ height: '20px' }}></div>
            <div className="skeleton w-12 h-5 rounded-full"></div>
        </div>
        <div className="skeleton skeleton-text w-1/2 mb-4"></div>
        <div className="skeleton skeleton-text w-full"></div>
        <div className="skeleton skeleton-text w-4/5"></div>
    </div>
);

const EventsView: React.FC = () => {
    const dispatch = useAppDispatch();
    const { events, insights, loading, error, filter } = useAppSelector(selectPulse);
    const { settings } = useSettings(); // Use settings for potential future filtering

    useEffect(() => {
        dispatch(fetchPulseData());
    }, [dispatch]);

    const filteredEvents = useMemo(() => {
        return (events || []).filter(event => {
            if (filter === 'high') return event.confidence_score > 0.8;
            if (filter === 'medium') return event.confidence_score > 0.65 && event.confidence_score <= 0.8;
            return true; // 'all'
        }).sort((a, b) => new Date(a.predicted_date).getTime() - new Date(b.predicted_date).getTime());
    }, [events, filter]);

    const handleSetFilter = (newFilter: ConfidenceFilter) => {
        dispatch(setFilter(newFilter));
    };

    return (
        <div className="w-full flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl font-serif font-bold text-sea-blue">Local Pulse</h2>
                <p className="text-dark-accent/80">A forecast of predicted local happenings in Alexandria.</p>
            </div>
            
            {insights && <InsightsCarousel insights={insights} />}
            
            {!loading && !error && <EventFilter currentFilter={filter} setFilter={handleSetFilter} />}

            {loading && (
                Array.from({ length: 3 }).map((_, index) => <EventCardSkeleton key={index} />)
            )}
            {error && (
                 <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            {!loading && !error && filteredEvents.length > 0 && filteredEvents.map(event => (
                <EventCard key={event.event_id} event={event} />
            ))}
            {!loading && !error && filteredEvents.length === 0 && (
                <div className="text-center p-8 bg-white/60 rounded-lg">
                    <p className="text-dark-accent">No events match the current filter.</p>
                </div>
            )}
        </div>
    );
};

export default EventsView;
