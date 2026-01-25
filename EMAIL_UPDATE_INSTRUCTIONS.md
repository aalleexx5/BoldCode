# Email Update Instructions

## Overview

This guide will help you update the email addresses for Joe Rodriguez and Faby Rangel to their @boldcodeco.com addresses.

## Users to Update

- **Joe Rodriguez**: joe@boldcodeco.com
- **Faby Rangel**: faby@boldcodeco.com

## Two-Step Process

Email updates require changes in **two places**:
1. **Firestore Database** (profiles collection) - Can be updated via script
2. **Firebase Authentication** - Must be updated manually via Firebase Console

## Step 1: Update Firestore Profiles (Via Script)

Run the provided script to update the email addresses in the profiles collection:

```bash
node update-emails.js
```

This script will:
- Find Joe Rodriguez and Faby Rangel in the profiles collection
- Update their email addresses
- Update the `updated_at` timestamp

Expected output:
```
Starting email updates...
==================================================

Searching for user: Joe Rodriguez...
Found user: Joe Rodriguez (old_email@example.com)
Updating email to: joe@boldcodeco.com
✅ Successfully updated profile email for Joe Rodriguez

Searching for user: Faby Rangel...
Found user: Faby Rangel (old_email@example.com)
Updating email to: faby@boldcodeco.com
✅ Successfully updated profile email for Faby Rangel

==================================================

✨ Email update process completed!
```

## Step 2: Update Firebase Authentication (Manual)

Firebase Authentication emails **cannot** be updated via script and must be changed manually:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **job-tracker-6df94**
3. Navigate to **Authentication** → **Users** in the left sidebar
4. Find each user by their current email address
5. Click on the user to open their details
6. Click the **Edit** button (pencil icon)
7. Update the email address to the new @boldcodeco.com email
8. Click **Save**

### Users to Update in Firebase Auth:
- Find Joe Rodriguez → Change email to: `joe@boldcodeco.com`
- Find Faby Rangel → Change email to: `faby@boldcodeco.com`

## Alternative: Manual Firestore Update (via Console)

If you prefer not to use the script, you can update the Firestore profiles manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **job-tracker-6df94**
3. Navigate to **Firestore Database**
4. Open the **profiles** collection
5. Find each user document
6. Click the document to edit
7. Update the `email` field
8. Update the `updated_at` field to the current timestamp
9. Click **Update**

## Important Notes

⚠️ **Do this BEFORE deploying security rules**
- Once security rules are deployed, email addresses in profiles become immutable
- The security rules prevent email changes to maintain data integrity
- Complete these updates now while the database is still open

✅ **After Updating**
- Users can continue to log in with their new email addresses
- Their profiles will display the correct email
- All authentication will use the new @boldcodeco.com addresses

## Verification

After completing both steps, verify the changes:

1. Try logging in with the new email addresses
2. Check that the profile displays the correct email
3. Verify in Firebase Console that both Auth and Firestore show the new emails

## Need Help?

If you encounter any issues:
- Check that the user names match exactly: "Joe Rodriguez" and "Faby Rangel"
- Ensure you have the correct Firebase project selected
- Verify you have admin/owner permissions on the Firebase project
