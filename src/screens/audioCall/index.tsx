import React, { useEffect, useRef, useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  Alert,
  TouchableOpacity,
  BackHandler,
  PermissionsAndroid,
  Platform,
  StatusBar,
  Animated,
  StyleSheet,
  Vibration,
  Image,
  ImageBackground,
  Dimensions
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Svg, Path, G, Circle } from 'react-native-svg';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream
} from 'react-native-webrtc';
import { appColors } from '@src/themes';
import { useValues } from '@src/utils/context/index';
import socketService from '@src/services/socketService';

const { width, height } = Dimensions.get('window');

// Enhanced SVG Icon Components
const PhoneIcon = ({ size = 24, color = "#FFFFFF", rotation = 0 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
    <Path
      d="M20.01 15.38C18.78 15.38 17.59 15.18 16.48 14.82C16.13 14.7 15.74 14.79 15.47 15.06L13.9 17.03C11.07 15.68 8.42 13.13 7.01 10.2L8.96 8.54C9.23 8.26 9.31 7.87 9.2 7.52C8.83 6.41 8.64 5.22 8.64 3.99C8.64 3.45 8.19 3 7.65 3H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21C20.72 21 21 20.37 21 19.82V16.37C21 15.83 20.55 15.38 20.01 15.38Z"
      fill={color}
    />
  </Svg>
);

const CheckIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
      fill={color}
    />
  </Svg>
);

const CloseIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
      fill={color}
    />
  </Svg>
);

