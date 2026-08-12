import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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
  const form = document.getElementById('forgotForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (!email) {
      showMessage('Please provide your email address.', 'error');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showMessage('Password reset email sent. Check your inbox.', 'success');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err) {
      console.error(err);
      showMessage(err.message || 'Could not send reset email.', 'error');
    }
  });
});
