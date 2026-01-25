import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth, updateEmail } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAlgl_5ww2V01BR_aQqPSzjprqVxzzP3WY",
  authDomain: "job-tracker-6df94.firebaseapp.com",
  projectId: "job-tracker-6df94",
  storageBucket: "job-tracker-6df94.firebasestorage.app",
  messagingSenderId: "221811935787",
  appId: "1:221811935787:web:65e5e589c050bd72cef86e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateUserEmail(fullName, newEmail) {
  try {
    console.log(`\nSearching for user: ${fullName}...`);

    // Query profiles collection for the user
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('full_name', '==', fullName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`❌ No user found with name: ${fullName}`);
      return false;
    }

    // Update each matching profile
    for (const docSnapshot of querySnapshot.docs) {
      const profileData = docSnapshot.data();
      console.log(`Found user: ${profileData.full_name} (${profileData.email})`);
      console.log(`Updating email to: ${newEmail}`);

      // Update the profile document
      await updateDoc(doc(db, 'profiles', docSnapshot.id), {
        email: newEmail,
        updated_at: new Date().toISOString()
      });

      console.log(`✅ Successfully updated profile email for ${fullName}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error updating email for ${fullName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Starting email updates...\n');
  console.log('='.repeat(50));

  // Update Joe Rodriguez
  await updateUserEmail('Joe Rodriguez', 'joe@boldcodeco.com');

  // Update Faby Rangel
  await updateUserEmail('Faby Rangel', 'faby@boldcodeco.com');

  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Email update process completed!');
  console.log('\n⚠️  IMPORTANT NOTE:');
  console.log('The emails in the Firestore profiles have been updated.');
  console.log('However, Firebase Authentication emails cannot be updated via script.');
  console.log('\nTo update Firebase Auth emails, you have two options:');
  console.log('1. Have each user log in and update via Firebase Console');
  console.log('2. Manually update in Firebase Console → Authentication → Users');
  console.log('   - Find each user by their current email');
  console.log('   - Click the user → Edit → Change email address\n');

  process.exit(0);
}

main();
