auth.onAuthStateChanged(async user => {
  if (!user) return;

  const uRef = db.collection("users").doc(user.uid);
  const remindersRef = uRef.collection("reminders");
  const habitSelect = document.getElementById("habitSelect");
  const frequencySelect = document.getElementById("frequency");
  const reminderMsg = document.getElementById("reminderMsg");
  const reminderList = document.getElementById("reminderList");
  const reminderListSection = document.getElementById("reminderListSection");

  // Load user's habits dynamically
  const habitsSnap = await uRef.collection("habits").get();
  habitsSnap.forEach(habitDoc => {
    const habit = habitDoc.data();
    const opt = document.createElement("option");
    opt.value = habitDoc.id;
    opt.textContent = habit.habitName || habitDoc.id;
    habitSelect.appendChild(opt);
  });

  // Save new reminder
  document.getElementById("saveReminderBtn").addEventListener("click", async () => {
    const habitId = habitSelect.value;
    const habitName = habitSelect.options[habitSelect.selectedIndex].text;
    const time = document.getElementById("reminderTime").value;
    const frequency = frequencySelect.value;

    if (!time) {
      reminderMsg.style.color = "red";
      reminderMsg.textContent = "Please select a time.";
      return;
    }

    const reminderData = {
      habitId,
      habitName,
      time,
      frequency,
      active: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await remindersRef.add(reminderData);
      reminderMsg.style.color = "green";
      reminderMsg.textContent = "✅ Reminder saved successfully!";
      loadReminders();
    } catch (err) {
      reminderMsg.style.color = "red";
      reminderMsg.textContent = "Error: " + err.message;
    }
  });

  async function loadReminders() {
    const snap = await remindersRef.orderBy("createdAt", "desc").get();
    reminderList.innerHTML = "";
    if (snap.empty) {
      reminderListSection.style.display = "none";
      return;
    }
    reminderListSection.style.display = "block";
    snap.forEach(doc => {
      const r = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${r.habitName}</strong> — ${r.time} (${r.frequency})
        <button class="delete-btn" data-id="${doc.id}">❌</button>
      `;
      reminderList.appendChild(li);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;
        await remindersRef.doc(id).delete();
        loadReminders();
      });
    });
  }

  loadReminders();
});
