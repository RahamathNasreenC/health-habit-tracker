require('dotenv').config();
const admin = require('firebase-admin');

const serviceAccount = require('./new1-2e362-firebase-adminsdk-fbsvc-9ac08ba1d7.json'); // your JSON
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Map of user displayName → email
const userEmails = {
  'Riya': 'riyapatel@example.com',
  'Vijay': 'vijay123@example.com',
  'jOHN': 'john@example.com',
  'Surya': 'surya123@example.com',
  'Meidharshini S': 'meidharshinis5@gmail.com',
  'Nasreen': 'rahamathnasreen401@gmail.com'
};

async function addEmails() {
  try {
    const usersSnapshot = await db.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const email = userEmails[user.displayName];

      if (!email) {
        console.log(`⚠️ No email mapped for ${user.displayName}, skipping`);
        continue;
      }

      await db.collection('users').doc(userDoc.id).update({ email });
      console.log(`✅ Added email for ${user.displayName}: ${email}`);
    }

    console.log('🎉 All emails added!');
  } catch (err) {
    console.error(err);
  }
}

addEmails();
