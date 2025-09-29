
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RoomSuggestion, DiscussionStarter } from '../types';
import RoomSuggestionCard from './RoomSuggestionCard';
import DiscussionStarterCard from './DiscussionStarterCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCommunityData, selectCommunity } from '../store/slices/communitySlice';
import { selectUser } from '../store/slices/userSlice';
import { RealTimeChatManager } from '../services/chatManager';
import TrendingIcon from './icons/TrendingIcon';
import BackIcon from './icons/BackIcon';

interface CommunityChatViewProps {
  chatManager: RealTimeChatManager;
}

const MessageBubble: React.FC<{ msg: any; isOwn: boolean }> = ({ msg, isOwn }) => (
  <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow ${
        isOwn
          ? 'bg-highlight text-white rounded-br-none'
          : 'bg-white text-dark-accent rounded-bl-none'
      }`}
    >
      {/* Show display name for other users */}
      {!isOwn && <p className="text-xs font-bold text-sea-blue mb-1">{msg.displayName || msg.userId}</p>}
      <p className="leading-snug">{msg.content}</p>
    </div>
  </div>
);

const CommunityChatView: React.FC<CommunityChatViewProps> = ({ chatManager }) => {
  const dispatch = useAppDispatch();
  const { suggestions, topics, loading, error } = useAppSelector(selectCommunity);
  const { id: userId } = useAppSelector(selectUser);
  const [currentRoom, setCurrentRoom] = useState<RoomSuggestion | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchCommunityData());
  }, [dispatch]);

  useEffect(() => {
    const handleMessage = (msg: any) => {
      if (msg.type === 'room_message' && msg.roomId === currentRoom?.suggested_room_name) {
        setMessages(prev => [...prev, msg]);
      }
    };

    chatManager.on('message', handleMessage);
    return () => chatManager.off('message', handleMessage);
  }, [chatManager, currentRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleJoinRoom = (room: RoomSuggestion) => {
    if (currentRoom) {
        chatManager.leaveRoom(currentRoom.suggested_room_name);
    }
    setCurrentRoom(room);
    setMessages([]); // Clear previous messages
    chatManager.joinRoom(room.suggested_room_name);
  };
  
  const handleLeaveRoom = () => {
    if (currentRoom) {
      chatManager.leaveRoom(currentRoom.suggested_room_name);
    }
    setCurrentRoom(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentRoom) {
      chatManager.sendMessage(currentRoom.suggested_room_name, newMessage.trim());
      setNewMessage('');
    }
  };

  if (currentRoom) {
    return (
      <div className="fixed inset-0 bg-sand-beige z-50 flex flex-col animate-slide-in-up">
        <header className="bg-sea-blue text-sand-beige p-4 flex items-center justify-between shadow-lg flex-shrink-0">
          <button onClick={handleLeaveRoom} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <BackIcon className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold font-serif">{currentRoom.suggested_room_name}</h2>
          <div className="w-10" />
        </header>
        <main className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} isOwn={msg.userId === userId} />)}
            <div ref={messagesEndRef} />
          </div>
        </main>
        <footer className="bg-white p-4 border-t border-light-blue flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 border-2 border-light-blue rounded-full focus:ring-2 focus:ring-highlight"
            />
            <button type="submit" className="bg-highlight text-white p-3 rounded-full hover:bg-sea-blue" disabled={!newMessage.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </footer>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-sea-blue">Community Hub</h2>
        <p className="text-dark-accent/80">Connect with others and join the local conversation.</p>
      </div>
      {error && <p className="text-red-500">Error: {error}</p>}
      
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-serif font-bold text-sea-blue flex items-center gap-2"><TrendingIcon className="w-6 h-6" /> What's Buzzing?</h3>
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 w-full"></div>)}
        {topics.map(starter => <DiscussionStarterCard key={starter.topic} starter={starter} />)}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-serif font-bold text-sea-blue">Suggested Rooms</h3>
        {loading && Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-32 w-full"></div>)}
        {suggestions.map(suggestion => <RoomSuggestionCard key={suggestion.suggested_room_name} suggestion={suggestion} onJoinRoom={handleJoinRoom} />)}
      </div>
    </div>
  );
};

export default CommunityChatView;