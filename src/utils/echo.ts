import Echo from 'laravel-echo';
import { getValue } from './localstorage';
import { URL as API_URL } from '@src/api/config';
// @ts-ignore
const PusherClient = require('pusher-js/react-native').Pusher || require('pusher-js/react-native');
PusherClient.logToConsole = true;
// @ts-ignore
window.Pusher = PusherClient;

let echoInstance: any = null;
let cachedToken: string | null = null;

const getEchoInstance = async () => {
  const token = await getValue('token');

  if (echoInstance && cachedToken === token) {
    return echoInstance;
  }

  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch (e) {
      console.error("Error disconnecting stale Echo instance:", e);
    }
  }

  cachedToken = token;

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: '5e33ca9d4c3e62a5d5a9',
    cluster: 'ap2',
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    Pusher: PusherClient,
    authEndpoint: `${API_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
   authorizer: (channel: any) => {
  return {
    authorize: (socketId: string, callback: Function) => {
      console.log('Auth attempt:', {
        socketId,
        channelName: channel.name,
        token,
        url: `${API_URL}/api/broadcasting/auth`,
      });
      fetch(`${API_URL}/api/broadcasting/auth`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          socket_id: socketId,
          channel_name: channel.name,
        }),
      })
        .then(res => {
          console.log('Auth response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('Auth response data:', data);
          callback(null, data);
        })
        .catch(err => {
          console.error('Auth error:', err);
          callback(err, null);
        });
    },
  };
},
  });

  return echoInstance;
};

export default getEchoInstance;