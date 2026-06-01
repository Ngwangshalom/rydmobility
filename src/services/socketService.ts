// services/socketService.ts
import io, { Socket } from 'socket.io-client';
import { SERVER_URL } from '@src/api/config';

// ==== Type definitions ====
export interface CallUserData {
  toUserId: string;
  offer: RTCSessionDescriptionInit;
  fromUserId: string;
  fromUserName?: string;
  fromUserImage?: string;
  callId?: string;
}

export interface AnswerCallData {
  toUserId: string;
  answer: RTCSessionDescriptionInit;
  callId?: string;
  answererUserName?: string;
  answererUserImage?: string;
}

export interface RejectCallData {
  toUserId: string;
  callId?: string;
}

export interface EndCallData {
  toUserId: string;
  callId?: string;
}

export interface IceCandidateData {
  toUserId: string;
  candidate: RTCIceCandidate;
  callId?: string;
}

export interface MuteStateData {
  toUserId: string;
  isMuted: boolean;
  callId?: string;
}

// ==== User data for join ====
export interface UserData {
  userId: string;
  userName?: string;
  userImage?: string;
  userType?: string;
}

// ==== Event callback types ====
type SocketEventCallback = (data?: any) => void;
type ConnectionEventCallback = () => void;
type ErrorEventCallback = (error: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, SocketEventCallback[]> = new Map();
  private userData: UserData | null = null;

  // ==== Initialize socket connection ====
  initialize(userData: UserData): void {
    if (this.socket) {
      console.log('🔄 Socket already initialized');
      return;
    }

    this.userData = userData;
    console.log('🔌 Initializing socket connection for user:', userData.userId);

    this.socket = io(SERVER_URL, {
      transports: ['websocket'],
      query: { userId: userData.userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // ==== Connection Events ====
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('🟢 Socket connected:', this.socket?.id);
      this.emitToAll('socketConnected');

      // ✅ Join the signaling server automatically with full userData
      if (this.userData) {
        this.socket!.emit('join', this.userData);
        console.log(`✅ Joined signaling server as user: ${this.userData.userId}`);
      } else {
        console.warn('⚠️ No userData found while connecting socket.');
      }
    });

    this.socket.on('joined', ({ socketId }) => {
      console.log(`📡 Server acknowledged join: ${socketId}`);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.isConnected = false;
      this.emitToAll('socketDisconnected');
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 Socket reconnected');
      this.isConnected = true;
      this.emitToAll('socketReconnected');

      // Re-join after reconnect
      if (this.userData) {
        this.socket!.emit('join', this.userData);
        console.log(`♻️ Rejoined signaling server as user: ${this.userData.userId}`);
      }
    });

    this.socket.on('error', (error: any) => {
      console.log('❌ Socket error:', error);
      this.emitToAll('socketError', error);
    });

    // ==== Call Events ====
    this.socket.on('incomingCall', (data: any) => {
      console.log('📞 Incoming call received:', data);
      this.emitToAll('incomingCall', data);
    });

    this.socket.on('callAnswered', (data: any) => {
      console.log('✅ Call answered:', data);
      this.emitToAll('callAnswered', data);
    });

    this.socket.on('callRejected', (data: any) => {
      console.log('❌ Call rejected:', data);
      this.emitToAll('callRejected', data);
    });

    this.socket.on('callEnded', (data: any) => {
      console.log('📞 Call ended:', data);
      this.emitToAll('callEnded', data);
    });

    this.socket.on('iceCandidate', (data: any) => {
      console.log('❄️ ICE candidate received:', data);
      this.emitToAll('iceCandidate', data);
    });

    this.socket.on('userUnavailable', (data: any) => {
      console.log('❌ User unavailable:', data);
      this.emitToAll('userUnavailable', data);
    });
  }

  // ==== Utility Methods ====
  getSocket(): Socket | null {
    if (!this.socket) console.warn('⚠️ Socket not initialized. Call initialize() first.');
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.socket !== null && this.isConnected;
  }

  emit(event: string, data?: any): void {
    if (this.isSocketConnected()) {
      console.log(`📤 Emitting ${event}:`, data);
      this.socket!.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit ${event}: Socket not connected`);
    }
  }

  // ==== Event Registration ====
  on(event: string, callback: SocketEventCallback): () => void {
    if (!this.eventListeners.has(event)) this.eventListeners.set(event, []);
    this.eventListeners.get(event)!.push(callback);

    if (this.socket) this.socket.on(event, callback);

    return () => this.off(event, callback);
  }

  onConnected(callback: ConnectionEventCallback): () => void {
    return this.on('socketConnected', callback);
  }
  onDisconnected(callback: ConnectionEventCallback): () => void {
    return this.on('socketDisconnected', callback);
  }
  onReconnected(callback: ConnectionEventCallback): () => void {
    return this.on('socketReconnected', callback);
  }
  onError(callback: ErrorEventCallback): () => void {
    return this.on('socketError', callback);
  }

  off(event: string, callback: SocketEventCallback): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    }
    if (this.socket) this.socket.off(event, callback);
  }

  private emitToAll(event: string, data?: any): void {
    if (!this.eventListeners.has(event)) return;
    for (const callback of this.eventListeners.get(event)!) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in listener for ${event}:`, error);
      }
    }
  }

  // ==== Call-related Methods ====
  callUser(data: CallUserData): void { 
    console.log('📞 Making call to:', data.toUserId);
    this.emit('callUser', data); 
  }
  
  answerCall(data: AnswerCallData): void { 
    console.log('✅ Answering call from:', data.toUserId);
    this.emit('answerCall', data); 
  }
  
  rejectCall(data: RejectCallData): void { 
    console.log('❌ Rejecting call from:', data.toUserId);
    this.emit('rejectCall', data); 
  }
  
  endCall(data: EndCallData): void { 
    console.log('📞 Ending call with:', data.toUserId);
    this.emit('endCall', data); 
  }
  
  sendIceCandidate(data: IceCandidateData): void { 
    this.emit('iceCandidate', data); 
  }
  
  sendMuteState(data: MuteStateData): void { 
    this.emit('muteState', data); 
  }

  // ==== Connection control ====
  getUserData(): UserData | null { return this.userData; }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
      this.userData = null;
    }
  }

  reconnect(): void {
    if (this.userData) {
      console.log('🔄 Reconnecting socket...');
      this.disconnect();
      this.initialize(this.userData);
    }
  }

  getConnectionStatus(): { isConnected: boolean; userData: UserData | null } {
    return { isConnected: this.isConnected, userData: this.userData };
  }
}

// Singleton export
const socketService = new SocketService();
export default socketService;
