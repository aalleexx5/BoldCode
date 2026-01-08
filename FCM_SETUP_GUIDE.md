# Firebase Cloud Messaging Setup Guide

This guide will help you complete the Firebase Cloud Messaging setup for your application.

## What Has Been Set Up

The following has been implemented:

1. FCM configuration in Firebase library
2. Notification service for handling FCM tokens and sending notifications
3. Service worker for background notifications
4. Notification permissions request (asks users 2 seconds after login)
5. Edge function to send notifications via FCM
6. Notification trigger when a new request is created and assigned to someone

## Steps to Complete Setup

### 1. Enable Firebase Cloud Messaging

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **job-tracker-6df94**
3. Click on the gear icon (Settings) → Project settings
4. Navigate to the **Cloud Messaging** tab
5. Under **Cloud Messaging API (Legacy)**, you'll see your **Server Key**
6. Copy this server key - you'll need it for the next step

### 2. Add FCM Server Key to Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions**
3. Under **Secrets**, add a new secret:
   - Name: `FCM_SERVER_KEY`
   - Value: [Paste your FCM Server Key from step 1]

### 3. Create FCM Tokens Table in Supabase

Run the following SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);

ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own FCM tokens"
  ON fcm_tokens FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own FCM tokens"
  ON fcm_tokens FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own FCM tokens"
  ON fcm_tokens FOR UPDATE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own FCM tokens"
  ON fcm_tokens FOR DELETE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

### 4. Deploy the Edge Function

The edge function code is located at: `supabase/functions/send-notification/index.ts`

To deploy it, use the Supabase CLI:

```bash
supabase functions deploy send-notification
```

### 5. Get Your VAPID Key

The notification service uses a placeholder VAPID key. You need to generate your own:

1. Go to Firebase Console → Your Project → Project Settings → Cloud Messaging
2. Under **Web configuration**, find or generate your **Web Push certificates**
3. Copy the **Key pair** value
4. Update the `VAPID_KEY` in `src/lib/notifications.ts` with your actual key

### 6. Test the Notifications

1. Log in to your application
2. You should see a browser permission prompt asking to allow notifications
3. Allow notifications
4. Create a new request and assign it to another user
5. The assigned user should receive a notification

## How It Works

### When a User Logs In
- The app requests notification permission (after 2 seconds)
- If granted, it generates an FCM token
- The token is saved to the `fcm_tokens` table in Supabase

### When a Request is Created
- If the request is assigned to someone other than the creator
- The app calls the `send-notification` edge function
- The edge function retrieves the assigned user's FCM tokens from Supabase
- It sends the notification via Firebase Cloud Messaging
- The notification appears in the user's browser

### Notification Types
- **Foreground**: When the user has the app open, handled by `onMessage`
- **Background**: When the app is closed or minimized, handled by the service worker

## Troubleshooting

### Notifications Not Appearing
1. Check browser console for errors
2. Verify notification permissions are granted
3. Ensure the FCM token is saved in Supabase
4. Check that the edge function is deployed
5. Verify the FCM_SERVER_KEY environment variable is set

### Service Worker Not Registering
1. Ensure the app is served over HTTPS (or localhost)
2. Check the browser console for service worker errors
3. Try unregistering and re-registering the service worker

### Token Not Saving
1. Check the Supabase RLS policies are correctly set
2. Verify the user is authenticated
3. Check browser console for Supabase errors

## Future Enhancements

Consider adding:
- Notification preferences (allow users to control what they're notified about)
- Notification history
- Read/unread status
- In-app notification center
- Email fallback for critical notifications
- Notification for request status changes
- Notification for comments on assigned requests
