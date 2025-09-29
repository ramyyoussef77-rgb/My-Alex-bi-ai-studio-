
import { useState, useCallback } from 'react';
import { Settings, NotificationSettings } from '../types';

const SETTINGS_KEY = 'alex-compass-settings-v2'; // increment version for new shape

const defaultSettings: Settings = {
  language: 'en',
  detailLevel: 'Detailed',
  culturalContext: 'Subtle',
  notificationSettings: {
      enabled: true,
      emergency: true,
      events: true,
      community: false,
  },
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        // Deep merge to ensure new settings keys are added
        return {
            ...defaultSettings,
            ...parsed,
            notificationSettings: {
                ...defaultSettings.notificationSettings,
                ...(parsed.notificationSettings || {}),
            }
        };
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
    return defaultSettings;
  });

  const saveSettings = useCallback((newSettings: Settings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, []);

  return { settings, setSettings: saveSettings };
};
