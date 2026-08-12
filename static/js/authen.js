import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyAZqgKnQnxTe_tYdy1--Rf1ziCBIC18TLs",
    authDomain: "stockopti.firebaseapp.com",
    projectId: "stockopti",
    storageBucket: "stockopti.firebasestorage.app",
    messagingSenderId: "420498234069",
    appId: "1:420498234069:web:91da7f251f21936dee605c",
    measurementId: "G-S8VN974QVG"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

// Google provider
const googleProvider = new GoogleAuthProvider();


function showMessage(message, type = "info") {
    // prefer existing messageBox container if present
    let container = document.getElementById("messageBox") || document.querySelector(".flash-grid");

    if (!container) {
        container = document.createElement("div");
        container.className = "flash-grid";

        const form = document.querySelector(".login-form");
        if (form) {
            form.parentNode.insertBefore(container, form.nextSibling);
        } else {
            document.body.appendChild(container);
        }
    }

    // clear previous messages so we only show the latest
    container.innerHTML = "";

    const item = document.createElement("div");
    item.className = `flash-message flash-${type}`;
    item.textContent = message;
    container.appendChild(item);
}


// Wait until HTML is loaded
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.querySelector(".login-form");
    const googleButton = document.getElementById("googleLogin");


    // EMAIL LOGIN
    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const email = document.getElementById("email")?.value.trim();
            const password = document.getElementById("password")?.value;


            if (!email || !password) {
                showMessage("Please enter email and password.", "error");
                return;
            }


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                // create server session for this demo so protected pages load
                const user = auth.currentUser;
                if (user && user.email) {
                    try {
                        await fetch('/session_login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: user.email })
                        });
                    } catch (err) {
                        console.warn('Session login failed', err);
                    }
                }

                showMessage(
                    "Login successful! Redirecting...",
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "/";
                }, 1000);

            } catch (error) {

                console.error(error);

                showMessage(
                    error.message || "Login failed.",
                    "error"
                );
            }

        });
    }


    // GOOGLE LOGIN
    if (googleButton) {

        googleButton.addEventListener("click", async () => {

            try {

                await signInWithPopup(
                    auth,
                    googleProvider
                );

                const user = auth.currentUser;
                if (user && user.email) {
                    try {
                        await fetch('/session_login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: user.email })
                        });
                    } catch (err) {
                        console.warn('Session login failed', err);
                    }
                }

                showMessage(
                    "Google login successful! Redirecting...",
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "/";
                }, 1000);

            } catch (error) {

                console.error(error);

                showMessage(
                    error.message || "Google login failed.",
                    "error"
                );
            }

        });

    }

});