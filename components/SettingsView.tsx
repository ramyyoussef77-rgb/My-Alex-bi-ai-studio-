import React from 'react';
import { Settings } from '../types';
import BellIcon from './icons/BellIcon';
import ToggleSwitch from './ToggleSwitch';

interface SettingsViewProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  onLogout: () => void;
}

interface SettingOptionProps<T> {
  label: string;
  options: readonly T[];
  selectedValue: T;
  onChange: (value: T) => void;
}

const SettingOption = <T extends string>({ label, options, selectedValue, onChange }: SettingOptionProps<T>) => {
  return (
    <div className="mb-6">
      <label className="block text-sea-blue font-bold mb-2 text-lg">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
              selectedValue === option
                ? 'bg-sea-blue text-white shadow-lg'
                : 'bg-light-blue text-dark-accent hover:bg-highlight'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};


const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings, onLogout }) => {
    const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings({ ...settings, [key]: value });
    };

    const handleNotificationChange = <K extends keyof Settings['notificationSettings']>(key: K, value: boolean) => {
        setSettings({
            ...settings,
            notificationSettings: {
                ...settings.notificationSettings,
                [key]: value,
            }
        });
    };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-sea-blue">Settings</h2>
        <p className="text-dark-accent/80">Personalize your Alexandria Cultural Compass experience.</p>
      </div>

      <div className="settings-card w-full bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-md border border-white/30">
        <SettingOption
          label="Language Preference"
          options={['en', 'ar'] as const}
          selectedValue={settings.language}
          onChange={(value) => handleSettingChange('language', value)}
        />
        <SettingOption
          label="Content Detail Level"
          options={['Concise', 'Detailed'] as const}
          selectedValue={settings.detailLevel}
          onChange={(value) => handleSettingChange('detailLevel', value)}
        />
        <SettingOption
          label="Cultural Context Style"
          options={['Subtle', 'Explicit'] as const}
          selectedValue={settings.culturalContext}
          onChange={(value) => handleSettingChange('culturalContext', value)}
        />
      </div>

      <div className="settings-card w-full bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-md border border-white/30" style={{ animationDelay: '0.2s'}}>
        <h3 className="text-lg font-bold text-sea-blue mb-4 flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            Notification Preferences
        </h3>
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label htmlFor="notif-enabled" className="font-semibold text-dark-accent">Enable Notifications</label>
                <ToggleSwitch id="notif-enabled" isEnabled={settings.notificationSettings.enabled} onToggle={(val) => handleNotificationChange('enabled', val)} />
            </div>
             <div className={`space-y-4 transition-opacity duration-300 ${settings.notificationSettings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="flex justify-between items-center pl-4 border-l-2 border-light-blue">
                    <div>
                        <label htmlFor="notif-emergency" className="font-semibold text-dark-accent">Emergency Alerts</label>
                        <p className="text-xs text-dark-accent/70">Critical city-wide safety alerts.</p>
                    </div>
                    <ToggleSwitch id="notif-emergency" isEnabled={settings.notificationSettings.emergency} onToggle={(val) => handleNotificationChange('emergency', val)} />
                </div>
                 <div className="flex justify-between items-center pl-4 border-l-2 border-light-blue">
                    <div>
                        <label htmlFor="notif-events" className="font-semibold text-dark-accent">Predicted Events</label>
                         <p className="text-xs text-dark-accent/70">Updates on high-confidence predicted events.</p>
                    </div>
                    <ToggleSwitch id="notif-events" isEnabled={settings.notificationSettings.events} onToggle={(val) => handleNotificationChange('events', val)} />
                </div>
                 <div className="flex justify-between items-center pl-4 border-l-2 border-light-blue">
                    <div>
                        <label htmlFor="notif-community" className="font-semibold text-dark-accent">Community Updates</label>
                         <p className="text-xs text-dark-accent/70">Notifications for new room suggestions.</p>
                    </div>
                    <ToggleSwitch id="notif-community" isEnabled={settings.notificationSettings.community} onToggle={(val) => handleNotificationChange('community', val)} />
                </div>
            </div>
        </div>
      </div>
      
      <div className="settings-card w-full bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-md border border-white/30" style={{ animationDelay: '0.4s'}}>
        <button
          onClick={onLogout}
          className="w-full text-center py-3 px-4 bg-red-500/10 text-red-700 font-bold rounded-lg border-2 border-red-500/20 hover:bg-red-500/20 transition-colors"
        >
          Log Out
        </button>
      </div>

       <div className="text-center text-sm text-dark-accent/70 p-4 bg-light-blue/30 rounded-lg">
          <p>Your preferences are saved automatically on this device.</p>
        </div>
    </div>
  );
};

export default SettingsView;
