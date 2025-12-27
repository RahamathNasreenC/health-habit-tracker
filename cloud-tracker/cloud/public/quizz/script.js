// Firebase Auth check on page load; redirect unlogged users
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = '../index.html'; // Adjust path if needed
  }
});

const startBtn = document.getElementById("start-btn");
const quizContainer = document.getElementById("quiz-container");
const resultScreen = document.getElementById("result-screen");
const startScreen = document.getElementById("start-screen");
const questionEl = document.getElementById("question");
const descEl = document.getElementById("desc");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const scoreEl = document.getElementById("score");
const gardenEl = document.getElementById("garden");
const restartBtn = document.getElementById("restart-btn");
const messageEl = document.getElementById("message");

const quizData = [
  { question: "How do you calm yourself after a stressful day?", desc: "Pick the option that helps balance your mood and recharge your energy.", options: ["Watch memes till 3 AM 😂", "Go for a short walk 🚶‍♀️", "Keep overthinking 😵‍💫", "Skip dinner 🍕"], answer: 1, message: "Walking reduces stress hormones and clears your mind. 🌿" },
  { question: "It’s 11 PM and your mind is racing. What’s the healthiest move?", desc: "Night habits define your mental freshness the next day.", options: ["Grab your phone 📱", "Write down your thoughts 📝", "Watch one more episode 🎬", "Check emails ✉️"], answer: 1, message: "Journaling slows down your thoughts and helps better sleep. 💤" },
  { question: "You feel overwhelmed by tasks. What should you do?", desc: "Managing mental load is a key habit to prevent burnout.", options: ["Take a 5-minute break ☕", "Do everything at once 😰", "Ignore it 💀", "Cry and hope for magic ✨"], answer: 0, message: "Micro-breaks improve focus and creativity! 💪" },
  { question: "How often do you express gratitude?", desc: "Emotional wellness thrives on small positive reflections.", options: ["Never 😐", "Once in a while 🙂", "Daily ❤️", "When forced 😅"], answer: 2, message: "Gratitude rewires your brain for positivity! 🌸" },
  { question: "You’ve had a long day. What’s your relaxation go-to?", desc: "Recharging right matters for long-term wellness.", options: ["Music or meditation 🎧", "Social media scroll 🌪️", "Skipping rest 😵", "Arguing online 💬"], answer: 0, message: "Even 10 minutes of calm music can reset your nervous system. 🎶" }
];

let current = 0;
let score = 0;

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);

function startQuiz() {
  startScreen.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  current = 0;
  score = 0;
  gardenEl.innerHTML = "";
  showQuestion();
}

function showQuestion() {
  const q = quizData[current];
  questionEl.textContent = q.question;
  descEl.textContent = q.desc;
  optionsEl.innerHTML = "";
  nextBtn.classList.add("hidden");
  messageEl.textContent = "";

  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.classList.add("option");
    btn.addEventListener("click", () => selectAnswer(index));
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(selected) {
  const q = quizData[current];
  const optionBtns = document.querySelectorAll(".option");
  optionBtns.forEach(btn => btn.disabled = true);

  if (selected === q.answer) {
    optionBtns[selected].classList.add("correct");
    score++;
    addFlower();
    showMessage("✅ " + q.message);
  } else {
    optionBtns[selected].classList.add("wrong");
    showMessage("💡 " + q.message);
  }

  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  current++;
  if (current < quizData.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizContainer.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  scoreEl.textContent = `You grew ${score} mindful habits out of ${quizData.length}! 🌼`;

  // Save score to Firestore for logged-in user
  const user = firebase.auth().currentUser;
  if (user) {
    const db = firebase.firestore();
    db.collection("users")
      .doc(user.uid)
      .collection("quizScores")
      .add({
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => console.log("Score saved to Firestore"))
      .catch((error) => console.error("Error saving score: ", error));
  }
}

function restartQuiz() {
  resultScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
}

function addFlower() {
  const flower = document.createElement("div");
  flower.classList.add("flower");
  flower.textContent = "🌼";
  gardenEl.appendChild(flower);

  if (window.bloomFlower) window.bloomFlower();
}

function showMessage(msg) {
  messageEl.textContent = msg;
  messageEl.classList.add("fade-in");
}
