# Firebase Admin Setup Guide

This guide explains how to update Firebase Authentication emails using the Firebase Admin SDK.

## Prerequisites

You need a Firebase service account key to run administrative scripts that can update both Firebase Authentication and Firestore.

## Step 1: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **job-tracker-6df94**
3. Click the **gear icon** ⚙️ next to "Project Overview"
4. Select **Project settings**
5. Navigate to the **Service accounts** tab
6. Click **Generate new private key**
7. Click **Generate key** in the confirmation dialog
8. A JSON file will be downloaded (e.g., `job-tracker-6df94-firebase-adminsdk-xxxxx.json`)

## Step 2: Rename and Place the Key File

1. Rename the downloaded file to: `firebase-service-account.json`
2. Move it to the root of this project directory (same folder as `package.json`)
3. **IMPORTANT**: This file is already in `.gitignore` and will NOT be committed to git

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run the Email Update Script

```bash
npm run update-emails
```

This script will:
- Update Firebase Authentication emails for Joe Rodriguez and Faby Rangel
- Update Firestore profile documents
- Provide detailed output of each step

## Security Notes

- **NEVER** commit the service account key file to version control
- The service account key grants full admin access to your Firebase project
- Keep this file secure and only use it on trusted machines
- If the key is compromised, revoke it immediately in Firebase Console → Project Settings → Service Accounts

## What the Script Does

The `update-emails-admin.js` script:

1. Initializes Firebase Admin SDK with your service account
2. Searches for users by their full name in Firestore
3. Updates Firebase Authentication email (requires admin privileges)
4. Updates Firestore profile document
5. Uses server timestamp for `updated_at` field

## Troubleshooting

**Error: ENOENT: no such file or directory, open './firebase-service-account.json'**
- Make sure you downloaded and renamed the service account key file correctly
- Verify the file is in the project root directory

**Error: Service account object must contain a string "project_id" property**
- The service account JSON file is invalid or corrupted
- Re-download the service account key from Firebase Console

**Error: Insufficient permissions**
- Make sure you're using the service account key (not regular Firebase config)
- Verify the service account has the necessary roles (should have by default)

## After Running the Script

After successfully updating emails:
1. Users can log in with their new email addresses
2. All existing data and permissions remain intact
3. Firebase Authentication and Firestore will be in sync
