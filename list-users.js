import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

if (!existsSync('./firebase-service-account.json')) {
  console.error('\n❌ ERROR: firebase-service-account.json not found!\n');
  process.exit(1);
}

const serviceAccount = JSON.parse(
  readFileSync('./firebase-service-account.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listAllUsers() {
  console.log('\n📋 Listing all users in the database:\n');
  console.log('='.repeat(70));

  try {
    const profilesSnapshot = await db.collection('profiles').get();

    if (profilesSnapshot.empty) {
      console.log('No users found in the database.');
      return;
    }

    console.log(`Found ${profilesSnapshot.size} user(s):\n`);

    profilesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. User ID: ${doc.id}`);
      console.log(`   Full Name: ${data.full_name || 'N/A'}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Role: ${data.role || 'N/A'}`);
      console.log('');
    });

    console.log('='.repeat(70));
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }

  process.exit(0);
}

listAllUsers();
