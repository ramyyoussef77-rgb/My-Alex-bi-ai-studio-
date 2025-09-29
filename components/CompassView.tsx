
import React, { useState } from 'react';
import QueryForm from './QueryForm';
import ResponseCard from './ResponseCard';
import { UserType, Settings } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGenerativeResponse, fetchHistoricalContext, selectCompass, fetchVisualAnalysis } from '../store/slices/compassSlice';

interface CompassViewProps {
    settings: Settings;
}

const CompassView: React.FC<CompassViewProps> = ({ settings }) => {
    const dispatch = useAppDispatch();
    const { response, loading, error, isFromCache } = useAppSelector(selectCompass);
    const [query, setQuery] = useState('');
    const [userType, setUserType] = useState<UserType>(UserType.Tourist);

    const handleSubmit = () => {
        if (!query.trim()) return;
        dispatch(fetchGenerativeResponse({ query, userType, settings }));
    };

    const handleFollowUpSubmit = (followUpQuery: string) => {
        setQuery(followUpQuery);
        dispatch(fetchGenerativeResponse({ query: followUpQuery, userType, settings }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDiscoverNearby = () => {
        // BUG FIX: Return the promise from dispatch so the caller can await it.
        return dispatch(fetchHistoricalContext({ settings }));
    };

    const handleAnalyzeImage = (imageData: string, mimeType: string) => {
        setQuery(''); // Clear text query when analyzing an image
        dispatch(fetchVisualAnalysis({ imageData, mimeType, settings }));
    };

    return (
        <>
            <QueryForm
                query={query}
                setQuery={setQuery}
                userType={userType}
                setUserType={setUserType}
                onSubmit={handleSubmit}
                onDiscoverNearby={handleDiscoverNearby}
                onAnalyzeImage={handleAnalyzeImage}
                isLoading={loading}
            />
            {(response || loading || error) && (
                <ResponseCard
                    response={response}
                    isLoading={loading}
                    error={error}
                    isFromCache={isFromCache}
                    onFollowUpClick={handleFollowUpSubmit}
                />
            )}
        </>
    );
};

export default CompassView;