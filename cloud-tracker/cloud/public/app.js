// -------------------- Firebase Config --------------------
const firebaseConfig = {
  apiKey: "AIzaSyAeMsrCzeFM8jqnFoKmSu-mOU8lkq0VODk",
  authDomain: "new1-2e362.firebaseapp.com",
  projectId: "new1-2e362",
  storageBucket: "new1-2e362.firebasestorage.app",
  messagingSenderId: "574418504369",
  appId: "1:574418504369:web:27d3ee530b84dd75c43090",
  measurementId: "G-14B1BH099T"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

firebase.firestore().enablePersistence({ synchronizeTabs: true }).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('Offline persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Offline persistence not supported by browser');
  }
});

// -------------------- Auth Logic --------------------
window.addEventListener('DOMContentLoaded', () => {
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const authMsg = document.getElementById('authMsg');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const googleLoginBtn = document.getElementById('googleLoginBtn');

  // -------------------- Login --------------------
  if (loginBtn) {
    loginBtn.type = "button";
    loginBtn.addEventListener('click', async () => {
      loginBtn.disabled = true;
      authMsg.textContent = "Logging in...";

      try {
        await auth.signInWithEmailAndPassword(email.value.trim(), password.value.trim());
        authMsg.style.color = 'green';
        authMsg.textContent = 'Logged in successfully!';
        window.location.href = 'dashboard.html';
      } catch (e) {
        authMsg.style.color = 'red';
        authMsg.textContent = e.message;
      } finally {
        loginBtn.disabled = false;
      }
    });
  }

  // -------------------- Register --------------------
  if (registerBtn) {
    registerBtn.type = "button";
    registerBtn.addEventListener('click', async () => {
      registerBtn.disabled = true;
      authMsg.textContent = "Registering...";

      const emailVal = email.value.trim();
      const passwordVal = password.value.trim();

      // ✅ Validate input
      if (!emailVal.includes('@') || !emailVal.includes('.')) {
        authMsg.style.color = 'red';
        authMsg.textContent = 'Please enter a valid email address.';
        registerBtn.disabled = false;
        return;
      }
      if (passwordVal.length < 6) {
        authMsg.style.color = 'red';
        authMsg.textContent = 'Password must be at least 6 characters.';
        registerBtn.disabled = false;
        return;
      }

      try {
        // Create auth user
        const userCredential = await auth.createUserWithEmailAndPassword(emailVal, passwordVal);
        const user = userCredential.user;

        // Auto-generate display name from email
        const nameFromEmail = emailVal.split('@')[0];
        const capitalized = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

        // Create Firestore user doc
        await db.collection('users').doc(user.uid).set({
          displayName: capitalized,
          email: user.email,
          goals: { sleep: 7, steps: 8000, water: 6 },
          habits: {}
        });

        authMsg.style.color = 'green';
        authMsg.textContent = 'Registered successfully!';
      } catch (e) {
        authMsg.style.color = 'red';
        authMsg.textContent = e.message;
      } finally {
        registerBtn.disabled = false;
      }
    });
  }

  // -------------------- Google Login --------------------
  if (googleLoginBtn) {
    googleLoginBtn.type = "button";
    googleLoginBtn.addEventListener('click', async () => {
      googleLoginBtn.disabled = true;
      authMsg.textContent = "Signing in with Google...";

      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Ensure user doc exists
        const userRef = db.collection('users').doc(user.uid);
        const docSnap = await userRef.get();

        if (!docSnap.exists) {
          await userRef.set({
            displayName: user.displayName || '',
            email: user.email,
            goals: { sleep: 7, steps: 8000, water: 6 },
            habits: {}
          });
        }

        authMsg.style.color = 'green';
        authMsg.textContent = 'Google sign-in successful!';
        window.location.href = 'dashboard.html';
      } catch (e) {
        authMsg.style.color = 'red';
        authMsg.textContent = e.message;
      } finally {
        googleLoginBtn.disabled = false;
      }
    });
  }
});

// -------------------- Auth Guard --------------------
if (!(window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'index.html';
    }
  });
}
