import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZqgKnQnxTe_tYdy1--Rf1ziCBIC18TLs",
  authDomain: "stockopti.firebaseapp.com",
  projectId: "stockopti",
  storageBucket: "stockopti.firebasestorage.app",
  messagingSenderId: "420498234069",
  appId: "1:420498234069:web:91da7f251f21936dee605c",
  measurementId: "G-S8VN974QVG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

function showMessage(message, type = 'info') {
  let container = document.getElementById('messageBox') || document.querySelector('.flash-grid');
  if (!container) {
    container = document.createElement('div');
    container.className = 'flash-grid';
    const form = document.querySelector('.login-form');
    if (form) form.parentNode.insertBefore(container, form.nextSibling);
    else document.body.appendChild(container);
  }
  container.innerHTML = '';
  const item = document.createElement('div');
  item.className = `flash-message flash-${type}`;
  item.textContent = message;
  container.appendChild(item);
}

document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm_password');
  const togglePassword = document.getElementById('togglePassword');
  const registerForm = document.getElementById('registerForm');
  const googleBtn = document.getElementById('googleRegister');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassword.querySelector('.password-icon').textContent = isPassword ? '🙈' : '👁';
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;

      if (!email || !password) {
        showMessage('Please provide email and password.', 'error');
        return;
      }
      if (password.length < 6) {
        showMessage('Password must be at least 6 characters.', 'error');
        return;
      }
      if (password !== confirm) {
        showMessage('Passwords do not match.', 'error');
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        showMessage('Account created. Redirecting...', 'success');
        setTimeout(() => window.location.href = '/', 900);
      } catch (err) {
        console.error(err);
        showMessage(err.message || 'Registration failed.', 'error');
      }
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        showMessage('Google registration successful. Redirecting...', 'success');
        setTimeout(() => window.location.href = '/', 900);
      } catch (err) {
        console.error(err);
        showMessage(err.message || 'Google signup failed.', 'error');
      }
    });
  }
});
