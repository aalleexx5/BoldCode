import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
const serviceAccount = JSON.parse(
  readFileSync('./firebase-service-account.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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
