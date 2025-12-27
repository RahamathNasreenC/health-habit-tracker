auth.onAuthStateChanged(user => {
  if (!user) return;  // User not signed in, exit

  const uRef = db.collection("users").doc(user.uid);
  const uEntries = uRef.collection("entries");
  const entryMsg = document.getElementById("entryMsg");

  // Attach click handler AFTER user is confirmed logged in and references are valid
  document.getElementById("saveEntryBtn").onclick = () => {
    const date = document.getElementById("entryDate").value || new Date().toISOString().slice(0, 10);
    const stepsVal = Number(document.getElementById("steps").value || 0);
    const sleepVal = Number(document.getElementById("sleep").value || 0);
    const waterVal = Number(document.getElementById("water").value || 0);
    const notesVal = document.getElementById("notes").value || "";

    entryMsg.textContent = "Saving...";

    uEntries.doc(date)
      .set({
        date,
        steps: stepsVal,
        sleepHours: sleepVal,
        waterLiters: waterVal,
        notes: notesVal,
      })
      .then(() => {
        entryMsg.textContent = "Saved!";
      })
      .catch(error => {
        entryMsg.textContent = "Save failed: " + error.message;
        console.error("Save entry error:", error);
      });
  };
});
