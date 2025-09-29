import React, { useEffect } from 'react';
import { CulturalResponse } from '../types';
import HistoricalEras from './HistoricalEras';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import SpeakerOnIcon from './icons/SpeakerOnIcon';
import SpeakerOffIcon from './icons/SpeakerOffIcon';

interface ResponseCardProps {
  response: CulturalResponse | null;
  isLoading: boolean;
  error: string | null;
  isFromCache?: boolean;
  onFollowUpClick: (question: string) => void;
}

const ResponseCard: React.FC<ResponseCardProps> = ({ response, isLoading, error, isFromCache, onFollowUpClick }) => {
  const { isSpeaking, speak, cancel } = useTextToSpeech();
  const answerText = response?.answer || '';
  
  useEffect(() => {
    // Automatically speak the new response, but not if it's from the cache
    if (answerText && !isLoading && !isFromCache) {
      speak(answerText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerText, isLoading, isFromCache]); // Dependency on answerText ensures it re-triggers for new answers

  const handleSpeakerClick = () => {
    if (isSpeaking) {
      cancel();
    } else if (answerText) {
      speak(answerText);
    }
  };

  if (isLoading) {
    return (
      <div className="historical-context-card w-full bg-white/50 backdrop-blur-sm p-8 rounded-lg shadow-md border border-white/30">
        <div className="skeleton skeleton-text w-1/4 mb-4" style={{height: '24px'}}></div>
        <div className="skeleton skeleton-text w-full"></div>
        <div className="skeleton skeleton-text w-full"></div>
        <div className="skeleton skeleton-text w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!response) {
    return null;
  }
  
  const formatResponse = (text: string) => {
    return text
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.trim() === '') return null;
        const parts = paragraph.split(/(\*\*.*?\*\*)/g).filter(part => part);
        return (
          <p key={index} className="mb-4">
            {parts.map((i, partIndex) =>
              i.startsWith('**') && i.endsWith('**') ? (
                <strong key={partIndex} className="font-bold text-sea-blue">{i.slice(2, -2)}</strong>
              ) : (
                i
              )
            )}
          </p>
        );
      })
      .filter(p => p !== null);
  };

  return (
    <div className="historical-context-card w-full bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/40">
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-serif font-bold text-sea-blue">Compass Reading:</h2>
        <button onClick={handleSpeakerClick} className="p-2 rounded-full hover:bg-light-blue transition-colors" aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}>
          {isSpeaking ? <SpeakerOffIcon className="w-6 h-6 text-sea-blue" /> : <SpeakerOnIcon className="w-6 h-6 text-sea-blue" />}
        </button>
       </div>
       {isFromCache && (
          <div className="mb-4 p-3 bg-light-blue/50 border border-highlight rounded-md text-sm text-sea-blue" role="status">
            <p>You seem to be offline. Displaying a previously saved answer.</p>
          </div>
        )}
       <div className="prose max-w-none text-dark-accent leading-relaxed">
        {formatResponse(response.answer)}
       </div>
       
       {response.eraDetails && response.eraDetails.length > 0 && (
         <HistoricalEras eras={response.eraDetails} />
       )}

       {response.followUpQuestions && response.followUpQuestions.length > 0 && (
         <div className="mt-8 border-t border-light-blue pt-6">
            <h3 className="text-lg font-bold text-sea-blue mb-3">Explore further:</h3>
            <div className="flex flex-col items-start gap-2">
              {response.followUpQuestions.map((question, index) => (
                <button 
                  key={index}
                  onClick={() => onFollowUpClick(question)}
                  className="text-left text-highlight hover:text-sea-blue font-semibold transition-colors duration-200 p-2 rounded-md hover:bg-light-blue/50 w-full"
                >
                  &rarr; {question}
                </button>
              ))}
            </div>
         </div>
       )}
    </div>
  );
};

export default ResponseCard;