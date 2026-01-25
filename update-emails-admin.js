import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

// Check if service account file exists
if (!existsSync('./firebase-service-account.json')) {
  console.error('\n❌ ERROR: firebase-service-account.json not found!\n');
  console.log('Please follow these steps:\n');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project: job-tracker-6df94');
  console.log('3. Click ⚙️  → Project settings → Service accounts tab');
  console.log('4. Click "Generate new private key"');
  console.log('5. Download the JSON file');
  console.log('6. Rename it to: firebase-service-account.json');
  console.log('7. Place it in the project root folder (same folder as package.json)\n');
  console.log('For detailed instructions, see: FIREBASE_ADMIN_SETUP.md\n');
  process.exit(1);
}

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  serviceAccount = JSON.parse(
    readFileSync('./firebase-service-account.json', 'utf8')
  );
} catch (error) {
  console.error('\n❌ ERROR: Could not read firebase-service-account.json');
  console.error('Make sure the file is valid JSON.\n');
  console.error('Error details:', error.message, '\n');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('\n❌ ERROR: Could not initialize Firebase Admin SDK');
  console.error('Make sure the service account file is valid.\n');
  console.error('Error details:', error.message, '\n');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

async function updateUserEmail(fullName, newEmail) {
  try {
    console.log(`\nSearching for user: ${fullName}...`);

    // Query profiles collection for the user
    const profilesSnapshot = await db
      .collection('profiles')
      .where('full_name', '==', fullName)
      .get();

    if (profilesSnapshot.empty) {
      console.log(`❌ No user found with name: ${fullName}`);
      return false;
    }

    for (const docSnapshot of profilesSnapshot.docs) {
      const profileData = docSnapshot.data();
      const userId = docSnapshot.id;
      const oldEmail = profileData.email;

      console.log(`Found user: ${profileData.full_name} (${oldEmail})`);
      console.log(`User ID: ${userId}`);
      console.log(`Updating email to: ${newEmail}`);

      // Update Firebase Authentication email
      try {
        await auth.updateUser(userId, {
          email: newEmail
        });
        console.log(`✅ Successfully updated Firebase Auth email`);
      } catch (authError) {
        console.error(`❌ Error updating Firebase Auth:`, authError.message);
        return false;
      }

      // Update Firestore profile
      try {
        await db.collection('profiles').doc(userId).update({
          email: newEmail,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Successfully updated Firestore profile`);
      } catch (firestoreError) {
        console.error(`❌ Error updating Firestore:`, firestoreError.message);
        return false;
      }

      console.log(`✅ All updates completed for ${fullName}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error updating email for ${fullName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Starting email updates with Admin SDK...\n');
  console.log('='.repeat(50));

  // Update Joe Rodriguez
  await updateUserEmail('Joe Rodriguez', 'joe@boldcodeco.com');

  // Update Faby Rangel
  await updateUserEmail('Faby Rangel', 'faby@boldcodeco.com');

  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Email update process completed!');

  process.exit(0);
}

main();
