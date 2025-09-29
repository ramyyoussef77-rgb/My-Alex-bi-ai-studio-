import { N8N_BASE_URL } from './apiService';
import { UserState } from '../store/slices/userSlice';

export class RealTimeChatManager {
  private user: UserState;
  private ws: WebSocket | null;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  private messageQueue: any[];
  private eventListeners: Map<string, Set<Function>>;

  constructor(user: UserState) {
    this.user = user;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.messageQueue = [];
    this.eventListeners = new Map();
    
    this.initializeWebSocket();
    this.setupHeartbeat();
  }

  private initializeWebSocket() {
    let wsUrl: string;

    try {
        if (N8N_BASE_URL && N8N_BASE_URL.startsWith('http')) {
            const url = new URL(N8N_BASE_URL);
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${wsProtocol}//${url.host}/chat`;
        } else {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            wsUrl = `${wsProtocol}//${host}/chat`;
        }
        
        this.ws = new WebSocket(wsUrl);
        this.setupWebSocketEvents();
        console.log(`[Chat Manager] Connecting to WebSocket at ${wsUrl}...`);

    } catch (error) {
        console.error(`[Chat Manager] WebSocket connection failed to initialize.`, error);
        this.scheduleReconnect();
    }
  }

  private setupWebSocketEvents() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[Chat Manager] WebSocket connected');
      this.reconnectAttempts = 0;
      this.authenticate();
      this.flushMessageQueue();
      this.emit('connected', null);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.emit('message', message);
      } catch (error) {
        console.error('[Chat Manager] Failed to parse message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('[Chat Manager] WebSocket disconnected:', event.code, event.reason);
      this.emit('disconnected', null);
      if (event.code !== 1000) { // Not a normal closure
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('[Chat Manager] WebSocket error occurred.');
      this.emit('error', error);
    };
  }
  
  private authenticate() {
    // Send full user context for a richer chat experience
    this.send({ 
        type: 'auth', 
        userId: this.user.id,
        displayName: this.user.displayName,
        profile: this.user.profile
    });
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }
  
  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`[Chat Manager] Reconnecting in ${delay}ms...`);
      setTimeout(() => {
        this.reconnectAttempts++;
        this.initializeWebSocket();
      }, delay);
    } else {
      console.error('[Chat Manager] Max reconnection attempts reached.');
      this.emit('connection_failed', null);
    }
  }
  
  private setupHeartbeat() {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }
  
  public send(data: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.messageQueue.push(data);
    }
  }

  public joinRoom(roomId: string) {
    this.send({ type: 'join_room', roomId, userId: this.user.id });
  }

  public leaveRoom(roomId: string) {
    this.send({ type: 'leave_room', roomId, userId: this.user.id });
  }
  
  public sendMessage(roomId: string, content: string) {
    this.send({ 
        type: 'room_message', 
        roomId, 
        userId: this.user.id,
        displayName: this.user.displayName,
        content, 
        timestamp: Date.now() 
    });
  }

  public on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);
  }

  public off(event: string, callback: Function) {
    this.eventListeners.get(event)?.delete(callback);
  }
  
  private emit(event: string, data: any) {
    this.eventListeners.get(event)?.forEach(callback => callback(data));
  }

  public destroy() {
    if (this.ws) {
      this.ws.close(1000, 'Component unmounted');
    }
    this.eventListeners.clear();
  }
}