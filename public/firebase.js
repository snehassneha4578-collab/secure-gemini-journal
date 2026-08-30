// ======================================================
// FIREBASE INITIALIZATION
// ======================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ======================================================
// FIREBASE CONFIGURATION
// ======================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyD3FmIwW4SPCiRuq9kCshyvxbT_jJkAjr8",

    authDomain:
        "gemini-journal-8a53a.firebaseapp.com",

    projectId:
        "gemini-journal-8a53a",

    storageBucket:
        "gemini-journal-8a53a.firebasestorage.app",

    messagingSenderId:
        "1085820029335",

    appId:
        "1:1085820029335:web:f744f8c2010beddcac1cd2"

};


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

const app =
    initializeApp(firebaseConfig);


// ======================================================
// FIREBASE AUTHENTICATION
// ======================================================

export const auth =
    getAuth(app);


// ======================================================
// FIRESTORE DATABASE
// ======================================================

export const db =
    getFirestore(app);