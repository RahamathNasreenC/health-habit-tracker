const uRef = () => db.collection("users").doc(auth.currentUser.uid);

auth.onAuthStateChanged(async user => {
  if (!user) return;

  const snap = await uRef().get();
  if (snap.exists) {
    const d = snap.data();
    document.getElementById("displayName").value = d.displayName || "";
    document.getElementById("goalSteps").value = d.goals?.steps || "";
    document.getElementById("goalSleep").value = d.goals?.sleep || "";
    document.getElementById("goalWater").value = d.goals?.water || "";
    if (d.avatarUrl) {
      let avatar = document.getElementById("avatar");
      avatar.src = d.avatarUrl;
      avatar.style.display = "";
    }
  }

  document.getElementById("saveGoalsBtn").onclick = async () => {
    const profileMsg = document.getElementById("profileMsg");
    profileMsg.style.color = "blue";
    profileMsg.textContent = "Saving...";
    try {
      await uRef().set(
        {
          displayName: document.getElementById("displayName").value,
          goals: {
            steps: Number(document.getElementById("goalSteps").value),
            sleep: Number(document.getElementById("goalSleep").value),
            water: Number(document.getElementById("goalWater").value),
          },
        },
        { merge: true }
      );
      profileMsg.style.color = "green";
      profileMsg.textContent = "Profile saved successfully!";
    } catch (e) {
      profileMsg.style.color = "red";
      profileMsg.textContent = "Error saving profile: " + e.message;
    }
  };

  document.getElementById("uploadPicBtn").onclick = async () => {
    try {
      const file = document.getElementById("profilePic").files[0];
      if (!file) return;
      const ref = storage.ref(`avatars/${auth.currentUser.uid}.jpg`);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      await uRef().set({ avatarUrl: url }, { merge: true });
      let avatar = document.getElementById("avatar");
      avatar.src = url;
      avatar.style.display = "";
    } catch (e) {
      alert("Error uploading profile picture: " + e.message);
    }
  };
});
