
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import EventsView from './components/EventsView';
import BottomNav from './components/BottomNav';
import SettingsView from './components/SettingsView';
import SafetyNetView from './components/SafetyNetView';
import CompassView from './components/CompassView';
import OfflineHistoricalBrowser from './components/OfflineHistoricalBrowser';
import CommunityChatView from './components/CommunityChatView';
import LoginView from './components/LoginView'; // Import the new LoginView
import { useSettings } from './hooks/useSettings';
import { offlineManager } from './store/store';
import { RealTimeChatManager } from './services/chatManager';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { checkAuthStatus, logoutUser, selectUser } from './store/slices/userSlice';

type View = 'compass' | 'pulse' | 'community' | 'library' | 'safety' | 'settings';

const App: React.FC = () => {
  const [view, setView] = useState<View>('compass');
  const { settings, setSettings } = useSettings();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [chatManager, setChatManager] = useState<RealTimeChatManager | null>(null);
  
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  useEffect(() => {
    // On app startup, check if there's an existing token/session
    dispatch(checkAuthStatus());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);
  
  useEffect(() => {
    if (user.isAuthenticated && user.id) {
        const manager = new RealTimeChatManager(user);
        setChatManager(manager);

        const timer = setTimeout(() => {
            offlineManager.preloadNearbyHistoricalData(user.id!);
        }, 500);

        return () => {
            manager.destroy();
            clearTimeout(timer);
        };
    } else {
        if (chatManager) {
            chatManager.destroy();
            setChatManager(null);
        }
    }
  }, [user.isAuthenticated, user.id]);


  // If auth status is still loading, show a loading screen
  if (user.status === 'loading' || user.status === 'idle') {
    return <div className="min-h-screen flex items-center justify-center bg-sand-beige"><div className="skeleton h-12 w-12 rounded-full"></div></div>;
  }
  
  // If user is not authenticated, show the LoginView
  if (!user.isAuthenticated) {
    return <LoginView />;
  }
  
  const handleLogout = () => {
    dispatch(logoutUser());
  }

  const renderContent = () => {
    switch (view) {
      case 'compass':
        return <CompassView settings={settings} />;
      case 'pulse':
        return <EventsView />;
      case 'community':
        return chatManager ? <CommunityChatView chatManager={chatManager} /> : <div>Loading Community...</div>;
      case 'library':
        return <OfflineHistoricalBrowser offlineManager={offlineManager} isOffline={!isOnline} />;
      case 'safety':
        return <SafetyNetView />;
      case 'settings':
        return <SettingsView settings={settings} setSettings={setSettings} onLogout={handleLogout} />;
      default:
        return <CompassView settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen bg-sand-beige font-sans flex flex-col">
      <Header isOnline={isOnline} />
      <main className="container mx-auto p-4 md:p-8 flex-grow pb-24">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          {renderContent()}
          <Footer />
        </div>
      </main>
      <BottomNav currentView={view} setView={setView} />
    </div>
  );
};

export default App;
