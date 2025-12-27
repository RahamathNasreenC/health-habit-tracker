require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require(`./${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Sample habits to add
const sampleHabits = [
  { habitName: 'Drink Water', goal: '8 glasses' },
  { habitName: 'Morning Walk', goal: '30 minutes' },
  { habitName: 'Sleep Early', goal: '7 hours' },
  { habitName: 'Read Book', goal: '20 pages' },
];

async function populateHabits() {
  try {
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
      console.log('⚠️ No users found');
      return;
    }

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const userEmail = userData.email || `placeholder_${userId}@example.com`;

      console.log(`Adding habits for ${userData.displayName || userId} (${userEmail})`);

      for (const habit of sampleHabits) {
        const habitRef = db.collection('users').doc(userId).collection('habits').doc();
        await habitRef.set(habit);
        console.log(`✅ Habit added: ${habit.habitName}`);
      }

      console.log('-----------------------------------');
    }

    console.log('🎉 All habits populated!');
  } catch (err) {
    console.error('🔥 Error populating habits:', err.message);
  }
}

populateHabits();
