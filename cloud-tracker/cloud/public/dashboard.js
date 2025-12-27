let chartInstance = null;

auth.onAuthStateChanged(async user => {
  if (!user) return;

  const uRef = () => db.collection("users").doc(user.uid);
  const uEntries = uRef().collection("entries");

  document.getElementById("logoutBtn").onclick = () =>
    auth.signOut().then(() => (window.location.href = "index.html"));

  uEntries.orderBy("date", "desc").limit(7).onSnapshot(snapshot => {
    const entries = [];
    snapshot.forEach(doc => entries.push(doc.data()));
    entries.reverse();

    document.getElementById("entriesList").innerHTML = entries
      .map(
        e =>
          `<div><b>${e.date}</b>: Steps ${e.steps}, Sleep ${e.sleepHours} hrs, Water ${e.waterLiters} L</div>`
      )
      .join("");

    if (chartInstance) chartInstance.destroy();

    const ctx = document.getElementById("stepsChart").getContext("2d");
    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: entries.map(e => e.date),
        datasets: [
          {
            label: "Steps",
            data: entries.map(e => e.steps),
            borderColor: "#3e95cd",
            fill: false,
          },
          {
            label: "Sleep (hrs)",
            data: entries.map(e => e.sleepHours),
            borderColor: "#8e5ea2",
            fill: false,
          },
          {
            label: "Water (L)",
            data: entries.map(e => e.waterLiters),
            borderColor: "#3cba9f",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        scales: { y: { beginAtZero: true } },
      },
    });

    const avgSteps =
      entries.reduce((sum, e) => sum + (e.steps || 0), 0) / entries.length;
    const avgSleep =
      entries.reduce((sum, e) => sum + (e.sleepHours || 0), 0) / entries.length;
    const avgWater =
      entries.reduce((sum, e) => sum + (e.waterLiters || 0), 0) / entries.length;

    uRef()
      .get()
      .then(snap => {
        const goals = snap.exists ? snap.data().goals || {} : {};
        document.getElementById("weeklySummary").innerHTML = `
          <p>Average Steps: ${Math.round(avgSteps)} (Goal: ${
          goals.steps || "N/A"
        }) — ${avgSteps >= (goals.steps || 0) ? "✅ Met" : "❌ Not Met"}</p>
          <p>Average Sleep: ${avgSleep.toFixed(1)} hrs (Goal: ${
          goals.sleep || "N/A"
        }) — ${avgSleep >= (goals.sleep || 0) ? "✅ Met" : "❌ Not Met"}</p>
          <p>Average Water: ${avgWater.toFixed(1)} L (Goal: ${
          goals.water || "N/A"
        }) — ${avgWater >= (goals.water || 0) ? "✅ Met" : "❌ Not Met"}</p>
        `;
      });
  });
});