const SpeakerIcon = ({ active = false, size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9V15H7L12 20V4L7 9H3Z" fill={active ? "#25D366" : color} />
    <Path 
      d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12Z" 
      fill={active ? "#25D366" : color} 
    />
    {active && (
      <Path 
        d="M14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z" 
        fill="#25D366" 
      />
    )}
  </Svg>
);

const MicIcon = ({ active = false, size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15C13.66 15 15 13.66 15 12V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V12C9 13.66 10.34 15 12 15Z"
      fill={active ? "#25D366" : color}
    />
    <Path
      d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.48 11 18.93V22H13V18.93C16.39 18.48 19 15.53 19 12H17Z"
      fill={active ? "#25D366" : color}
    />
  </Svg>
);

const MicOffIcon = ({ size = 24, color = "#FF3B30" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H17.3C17.3 11.74 17.14 12.43 16.87 13.05L18.1 14.28C18.66 13.3 19 12.19 19 11ZM14.98 11.17C14.98 11.11 15 11.06 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V5.18L14.98 11.17ZM4.27 3L3 4.27L9.01 10.28V11C9 12.66 10.34 14 12 14C12.22 14 12.44 13.97 12.65 13.92L14.31 15.58C13.6 15.91 12.81 16.1 12 16.1C9.24 16.1 7 13.86 7 11.1H5C5 14.41 7.72 17.23 11 17.72V21H13V17.72C13.91 17.59 14.77 17.27 15.54 16.82L19.73 21L21 19.73L4.27 3Z"
      fill={color}
    />
  </Svg>
);

type RootStackParamList = {
  AudioCall: {
    currentUserId: string;
    currentUserName?: string;
    currentUserImage?: string;
    callType: 'outgoing' | 'incoming';
    targetUserId?: string;
    targetUserName?: string;
    targetUserImage?: string;
    callerUserId?: string;
    callerUserName?: string;
    callerUserImage?: string;
    offer?: RTCSessionDescriptionInit;
    callId?: string;
  };
};

interface IceCandidateData {
  toUserId: string;
  candidate: RTCIceCandidate;
  callId?: string;
}

interface AnswerCallData {
  toUserId: string;
  answer: RTCSessionDescriptionInit;
  callId?: string;
  answererUserName?: string;
  answererUserImage?: string;
}

interface UserInfo {
  id: string;
  name: string;
  image?: string;
}

const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
};

// Sound file imports - Update these paths to match your actual file locations
const SOUND_FILES = {
  incoming: Platform.OS === 'ios' ? 'https://whapplepay.com/ringtone.mp3' : 'https://whapplepay.com/ringtone.mp3',
  outgoing: Platform.OS === 'ios' ? 'https://whapplepay.com/ringback.mp3' : 'https://whapplepay.com/ringback.mp3',
  endCall: Platform.OS === 'ios' ? 'https://whapplepay.com/end-call.mp3' : 'https://whapplepay.com/end-call.mp3',
};
// Initialize Sound
Sound.setCategory('Playback');

// Enhanced Sound Manager with vibration during ringtone
class SoundManager {
  private static instance: SoundManager;
  private currentSound: Sound | null = null;
  private isPlaying = false;
  private vibrationInterval: NodeJS.Timeout | null = null;

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async init() {
    console.log('🔊 Initializing Sound Manager with react-native-sound');
    // No specific initialization needed for react-native-sound
  }
  
async playRingtone(): Promise<void> {
  return new Promise((resolve) => {
    this.stop().then(() => {
      try {
        // Select ringtone path
        let soundPath = 'https://whapplepay.com/ringtone.mp3';

        this.currentSound = new Sound(soundPath, '', (error) => {
          if (error) {
            console.log('❌ Error loading ringtone:', error);

            // 🔥 Vibrate if loading fails
            if (Platform.OS === 'android') {
             const pattern = [0, 1000, 1000];
        Vibration.vibrate(pattern, true);

            } else {
              this.vibrationInterval = setInterval(() => {
                Vibration.vibrate(1000);
              }, 2000);
            }

            resolve();
            return;
          }

          // 🎵 When sound loads successfully
          if (this.currentSound) {
            this.currentSound.setNumberOfLoops(-1);

            this.currentSound.play((success) => {
              if (success) {
                console.log('🔊 Playing ringtone + continuous vibration');
                this.isPlaying = true;
const pattern = [0, 1000, 1000];
        Vibration.vibrate(pattern, true);

                // 🔥 Vibrate WHILE playing sound (inline)
                if (Platform.OS === 'android') {
                  const pattern = [0, 1000, 1000];
                  Vibration.vibrate(pattern, true); // Loop vibration
                } else {
                  this.vibrationInterval = setInterval(() => {
                    Vibration.vibrate(1000);
                  }, 2000); // Repeat every 2 seconds
                }

              } else {
                console.log('❌ Error playing ringtone');
                // fallback vibration
                if (Platform.OS === 'android') {
                  const pattern = [0, 1000, 1000];
                  Vibration.vibrate(pattern, true);
                } else {
                  this.vibrationInterval = setInterval(() => {
                    Vibration.vibrate(1000);
                  }, 2000);
                }
              }

              resolve();
            });
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.log('❌ Error playing ringtone:', error);

        // fallback vibration
        if (Platform.OS === 'android') {
          const pattern = [0, 1000, 1000];
          Vibration.vibrate(pattern, true);
        } else {
          this.vibrationInterval = setInterval(() => {
            Vibration.vibrate(1000);
          }, 2000);
        }

        resolve();
      }
    });
  });
}


  async playRingback(): Promise<void> {
    return new Promise(async (resolve) => {
      await this.stop();
      
      try {
        this.currentSound = new Sound(SOUND_FILES.outgoing, Sound.MAIN_BUNDLE, (error) => {
          if (error) {
            console.log('❌ Error loading ringback:', error);
            this.startVibrationPattern();
            resolve();
            return;
          }

          if (this.currentSound) {
            this.currentSound.setNumberOfLoops(-1); // Infinite loop
            this.currentSound.play((success) => {
              if (success) {
                console.log('🔊 Playing ringback from local file with vibration');
                this.isPlaying = true;
                this.startVibrationPattern();
              } else {
                console.log('❌ Error playing ringback');
                this.startVibrationPattern();
              }
            });
          }
          resolve();
        });
      } catch (error) {
        console.log('❌ Error playing ringback:', error);
        this.startVibrationPattern();
        resolve();
      }
    });
  }

  async playEndCall(): Promise<void> {
    return new Promise(async (resolve) => {
      await this.stop();
      
      try {
        this.currentSound = new Sound(SOUND_FILES.endCall, Sound.MAIN_BUNDLE, (error) => {
          if (error) {
            console.log('❌ Error loading end call sound:', error);
            Vibration.vibrate(200);
            resolve();
            return;
          }

          if (this.currentSound) {
            this.currentSound.play((success) => {
              if (success) {
                console.log('🔊 Playing end call sound from local file');
                setTimeout(resolve, 500);
              } else {
                console.log('❌ Error playing end call sound');
                Vibration.vibrate(200);
                setTimeout(resolve, 300);
              }
            });
          } else {
            Vibration.vibrate(200);
            setTimeout(resolve, 300);
          }
        });
      } catch (error) {
        console.log('❌ Error playing end call sound:', error);
        Vibration.vibrate(200);
        setTimeout(resolve, 300);
      }
    });
  }

  async stop() {
    this.isPlaying = false;
    this.stopVibration();
    
    try {
      if (this.currentSound) {
        this.currentSound.stop(() => {
          console.log('🔇 Sounds stopped');
        });
        this.currentSound.release();
        this.currentSound = null;
      }
    } catch (error) {
      console.log('❌ Error stopping sounds:', error);
    }
  }

  release() {
    this.stop();
  }

  private startVibrationPattern() {
    console.log('📳 Starting vibration pattern with ringtone');
    
    // Stop any existing vibration first
    this.stopVibration();
    
    // Vibration pattern: vibrate for 500ms, pause for 1000ms, repeat
    // This creates a pattern that syncs well with ringtone
    if (Platform.OS === 'android') {
      // Android: More precise vibration control
      this.vibrationInterval = setInterval(() => {
        Vibration.vibrate(500);
      }, 1500); // Vibrate every 1.5 seconds (500ms vibration + 1000ms pause)
    } else {
      // iOS: Use pattern vibration
      Vibration.vibrate([500, 1000], true);
    }
    
    console.log('📳 Vibration pattern started');
  }

  private stopVibration() {
    console.log('📳 Stopping vibration');
    
    // Clear interval if it exists
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }
    
    // Cancel any ongoing vibration
    Vibration.cancel();
  }

  // Method to check if sound is currently playing
  isSoundPlaying(): boolean {
    return this.isPlaying;
  }

  // Method to check if vibration is active
  isVibrating(): boolean {
    return this.vibrationInterval !== null;
  }
}

export function AudioCallScreen() { 
  const route = useRoute<RouteProp<RootStackParamList, 'AudioCall'>>();
  const navigation = useNavigation();
  const { 
    currentUserId, 
    currentUserName, 
    currentUserImage,
    callType, 
    targetUserId, 
    targetUserName, 
    targetUserImage, 
    callerUserId, 
    callerUserName, 
    callerUserImage, 
    offer: initialOffer, 
    callId: initialCallId 
  } = route.params;
  
  const { isDark } = useValues();

  const [isConnected, setIsConnected] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connecting' | 'connected' | 'ended'>(
    callType === 'incoming' ? 'ringing' : 'idle'
  );
  const [callDuration, setCallDuration] = useState(0);
  const [localStreamInitialized, setLocalStreamInitialized] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [offer, setOffer] = useState<RTCSessionDescriptionInit | undefined>(initialOffer);
  const [callId, setCallId] = useState<string | undefined>(initialCallId);
  const [otherUser, setOtherUser] = useState<UserInfo>({
    id: callType === 'outgoing' ? targetUserId! : callerUserId!,
    name: callType === 'outgoing' ? targetUserName || 'User' : callerUserName || 'User',
    image: callType === 'outgoing' ? targetUserImage : callerUserImage
  });

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const callDurationRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const soundManagerRef = useRef<SoundManager>(SoundManager.getInstance());

  const currentUser = {
    id: currentUserId,
    name: currentUserName || 'You',
    image: currentUserImage
  };

  // Enhanced sound functions with vibration
  const playSound = async (soundType: 'incoming' | 'outgoing') => {
    console.log(`🔊 Playing ${soundType} sound from local file with vibration`);
    
    try {
      await soundManagerRef.current.stop();
      
      if (soundType === 'incoming') {
        await soundManagerRef.current.playRingtone();
      } else {
        await soundManagerRef.current.playRingback();
      }
    } catch (error) {
      console.log(`❌ Error playing ${soundType} sound:`, error);
    }
  };

  const stopAllSounds = async () => {
    console.log('🔇 Stopping all sounds and vibration');
    try {
      await soundManagerRef.current.stop();
    } catch (error) {
      console.log('Error stopping sounds:', error);
    }
  };

  const playEndCallSound = async (): Promise<void> => {
    console.log('🔊 Playing end-call sound from local file');
    
    await stopAllSounds();
    
    try {
      await soundManagerRef.current.playEndCall();
    } catch (error) {
      console.log('Error playing end-call sound:', error);
      Vibration.vibrate(200);
    }
  };

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    InCallManager.start({ media: 'audio' });
    
    // Initialize sound manager
    soundManagerRef.current.init();
    
    return () => {
      InCallManager.stop();
      stopAllSounds();
      soundManagerRef.current.release();
    };
  }, []);

  // Initialize on component mount
  useEffect(() => {
    console.log('🎬 AudioCallScreen mounted, callType:', callType);
    
    // Start appropriate sound based on call type
    const startSound = async () => {
      if (callType === 'incoming') {
        await playSound('incoming');
      } else if (callType === 'outgoing') {
        await playSound('outgoing');
      }
    };
    
    startSound();
    
    return () => {
      console.log('🧹 AudioCallScreen unmounting');
      cleanup();
      stopAllSounds();
    };
  }, []);

  // Handle call status changes
  useEffect(() => {
    console.log('🔄 Call status changed to:', callStatus);
    
    switch (callStatus) {
      case 'connected':
        stopAllSounds();
        break;
      case 'ended':
        stopAllSounds();
        break;
    }
  }, [callStatus]);

  // Animation effects
  useEffect(() => {
    if (callStatus === 'ringing') {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Ripple animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      rippleAnim.setValue(0);
    }
  }, [callStatus, pulseAnim, rippleAnim]);

  /** ================= PERMISSIONS & AUDIO SETUP ================= */
  const requestAudioPermission = async (): Promise<boolean> => {
    console.log('🎤 Requesting audio permissions...');
    
    if (Platform.OS === 'android') {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        
        if (hasPermission) {
          console.log('✅ Audio permission already granted');
          setPermissionGranted(true);
          return true;
        }

        console.log('📝 Requesting RECORD_AUDIO permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Permission Required',
            message: 'This app needs access to your microphone to make audio calls',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log(`🎤 Audio permission ${isGranted ? 'granted' : 'denied'}`);
        setPermissionGranted(isGranted);
        
        if (!isGranted) {
          Alert.alert(
            'Permission Required',
            'Audio call requires microphone access. Please enable microphone permissions in your app settings.',
            [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]
          );
        }
        
        return isGranted;
      } catch (err) {
        console.error('❌ Permission error:', err);
        setPermissionGranted(false);
        return false;
      }
    } else {
      console.log('📱 iOS - proceeding with audio access');
      setPermissionGranted(true);
      return true;
    }
  };

  const initializeLocalStream = async (): Promise<MediaStream> => {
    console.log('🎤 Initializing microphone for audio call...');
    
    const granted = await requestAudioPermission();
    if (!granted) {
      throw new Error('Microphone permission required for audio calls');
    }

    try {
      console.log('🔊 Getting microphone access...');
      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
          sampleSize: 16
        },
        video: false
      });
      
      console.log('✅ Microphone stream initialized');
      
      setLocalStreamInitialized(true);
      return stream;
    } catch (error) {
      console.error('❌ Failed to access microphone:', error);
      throw new Error(`Could not access microphone: ${error.message}`);
    }
  };

  /** ================= PEER CONNECTION ================= */
  const initializePeerConnection = () => {
    console.log('🔗 Initializing peer connection for audio call');
    
    try {
      const pc = new RTCPeerConnection(WEBRTC_CONFIG);

      pcRef.current = pc;

      // ICE candidate handling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('❄️ Generated ICE candidate');
          
          const targetUserId = callType === 'outgoing' ? otherUser.id : callerUserId;
          if (targetUserId) {
            socketService.sendIceCandidate({ 
              toUserId: targetUserId, 
              candidate: event.candidate, 
              callId 
            });
          }
        }
      };

      // Connection state monitoring
      pc.onconnectionstatechange = () => {
        if (!pc || pc.connectionState === 'closed') return;
        console.log('🔗 Connection state:', pc.connectionState);
        
        switch (pc.connectionState) {
          case 'connected':
            console.log('🎉 AUDIO CALL CONNECTED!');
            setCallStatus('connected');
            setIsInCall(true);
            startCallTimer();
            break;
          case 'connecting':
            console.log('🔄 Call connecting...');
            setCallStatus('connecting');
            break;
          case 'disconnected':
            console.log('🔌 Call disconnected');
            break;
          case 'failed':
            console.log('❌ Call failed');
            Alert.alert('Call Failed', 'The audio connection failed. Please try again.');
            endCall();
            break;
          case 'closed':
            console.log('🔒 Call closed');
            setCallStatus('ended');
            break;
        }
      };

      // Remote stream handling
      pc.ontrack = (event) => {
        console.log('🎵 Remote audio track received');
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          setRemoteStream(event.streams[0]);
        }
      };

      console.log('✅ Peer connection initialized successfully');
      return pc;

    } catch (error) {
      console.error('❌ Failed to initialize peer connection:', error);
      Alert.alert('Error', 'Failed to initialize audio call');
      throw error;
    }
  };

  /** ================= SOCKET.IO ================= */
  useEffect(() => {
    console.log('📡 Setting up socket listeners...');
    
    const handleCallAnswered = async ({ answer }: AnswerCallData) => {
      console.log('✅ Call answered received');

      if (!answer || !answer.sdp || !answer.type) {
        console.error('❌ Invalid answer received');
        return;
      }

      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(answer);
          console.log('✅ Remote description set successfully from answer');
        } catch (error) {
          console.error('❌ Error setting remote description from answer:', error);
        }
      }
    };

    const handleIceCandidate = async ({ candidate }: IceCandidateData) => {
      console.log('❄️ ICE candidate received');
      if (pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('✅ ICE candidate added successfully');
        } catch (error) {
          console.error('❌ Error adding ICE candidate:', error);
        }
      }
    };

    const handleCallEnded = () => { 
      console.log('📞 Call ended by remote user');
      endCall(); 
    };

    const handleCallRejected = () => { 
      console.log('❌ Call rejected by remote user');
      stopAllSounds();
      Alert.alert('Call Declined', 'The user declined your call.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    };

    // Register event listeners
    const unsubscribeCallAnswered = socketService.on('callAnswered', handleCallAnswered);
    const unsubscribeIceCandidate = socketService.on('iceCandidate', handleIceCandidate);
    const unsubscribeCallEnded = socketService.on('callEnded', handleCallEnded);
    const unsubscribeCallRejected = socketService.on('callRejected', handleCallRejected);

    // Start call flow based on call type
    if (socketService.isSocketConnected()) {
      if (callType === 'outgoing') {
        console.log('📤 Starting outgoing call flow');
        startOutgoingCall(); 
      }
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => { 
      if (callStatus === 'ringing') {
        rejectIncomingCall();
      } else {
        endCall();
      }
      return true; 
    });

    return () => { 
      console.log('🧹 Cleaning up socket listeners');
      unsubscribeCallAnswered();
      unsubscribeIceCandidate();
      unsubscribeCallEnded();
      unsubscribeCallRejected();
      backHandler.remove(); 
      cleanup(); 
    };
  }, []);

  /** ================= CALL FLOW ================= */
  const startOutgoingCall = async () => {
    try {
      console.log('🎯 Starting outgoing call to:', otherUser.name);
      setCallStatus('ringing');
      
      // 1. Initialize audio stream
      const stream = await initializeLocalStream();
      localStreamRef.current = stream;

      // 2. Initialize peer connection
      pcRef.current = initializePeerConnection();

      // 3. Add audio tracks
      stream.getTracks().forEach(track => {
        if (pcRef.current) {
          pcRef.current.addTrack(track, stream);
        }
      });

      // 4. Create WebRTC offer
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      // 5. Send call via signaling
      socketService.callUser({
        toUserId: targetUserId!, 
        offer, 
        fromUserId: currentUserId, 
        fromUserName: currentUser.name,
        fromUserImage: currentUser.image,
        callId 
      });
  
      setCallStatus('connecting');
      console.log('✅ Call initiated - waiting for answer...');

    } catch (error) { 
      console.error('❌ CALL FAILED:', error);
      stopAllSounds();
      Alert.alert(
        'Call Failed', 
        `Could not start call: ${error.message}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      ); 
    }
  };

  const acceptIncomingCall = async () => {
    try {
      console.log('🎯 Accepting incoming call');
      setCallStatus('connecting');
      await stopAllSounds();

      // Initialize local stream
      const stream = await initializeLocalStream();
      localStreamRef.current = stream;

      // Initialize peer connection
      pcRef.current = initializePeerConnection();
      
      // Add local tracks
      stream.getTracks().forEach(track => {
        if (pcRef.current) {
          pcRef.current.addTrack(track, stream);
        }
      });

      // Set remote description and create answer
      if (offer) {
        const remoteDescription = new RTCSessionDescription(offer);
        await pcRef.current.setRemoteDescription(remoteDescription);
        
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        // Send answer to the caller
        socketService.answerCall({ 
          toUserId: callerUserId!, 
          answer, 
          callId,
          answererUserName: currentUser.name,
          answererUserImage: currentUser.image
        });
      }
      
    } catch (error) { 
      console.error('❌ ACCEPT CALL ERROR:', error);
      stopAllSounds();
      Alert.alert('Error', `Failed to accept call: ${error.message}`); 
      navigation.goBack(); 
    }
  };

  const rejectIncomingCall = () => { 
    console.log('❌ Rejecting incoming call');
    stopAllSounds();
    socketService.rejectCall({ 
      toUserId: callerUserId!, 
      callId 
    }); 
    navigation.goBack(); 
  };

  const toggleSpeaker = () => {
    const newSpeakerState = !isSpeaker;
    
    if (newSpeakerState) {
      // Turn on speaker and increase volume
      InCallManager.setForceSpeakerphoneOn(true);
      InCallManager.setSpeakerphoneOn(true);
      
      // Increase volume for remote stream if available
      if (remoteStreamRef.current) {
        const audioTracks = remoteStreamRef.current.getAudioTracks();
        audioTracks.forEach(track => {
          track.enabled = true;
        });
      }
      
      console.log('🔊 Speaker ON - Volume increased');
      setIsSpeaker(true);
    } else {
      // Turn off speaker (use earpiece)
      InCallManager.setForceSpeakerphoneOn(false);
      InCallManager.setSpeakerphoneOn(false);
      
      console.log('🔇 Speaker OFF - Using earpiece');
      setIsSpeaker(false);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const newMutedState = !isMicMuted;
      
      audioTracks.forEach(track => {
        // Toggle the enabled state - when muted, disable the track
        track.enabled = !newMutedState;
      });
      
      setIsMicMuted(newMutedState);
      
      if (newMutedState) {
        console.log('🔇 Microphone MUTED');
        Vibration.vibrate(50);
      } else {
        console.log('🎤 Microphone UNMUTED');
        Vibration.vibrate(50);
      }
    }
  };

  const endCall = async () => { 
    console.log('📞 Ending call');
    
    await playEndCallSound();
    
    socketService.endCall({ 
      toUserId: otherUser.id, 
      callId 
    }); 
    
    cleanup(); 
    setTimeout(() => navigation.goBack(), 800);
  };

  const cleanup = async () => { 
    console.log('🧹 Cleaning up call resources');
    
    // Stop all sounds first
    await stopAllSounds();
    
    if (pcRef.current) { 
      pcRef.current.close(); 
      pcRef.current = null; 
    } 
    if (localStreamRef.current) { 
      localStreamRef.current.getTracks().forEach(t => t.stop()); 
      localStreamRef.current = null; 
    } 
    if (remoteStreamRef.current) { 
      remoteStreamRef.current.getTracks().forEach(t => t.stop()); 
      remoteStreamRef.current = null; 
    } 
    
    setIsInCall(false); 
    setCallStatus('ended'); 
    stopCallTimer();
  };

  /** ================= CALL TIMER ================= */
  const startCallTimer = () => { 
    setCallDuration(0); 
    callDurationRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000); 
  };

  const stopCallTimer = () => { 
    if (callDurationRef.current) { 
      clearInterval(callDurationRef.current); 
      callDurationRef.current = null; 
    } 
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusText = () => {
    switch (callStatus) {
      case 'ringing':
        return callType === 'outgoing' ? 'Ringing...' : 'Incoming Call';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call ended';
      default:
        return 'Initializing...';
    }
  };

  const getCallSubtitle = () => {
    switch (callStatus) {
      case 'ringing':
        return callType === 'outgoing' ? `Calling ${otherUser.name}` : `from ${otherUser.name}`;
      case 'connected':
        return 'Secure • Encrypted';
      default:
        return '';
    }
  };

  const renderRipples = () => {
    if (callStatus !== 'ringing') return null;
    
    return (
      <>
        <Animated.View 
          style={[
            styles.ripple,
            {
              opacity: rippleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 0]
              }),
              transform: [{
                scale: rippleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.2]
                })
              }]
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.ripple,
            {
              opacity: rippleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.2, 0.3, 0]
              }),
              transform: [{
                scale: rippleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.8]
                })
              }]
            }
          ]}
        />
      </>
    );
  };

  const renderCallControls = () => {
    if (callType === 'incoming' && !isInCall && callStatus === 'ringing') {
      return (
        <View style={styles.incomingCallControls}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={rejectIncomingCall}
            activeOpacity={0.8}
          >
            <View style={[styles.actionButtonInner, styles.declineButton]}>
              <CloseIcon size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.actionButtonLabel}>Decline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={acceptIncomingCall}
            activeOpacity={0.8}
          >
            <View style={[styles.actionButtonInner, styles.acceptButton]}>
              <PhoneIcon size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.actionButtonLabel}>Accept</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.activeCallControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleMute}
            activeOpacity={0.7}
          >
            <View style={[styles.controlIcon, isMicMuted && styles.mutedIcon]}>
              {isMicMuted ? (
                <MicOffIcon size={26} />
              ) : (
                <MicIcon active={!isMicMuted} size={26} />
              )}
            </View>
            <Text style={[styles.controlLabel, isMicMuted && styles.mutedLabel]}>
              {isMicMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleSpeaker}
            activeOpacity={0.7}
          >
            <View style={[styles.controlIcon, isSpeaker && styles.activeIcon]}>
              <SpeakerIcon active={isSpeaker} size={26} />
            </View>
            <Text style={[styles.controlLabel, isSpeaker && styles.activeLabel]}>
              Speaker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={endCall}
            activeOpacity={0.8}
          >
            <View style={[styles.controlIcon, styles.endCallButton]}>
              <PhoneIcon size={28} color="#FFFFFF" rotation={135} />
            </View>
            <Text style={[styles.controlLabel, styles.endCallLabel]}>End</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  // Background image or gradient fallback
  const backgroundSource = otherUser?.image
    ? { uri: otherUser.image }
    : { uri: 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg' };

  return (
    <ImageBackground 
      source={backgroundSource} 
      style={styles.container}
      blurRadius={20}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Overlay */}
      <View style={styles.overlay} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>RYD</Text>
          <Text style={styles.callType}>
            {callType === 'incoming' ? 'INCOMING CALL' : 'OUTGOING CALL'}
          </Text>
        </View>

        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            {renderRipples()}
            <Animated.View 
              style={[
                styles.animatedAvatar,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
             <View style={styles.avatar}>
  <Image
    source={
      otherUser?.image
        ? { uri: otherUser.image }
        : {
            uri: 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg',
          }
    }
    style={styles.avatarImage}
    resizeMode="cover"
  />
</View>

            </Animated.View>
          </View>

          <Text style={styles.userName}>{otherUser.name}</Text>
          <Text style={styles.callStatus}>{getCallStatusText()}</Text>
          <Text style={styles.callSubtitle}>{getCallSubtitle()}</Text>
          
          {callStatus === 'connected' && (
            <View style={styles.connectionInfo}>
              <View style={styles.connectionDot} />
              <Text style={styles.connectionText}>Secure Connection</Text>
            </View>
          )}
        </View>

        {/* Controls Section */}
        <View style={styles.controlsSection}>
          {renderCallControls()}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>End-to-end encrypted • RYD Secure</Text>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#25D366',
    letterSpacing: 3,
    marginBottom: 8,
    textShadowColor: 'rgba(37, 211, 102, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  callType: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 2,
    opacity: 0.8,
  },
  userSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  animatedAvatar: {
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#25D366',
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'rgba(37, 211, 102, 0.4)',
    shadowColor: '#25D366',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
  },
  avatarText: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 34,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  callStatus: {
    fontSize: 22,
    color: '#25D366',
    fontWeight: '700',
    marginBottom: 6,
    fontVariant: ['tabular-nums'],
  },
  callSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '400',
    marginBottom: 20,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 211, 102, 0.4)',
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#25D366',
    marginRight: 10,
  },
  connectionText: {
    fontSize: 14,
    color: '#25D366',
    fontWeight: '600',
  },
  controlsSection: {
    paddingHorizontal: 20,
  },
  incomingCallControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonInner: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#25D366',
  },
  actionButtonLabel: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeCallControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  activeIcon: {
    backgroundColor: 'rgba(37, 211, 102, 0.25)',
    borderColor: '#25D366',
    shadowColor: '#25D366',
    shadowOpacity: 0.5,
  },
  mutedIcon: {
    backgroundColor: 'rgba(255, 59, 48, 0.25)',
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.5,
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  controlLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
  },
  activeLabel: {
    color: '#25D366',
  },
  mutedLabel: {
    color: '#FF3B30',
  },
  endCallLabel: {
    color: '#FF3B30',
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '500',
  },
});

export default AudioCallScreen;
