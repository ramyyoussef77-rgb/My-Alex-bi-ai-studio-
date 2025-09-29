import React from 'react';
import { DiscussionStarter } from '../types';

interface DiscussionStarterCardProps {
  starter: DiscussionStarter;
}

const DiscussionStarterCard: React.FC<DiscussionStarterCardProps> = ({ starter }) => {
  return (
    <div className="discussion-starter-card bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-md border border-white/30">
        <span className="text-xs font-bold uppercase text-highlight">{starter.topic}</span>
        <p className="font-semibold text-sea-blue mt-1">{starter.starter_question}</p>
    </div>
  );
};

export default DiscussionStarterCard;