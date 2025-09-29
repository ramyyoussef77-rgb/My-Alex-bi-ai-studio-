import React, { useState, useRef } from 'react';
import { UserType } from '../types';
import LocationIcon from './icons/LocationIcon';
import CameraIcon from './icons/CameraIcon';

interface QueryFormProps {
  query: string;
  setQuery: (query: string) => void;
  userType: UserType;
  setUserType: (userType: UserType) => void;
  onSubmit: () => void;
  onDiscoverNearby: () => Promise<any>;
  onAnalyzeImage: (imageData: string, mimeType: string) => void;
  isLoading: boolean;
}

const QueryForm: React.FC<QueryFormProps> = ({ query, setQuery, userType, setUserType, onSubmit, onDiscoverNearby, onAnalyzeImage, isLoading }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit();
    }
  };
  
  const handleDiscoverClick = async () => {
    setIsLocating(true);
    try {
      // BUG FIX: Await the promise from the dispatched thunk to sync state.
      await onDiscoverNearby();
    } finally {
      setIsLocating(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        clearImage();
    }
  };

  const handleAnalyzeClick = () => {
    if (imageFile && imagePreview) {
      const base64Data = imagePreview.split(',')[1];
      if (base64Data) {
        onAnalyzeImage(base64Data, imageFile.type);
      }
    }
  };

  const clearImage = () => {
      setImageFile(null);
      setImagePreview(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };
  
  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  // BUG FIX: Rely on the main `isLoading` from Redux for the overall disabled state,
  // and the local `isLocating` for the specific button's text/icon.
  const isButtonDisabled = isLoading || isLocating;

  return (
    <div className="user-input-area w-full bg-white/50 backdrop-blur-sm p-8 rounded-lg shadow-md border border-white/30">
      <form onSubmit={handleFormSubmit}>
        <div className="mb-6">
          <label htmlFor="user-type" className="block text-sea-blue font-bold mb-2 text-lg">
            Who are you?
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.values(UserType).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setUserType(type)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
                  userType === type
                    ? 'bg-sea-blue text-white shadow-lg'
                    : 'bg-light-blue text-dark-accent hover:bg-highlight'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="query" className="block text-sea-blue font-bold mb-2 text-lg">
            What would you like to know?
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Where can I find good nightlife?' or 'Suggest a family-friendly evening spot.'"
            className="w-full h-32 p-4 border-2 border-light-blue rounded-lg focus:ring-2 focus:ring-highlight focus:border-highlight transition duration-200 resize-none text-dark-accent"
            disabled={isButtonDisabled}
          />
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={isButtonDisabled || !query.trim()}
            className="button-ripple w-full bg-highlight text-white font-bold py-3 px-4 rounded-lg hover:bg-sea-blue transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading && !isLocating && !imageFile ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Ask the Compass'
            )}
          </button>

          <div className="flex items-center gap-4">
            <hr className="flex-grow border-t border-light-blue" />
            <span className="text-dark-accent/70 text-sm">OR</span>
            <hr className="flex-grow border-t border-light-blue" />
          </div>

          <button
            type="button"
            onClick={handleDiscoverClick}
            disabled={isButtonDisabled}
            className="button-ripple w-full bg-white text-sea-blue font-bold py-3 px-4 rounded-lg border-2 border-highlight hover:bg-light-blue/50 transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLocating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Getting location...</span>
              </>
            ) : (
              <>
                <LocationIcon className="w-5 h-5 mr-2" />
                <span>Discover Nearby</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Visual Compass Section */}
      <div className="mt-6 pt-6 border-t border-light-blue">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            capture="environment"
        />
        {imagePreview ? (
            <div className="flex flex-col items-center gap-4">
                <img src={imagePreview} alt="Selected landmark" className="w-48 h-48 object-cover rounded-lg shadow-md border-2 border-white"/>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={isButtonDisabled}
                        className="button-ripple bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-sea-blue transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                         {isLoading && imageFile ? (
                           <>
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             Analyzing...
                           </>
                         ) : (
                            'Analyze Image'
                         )}
                    </button>
                    <button type="button" onClick={clearImage} className="text-sm text-red-600 hover:underline">
                        Remove
                    </button>
                </div>
            </div>
        ) : (
            <button
                type="button"
                onClick={triggerFileInput}
                disabled={isButtonDisabled}
                className="button-ripple w-full bg-white text-sea-blue font-bold py-3 px-4 rounded-lg border-2 border-highlight hover:bg-light-blue/50 transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
                <CameraIcon className="w-5 h-5 mr-2" />
                <span>Analyze a Landmark Photo</span>
            </button>
        )}
      </div>
    </div>
  );
};

export default QueryForm;