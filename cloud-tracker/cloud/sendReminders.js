require('dotenv').config();
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

if (!admin.apps.length) {
  const serviceAccount = require(`./${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
console.log('✅ Firebase initialized successfully');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const db = admin.firestore();

// Motivational messages per habit
const habitMessages = {
  drinkWater: ["Time to hydrate! Drink a glass of water.", "Stay hydrated for better health!"],
  steps: ["Let's get moving! Take a short walk.", "Keep those steps going!"],
  sleep: ["Wind down and get quality sleep tonight.", "A good sleep is key to a healthy day!"],
  all: ["Maintain your healthy habits today!"]
};

// Send email helper
async function sendEmail(to, subject, text, html) {
  if (!to) return;
  const msg = { to, from: process.env.SENDGRID_VERIFIED_SENDER, subject, text, html };
  try { await sgMail.send(msg); console.log(`✅ Email sent to ${to}`); }
  catch (err) { console.error(`❌ Failed to send email to ${to}: ${err.message}`); }
}

// Main function
async function sendReminders() {
  console.log('🚀 Starting reminder process...');
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const usersSnap = await db.collection('users').get();
  for (const userDoc of usersSnap.docs) {
    const user = userDoc.data();
    const userEmail = user.email;
    if (!userEmail) continue;

    // Habit reminders
    const remindersSnap = await db.collection('users').doc(userDoc.id).collection('reminders').get();
    for (const remDoc of remindersSnap.docs) {
      const r = remDoc.data();
      if (!r.active) continue;

      const [hourStr, minuteStr] = r.time.split(':');
      if (parseInt(hourStr,10) === currentHour && parseInt(minuteStr,10) === currentMinute) {
        const messages = habitMessages[r.habitId] || habitMessages.all;
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        await sendEmail(userEmail, `Reminder: ${r.habitName}`, randomMsg, `<p>${randomMsg}</p>`);
      }
    }

    // General 3 PM reminder
    if (currentHour === 15 && currentMinute === 0) {
      const allMsgs = [].concat(...Object.values(habitMessages));
      const randomQuote = allMsgs[Math.floor(Math.random() * allMsgs.length)];
      await sendEmail(userEmail, "Daily Health Motivation", randomQuote, `<p>${randomQuote}</p>`);
    }
  }
  console.log('🎉 All reminders processed!');
}

sendReminders();
