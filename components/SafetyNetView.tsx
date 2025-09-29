import React, { useEffect } from 'react';
import { SafetyNetResponse, EmergencyServiceType } from '../types';
import ShieldIcon from './icons/ShieldIcon';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSafetyData, selectSafety } from '../store/slices/safetySlice';

const AlertLevelIndicator: React.FC<{ level: SafetyNetResponse['alertLevel']; message: string }> = ({ level, message }) => {
  const levelStyles = {
    Normal: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', iconColor: 'text-green-600' },
    Advisory: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800', iconColor: 'text-yellow-600' },
    Emergency: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', iconColor: 'text-red-600' },
  };
  const styles = levelStyles[level];

  return (
    <div className={`alert w-full ${styles.bg} border-l-4 ${styles.border} ${styles.text} p-4 rounded-lg`} role="alert">
      <div className="flex items-center">
        <ShieldIcon className={`w-6 h-6 mr-3 ${styles.iconColor}`} />
        <div>
          <p className="font-bold">City Alert Level: {level}</p>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

const ServiceIcon: React.FC<{ type: EmergencyServiceType; className?: string }> = ({ type, className }) => {
    if (type === 'Hospital') return <div className={`w-3 h-3 rounded-full bg-red-500 border-2 border-white ${className}`} title="Hospital"></div>;
    if (type === 'Police') return <div className={`w-3 h-3 rounded-full bg-blue-500 border-2 border-white ${className}`} title="Police"></div>;
    return <div className={`w-3 h-3 rounded-full bg-orange-500 border-2 border-white ${className}`} title="Fire Dept."></div>;
}

const SafetyNetView: React.FC = () => {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector(selectSafety);

    useEffect(() => {
        dispatch(fetchSafetyData());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="w-full flex flex-col gap-6">
                <div className="text-center">
                    <div className="skeleton skeleton-text h-8 w-1/2 mx-auto mb-2"></div>
                    <div className="skeleton skeleton-text h-4 w-3/4 mx-auto"></div>
                </div>
                <div className="skeleton h-20 rounded-lg"></div>
                <div className="skeleton skeleton-text h-6 w-1/3 mb-2"></div>
                <div className="skeleton h-40 rounded-lg"></div>
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
    
    if (!data) return null;

    return (
        <div className="w-full flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl font-serif font-bold text-sea-blue">Safety Net</h2>
                <p className="text-dark-accent/80">Your guide to staying safe in Alexandria.</p>
            </div>
            
            <AlertLevelIndicator level={data.alertLevel} message={data.alertMessage} />

            <div>
                <h3 className="text-2xl font-serif font-bold text-sea-blue mb-4">Safety Tips</h3>
                <ul className="list-disc list-inside space-y-2 text-dark-accent bg-white/60 p-6 rounded-lg shadow-md">
                    {data.safetyTips.map((tip, index) => <li key={index}>{tip}</li>)}
                </ul>
            </div>
            
            <div>
                 <h3 className="text-2xl font-serif font-bold text-sea-blue mb-4">Emergency Services Map</h3>
                 <div className="relative bg-light-blue h-64 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                    <img src="https://i.imgur.com/2c5YJ1V.png" alt="Map of Alexandria" className="w-full h-full object-cover opacity-50"/>
                     {data.emergencyServices.map(service => (
                        <div key={service.id} className="absolute" style={{ top: `${(service.lat - 31.19) * 1000}%`, left: `${(service.lng - 29.90) * 500}%` }}>
                            <ServiceIcon type={service.type} />
                        </div>
                    ))}
                 </div>
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                     {data.emergencyServices.map(service => (
                        <div key={service.id} className="bg-white/70 p-4 rounded-lg shadow-md">
                           <p className="font-bold text-sea-blue">{service.name} <span className="text-xs font-normal text-dark-accent/70">({service.type})</span></p>
                           <p className="text-sm text-dark-accent">{service.address}</p>
                           <a href={`tel:${service.phone}`} className="text-sm text-highlight font-semibold hover:underline">{service.phone}</a>
                        </div>
                     ))}
                 </div>
            </div>
             <p className="text-center text-xs text-dark-accent/60">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
             </p>
        </div>
    );
};

export default SafetyNetView;