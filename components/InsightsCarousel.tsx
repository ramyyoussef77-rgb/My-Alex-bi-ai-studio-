
import React, { useState, useEffect, useMemo } from 'react';
import { PatternInsights } from '../types';
import InsightIcon from './icons/InsightIcon';
import TrendingIcon from './icons/TrendingIcon';
import CalendarIcon from './icons/CalendarIcon';

interface InsightsCarouselProps {
  insights: PatternInsights;
}

const InsightsCarousel: React.FC<InsightsCarouselProps> = ({ insights }) => {
  const allInsights = useMemo(() => {
    const trends = insights.detected_trends.map(text => ({ type: 'Trend', text, icon: <TrendingIcon className="w-4 h-4 text-highlight" /> }));
    const seasonal = insights.seasonal_factors.map(text => ({ type: 'Seasonal', text, icon: <InsightIcon className="w-4 h-4 text-yellow-600" /> }));
    const cultural = insights.cultural_calendar_influences.map(text => ({ type: 'Cultural', text, icon: <CalendarIcon className="w-4 h-4 text-purple-600" /> }));
    return [...trends, ...seasonal, ...cultural];
  }, [insights]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (allInsights.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % allInsights.length);
        setIsFading(false);
      }, 500); // Half a second for the fade-out
    }, 5000); // Change insight every 5 seconds

    return () => clearInterval(interval);
  }, [allInsights.length]);

  if (allInsights.length === 0) {
    return null;
  }

  const currentInsight = allInsights[currentIndex];

  return (
    <div className="w-full bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/40">
      <h3 className="text-xl font-serif font-bold text-sea-blue mb-3 flex items-center gap-2">
        <InsightIcon className="w-5 h-5" />
        Alexandria Insights
      </h3>
      <div className={`transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-2 mb-1">
          {currentInsight.icon}
          <span className="text-xs font-bold uppercase text-dark-accent/60">{currentInsight.type}</span>
        </div>
        <p className="text-dark-accent text-sm leading-relaxed min-h-[40px]">
          {currentInsight.text}
        </p>
      </div>
    </div>
  );
};

export default InsightsCarousel;
