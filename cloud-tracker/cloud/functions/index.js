const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();

// SendGrid API key from Firebase config
sgMail.setApiKey(functions.config().sendgrid.key);

// Weekly summary (existing)
exports.weeklySummary = functions.pubsub
  .schedule('every sunday 23:00')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    const usersSnap = await admin.firestore().collection('users').get();
    for (const doc of usersSnap.docs) {
      const entries = await doc.ref.collection('entries').orderBy('date', 'desc').limit(7).get();
      let steps=0,sleep=0,water=0,count=0;
      entries.forEach(d=>{const e=d.data(); steps+=e.steps||0; sleep+=e.sleepHours||0; water+=e.waterLiters||0; count++;});
      const summary={avgSteps:steps/count,avgSleep:sleep/count,avgWater:water/count,createdAt:admin.firestore.FieldValue.serverTimestamp()};
      await doc.ref.collection('summaries').add(summary);
    }
  });

// --- NEW: Send email reminders ---
exports.sendReminders = functions.pubsub
  .schedule('every 1 minutes')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();

    const usersSnap = await admin.firestore().collection('users').get();

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const userEmail = userData.email;

      if (!userEmail) continue;

      const remindersSnap = await userDoc.ref.collection('reminders')
        .where('enabled', '==', true)
        .where('nextTrigger', '<=', now)
        .get();

      for (const rDoc of remindersSnap.docs) {
        const r = rDoc.data();

        // Send email via SendGrid
        const msg = {
          to: userEmail,
          from: 'meidharshinis6@gmail.com', // replace with your verified SendGrid email
          subject: `Habit Reminder: ${r.habit}`,
          text: r.message,
        };

        try {
          await sgMail.send(msg);
          console.log(`Email sent to ${userEmail} for ${r.habit}`);
        } catch (e) {
          console.error(`Error sending email to ${userEmail}:`, e);
        }

        // Update nextTrigger
        let nextTriggerDate = r.nextTrigger.toDate();

        if (r.type === 'daily') {
          nextTriggerDate.setDate(nextTriggerDate.getDate() + 1);
        } else if (r.type === 'weekly') {
          if (r.days && r.days.length > 0) {
            const today = nextTriggerDate.getDay();
            const dayOffsets = r.days.map(d => (d - today + 7) % 7).filter(o => o > 0);
            const offset = dayOffsets.length ? Math.min(...dayOffsets) : 7;
            nextTriggerDate.setDate(nextTriggerDate.getDate() + offset);
          } else {
            nextTriggerDate.setDate(nextTriggerDate.getDate() + 7);
          }
        } else if (r.type === 'one-time') {
          await rDoc.ref.delete(); // remove one-time reminders
          continue;
        }

        await rDoc.ref.update({
          nextTrigger: admin.firestore.Timestamp.fromDate(nextTriggerDate)
        });
      }
    }

    return null;
  });
