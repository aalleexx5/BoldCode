import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { supabase } from './supabase';

const VAPID_KEY = 'BN1ZjdLsZkTnAMWjwsHyJqQEq3sHCKLs9Z8FUGZxI-YfzQTgI7E2HqMQI_PzZJXqA4w-8N7R5C_wLvQmS1YmZxQ';

export async function requestNotificationPermission(userId: string): Promise<boolean> {
  try {
    if (!messaging) {
      console.warn('Messaging not supported in this browser');
      return false;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });

      if (token) {
        await saveFCMToken(userId, token);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id,token'
        }
      );

    if (error) {
      console.error('Error saving FCM token:', error);
    }
  } catch (error) {
    console.error('Error in saveFCMToken:', error);
  }
}

export function setupForegroundNotifications(): void {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);

    if (payload.notification) {
      const { title, body } = payload.notification;

      if (Notification.permission === 'granted') {
        new Notification(title || 'New Notification', {
          body: body || '',
          icon: '/favicon.ico',
        });
      }
    }
  });
}

export async function sendNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        data,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send notification:', await response.text());
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
