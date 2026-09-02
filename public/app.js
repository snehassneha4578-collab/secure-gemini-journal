// ============================================================
// PERSONAL GEMINI JOURNAL
// Firebase Authentication + Render Backend + Gemini + Firestore
// ============================================================

// ------------------------------------------------------------
// Firebase imports
// ------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ------------------------------------------------------------
// Firebase Web App Configuration
// ------------------------------------------------------------
// IMPORTANT:
// Replace ONLY these 3 placeholder values with your actual
// Firebase Web App configuration values.
//
// You can get them from:
// Firebase Console
// → Project settings
// → Your apps
// → Web app
// → Firebase SDK snippet
// ------------------------------------------------------------

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_WEB_API_KEY",
    authDomain: "gemini-journal-8a53a.firebaseapp.com",
    projectId: "gemini-journal-8a53a",
    storageBucket: "gemini-journal-8a53a.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
};


// ------------------------------------------------------------
// Initialize Firebase
// ------------------------------------------------------------

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);


// ------------------------------------------------------------
// Backend
// ------------------------------------------------------------

const BACKEND_URL =
    "https://secure-gemini-journal-tjdq.onrender.com";


// ------------------------------------------------------------
// DOM Elements
// ------------------------------------------------------------

const loginButton =
    document.getElementById("loginButton");

const signupButton =
    document.getElementById("signupButton");

const logoutButton =
    document.getElementById("logoutButton");

const authStatus =
    document.getElementById("authStatus");

const newConversationButton =
    document.getElementById("newConversationButton");

const entriesList =
    document.getElementById("entriesList");

const journalTitle =
    document.getElementById("journalTitle");

const journalStatus =
    document.getElementById("journalStatus");

const saveJournalButton =
    document.getElementById("saveJournalButton");

const chatBox =
    document.getElementById("chatBox");

const chatInput =
    document.getElementById("chatInput");

const sendButton =
    document.getElementById("sendButton");

const statusMessage =
    document.getElementById("statusMessage");

const journalInput =
    document.getElementById("journalInput");

const saveButton =
    document.getElementById("saveButton");

const clearButton =
    document.getElementById("clearButton");


// ------------------------------------------------------------
// Application State
// ------------------------------------------------------------

let currentUser = null;

let currentJournalId = null;

let currentMessages = [
    {
        role: "model",
        text: "Please login to start a conversation."
    }
];


// ------------------------------------------------------------
// Utility
// ------------------------------------------------------------

function setStatus(message, type = "") {

    if (!statusMessage) {
        return;
    }

    statusMessage.textContent = message;

    statusMessage.className = "";

    if (type) {
        statusMessage.classList.add(type);
    }
}


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatDate(value) {

    if (!value) {
        return "";
    }

    try {

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString();

    } catch (error) {

        return "";
    }
}


// ------------------------------------------------------------
// Firebase Token
// ------------------------------------------------------------

async function getFirebaseToken() {

    if (!currentUser) {
        throw new Error("User is not logged in.");
    }

    return await currentUser.getIdToken(true);
}


// ------------------------------------------------------------
// Backend API Request
// ------------------------------------------------------------

async function apiRequest(
    endpoint,
    options = {}
) {

    const token = await getFirebaseToken();

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...(options.headers || {})
    };

    const response = await fetch(
        `${BACKEND_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    let data = null;

    try {

        data = await response.json();

    } catch (error) {

        data = null;
    }


    if (!response.ok) {

        const message =
            data?.error ||
            data?.message ||
            `Request failed with status ${response.status}`;

        throw new Error(message);
    }


    return data;
}


// ------------------------------------------------------------
// Authentication UI
// ------------------------------------------------------------

function updateUIForAuth() {

    if (currentUser) {

        authStatus.textContent =
            `Logged in as: ${currentUser.email}`;

        loginButton.style.display = "none";

        signupButton.style.display = "none";

        logoutButton.style.display = "inline-block";

        newConversationButton.disabled = false;

        chatInput.disabled = false;

        sendButton.disabled = false;

        journalInput.disabled = false;

        saveButton.disabled = false;

        saveJournalButton.disabled = false;

    } else {

        authStatus.textContent =
            "Not logged in";

        loginButton.style.display = "inline-block";

        signupButton.style.display = "inline-block";

        logoutButton.style.display = "none";

        newConversationButton.disabled = true;

        chatInput.disabled = true;

        sendButton.disabled = true;

        journalInput.disabled = true;

        saveButton.disabled = true;

        saveJournalButton.disabled = true;
    }
}


// ------------------------------------------------------------
// Sign In
// ------------------------------------------------------------

async function handleLogin() {

    const email = window.prompt(
        "Enter your email:"
    );

    if (!email) {
        return;
    }


    const password = window.prompt(
        "Enter your password:"
    );

    if (!password) {
        return;
    }


    try {

        setStatus("Signing in...");

        await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
        );

        setStatus("Signed in successfully.");

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        setStatus(
            error.message || "Unable to sign in.",
            "error"
        );

        alert(
            error.message || "Unable to sign in."
        );
    }
}


// ------------------------------------------------------------
// Create Account
// ------------------------------------------------------------

async function handleSignup() {

    const email = window.prompt(
        "Enter your email:"
    );

    if (!email) {
        return;
    }


    const password = window.prompt(
        "Create a password (minimum 6 characters):"
    );

    if (!password) {
        return;
    }


    try {

        setStatus("Creating account...");

        await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
        );

        setStatus(
            "Account created successfully."
        );

    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        setStatus(
            error.message || "Unable to create account.",
            "error"
        );

        alert(
            error.message || "Unable to create account."
        );
    }
}


// ------------------------------------------------------------
// Logout
// ------------------------------------------------------------

async function handleLogout() {

    try {

        await signOut(auth);

        currentUser = null;

        currentJournalId = null;

        resetConversation();

        entriesList.innerHTML = `
            <p class="empty-message">
                Please login to view your journals.
            </p>
        `;

        setStatus(
            "Logged out successfully."
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        setStatus(
            "Unable to logout.",
            "error"
        );
    }
}


// ------------------------------------------------------------
// Reset Conversation
// ------------------------------------------------------------

function resetConversation() {

    currentJournalId = null;

    currentMessages = [
        {
            role: "model",
            text: currentUser
                ? "Hello! I'm ready to help you."
                : "Please login to start a conversation."
        }
    ];

    journalTitle.textContent =
        "New Gemini Journal";

    journalStatus.textContent =
        currentUser
            ? "Start a new conversation"
            : "Login required";

    renderMessages();
}


// ------------------------------------------------------------
// Render Chat
// ------------------------------------------------------------

function renderMessages() {

    if (!chatBox) {
        return;
    }


    chatBox.innerHTML = "";


    currentMessages.forEach(
        (message) => {

            const wrapper =
                document.createElement("div");


            if (
                message.role === "user"
            ) {

                wrapper.className =
                    "user-message";

                wrapper.innerHTML = `
                    <strong>You:</strong>
                    <p>${escapeHtml(message.text)}</p>
                `;

            } else {

                wrapper.className =
                    "ai-message";

                wrapper.innerHTML = `
                    <strong>Gemini:</strong>
                    <p>${escapeHtml(message.text)}</p>
                `;
            }


            chatBox.appendChild(wrapper);
        }
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;
}


// ------------------------------------------------------------
// Send Chat Message
// ------------------------------------------------------------

async function sendMessage() {

    const text =
        chatInput.value.trim();


    if (!text) {
        return;
    }


    if (!currentUser) {

        alert(
            "Please login first."
        );

        return;
    }


    const userMessage = {
        role: "user",
        text
    };


    currentMessages.push(
        userMessage
    );

    renderMessages();


    chatInput.value = "";

    chatInput.disabled = true;

    sendButton.disabled = true;

    setStatus(
        "Gemini is thinking..."
    );


    try {

        const data =
            await apiRequest(
                "/api/chat",
                {
                    method: "POST",
                    body: JSON.stringify({
                        message: text,
                        messages: currentMessages
                    })
                }
            );


        const reply =
            data?.response ||
            data?.reply ||
            data?.text ||
            "Gemini did not return a response.";


        currentMessages.push({
            role: "model",
            text: reply
        });


        if (data?.journalId) {

            currentJournalId =
                data.journalId;
        }


        renderMessages();


        if (data?.model) {

            journalStatus.textContent =
                `Using ${data.model}`;

        } else {

            journalStatus.textContent =
                "Conversation active";
        }


        setStatus(
            "Gemini responded."
        );

    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        currentMessages.push({
            role: "model",
            text:
                "Sorry, I couldn't process that message right now."
        });


        renderMessages();


        setStatus(
            error.message ||
            "Unable to contact Gemini.",
            "error"
        );

    } finally {

        chatInput.disabled = false;

        sendButton.disabled = false;

        chatInput.focus();
    }
}


// ------------------------------------------------------------
// Load Journal Entries
// ------------------------------------------------------------

async function loadJournalEntries() {

    if (!currentUser) {

        entriesList.innerHTML = `
            <p class="empty-message">
                Please login to view your journals.
            </p>
        `;

        return;
    }


    entriesList.innerHTML = `
        <p class="empty-message">
            Loading journals...
        </p>
    `;


    try {

        const data =
            await apiRequest(
                "/api/journal"
            );


        let entries = [];


        if (Array.isArray(data)) {

            entries = data;

        } else if (
            data &&
            Array.isArray(data.journals)
        ) {

            entries = data.journals;

        } else if (
            data &&
            Array.isArray(data.entries)
        ) {

            entries = data.entries;
        }


        displayJournalEntries(
            entries
        );


    } catch (error) {

        console.error(
            "Load journals error:",
            error
        );


        entriesList.innerHTML = `
            <p class="empty-message">
                Unable to load journal entries.
            </p>
        `;

        setStatus(
            error.message ||
            "Unable to load journals.",
            "error"
        );
    }
}


// ------------------------------------------------------------
// Display Journal Entries
// ------------------------------------------------------------

function displayJournalEntries(
    entries
) {

    if (!Array.isArray(entries)) {

        entries = [];
    }


    if (entries.length === 0) {

        entriesList.innerHTML = `
            <p class="empty-message">
                No saved journals yet.
            </p>
        `;

        return;
    }


    entriesList.innerHTML = "";


    entries.forEach(
        (entry) => {

            const journal =
                normalizeJournal(entry);


            const item =
                document.createElement("div");


            item.className =
                "journal-entry";


            const title =
                journal.title ||
                "Untitled Journal";


            const preview =
                journal.content ||
                getConversationPreview(
                    journal.messages
                );


            item.innerHTML = `
                <div class="journal-entry-content">
                    <h3>
                        ${escapeHtml(title)}
                    </h3>

                    <p>
                        ${escapeHtml(
                            truncateText(
                                preview,
                                100
                            )
                        )}
                    </p>

                    <small>
                        ${escapeHtml(
                            formatDate(
                                journal.createdAt
                            )
                        )}
                    </small>
                </div>

                <div class="journal-entry-actions">

                    <button
                        class="secondary-button open-journal-button"
                        data-id="${escapeHtml(journal.id)}"
                    >
                        Open
                    </button>

                    <button
                        class="secondary-button delete-journal-button"
                        data-id="${escapeHtml(journal.id)}"
                    >
                        Delete
                    </button>

                </div>
            `;


            entriesList.appendChild(
                item
            );
        }
    );


    document
        .querySelectorAll(
            ".open-journal-button"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;

                        openJournal(id);
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".delete-journal-button"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;

                        deleteJournal(id);
                    }
                );
            }
        );
}


// ------------------------------------------------------------
// Normalize Journal
// ------------------------------------------------------------

function normalizeJournal(
    journal
) {

    if (!journal) {

        return {
            id: "",
            title: "",
            content: "",
            mood: "",
            messages: [],
            createdAt: ""
        };
    }


    let messages = [];


    if (
        Array.isArray(
            journal.messages
        )
    ) {

        messages =
            journal.messages.map(
                (message) => {

                    return {
                        role:
                            message?.role ||
                            "model",

                        text:
                            message?.text ||
                            message?.content ||
                            ""
                    };
                }
            );
    }


    return {

        id:
            journal.id ||
            journal.journalId ||
            journal._id ||
            "",

        title:
            typeof journal.title === "string"
                ? journal.title
                : "",

        content:
            typeof journal.content === "string"
                ? journal.content
                : "",

        mood:
            typeof journal.mood === "string"
                ? journal.mood
                : "",

        messages,

        createdAt:
            journal.createdAt ||
            journal.updatedAt ||
            ""
    };
}


// ------------------------------------------------------------
// Conversation Preview
// ------------------------------------------------------------

function getConversationPreview(
    messages
) {

    if (!Array.isArray(messages)) {

        return "";
    }


    return messages
        .map(
            (message) =>
                message?.text || ""
        )
        .filter(Boolean)
        .join(" ");
}


// ------------------------------------------------------------
// Truncate Text
// ------------------------------------------------------------

function truncateText(
    text,
    maxLength
) {

    if (!text) {
        return "";
    }


    const value =
        String(text);


    if (
        value.length <= maxLength
    ) {

        return value;
    }


    return (
        value.substring(
            0,
            maxLength
        ) + "..."
    );
}


// ------------------------------------------------------------
// Open Journal
// ------------------------------------------------------------

async function openJournal(
    journalId
) {

    if (!journalId) {

        alert(
            "Journal ID is missing."
        );

        return;
    }


    try {

        setStatus(
            "Loading journal..."
        );


        const data =
            await apiRequest(
                `/api/journal/${encodeURIComponent(journalId)}`
            );


        const journal =
            normalizeJournal(
                data?.journal ||
                data
            );


        currentJournalId =
            journal.id ||
            journalId;


        currentMessages =
            journal.messages.length > 0
                ? journal.messages
                : [
                    {
                        role: "model",
                        text: "This journal has no conversation messages."
                    }
                ];


        journalTitle.textContent =
            journal.title ||
            "Gemini Journal";


        journalStatus.textContent =
            "Saved conversation";


        renderMessages();


        setStatus(
            "Journal loaded."
        );


    } catch (error) {

        console.error(
            "Open journal error:",
            error
        );


        setStatus(
            error.message ||
            "Unable to open journal.",
            "error"
        );
    }
}


// ------------------------------------------------------------
// Delete Journal
// ------------------------------------------------------------

async function deleteJournal(
    journalId
) {

    if (!journalId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Delete this journal?"
        );


    if (!confirmed) {
        return;
    }


    try {

        setStatus(
            "Deleting journal..."
        );


        await apiRequest(
            `/api/journal/${encodeURIComponent(journalId)}`,
            {
                method: "DELETE"
            }
        );


        if (
            currentJournalId ===
            journalId
        ) {

            resetConversation();
        }


        await loadJournalEntries();


        setStatus(
            "Journal deleted."
        );


    } catch (error) {

        console.error(
            "Delete journal error:",
            error
        );


        setStatus(
            error.message ||
            "Unable to delete journal.",
            "error"
        );
    }
}


// ------------------------------------------------------------
// Save Conversation
// ------------------------------------------------------------

async function saveConversation() {

    if (!currentUser) {

        alert(
            "Please login first."
        );

        return;
    }


    if (
        !Array.isArray(
            currentMessages
        ) ||
        currentMessages.length === 0
    ) {

        alert(
            "There is no conversation to save."
        );

        return;
    }


    const defaultTitle =
        currentJournalId
            ? journalTitle.textContent
            : `Gemini Journal - ${new Date().toLocaleDateString()}`;


    const title =
        window.prompt(
            "Enter a title for this journal:",
            defaultTitle
        );


    if (!title) {
        return;
    }


    try {

        saveJournalButton.disabled =
            true;

        setStatus(
            "Saving conversation..."
        );


        const data =
            await apiRequest(
                "/api/journal",
                {
                    method: "POST",
                    body: JSON.stringify({
                        title: title.trim(),
                        content:
                            getConversationPreview(
                                currentMessages
                            ),
                        mood: "",
                        messages:
                            currentMessages
                    })
                }
            );


        currentJournalId =
            data?.journalId ||
            data?.id ||
            currentJournalId;


        journalTitle.textContent =
            title.trim();


        journalStatus.textContent =
            "Saved conversation";


        await loadJournalEntries();


        setStatus(
            "Conversation saved successfully."
        );


    } catch (error) {

        console.error(
            "Save conversation error:",
            error
        );


        setStatus(
            error.message ||
            "Unable to save conversation.",
            "error"
        );

    } finally {

        saveJournalButton.disabled =
            false;
    }
}


// ------------------------------------------------------------
// Quick Journal Save
// ------------------------------------------------------------

async function saveQuickJournal() {

    if (!currentUser) {

        alert(
            "Please login first."
        );

        return;
    }


    const content =
        journalInput.value.trim();


    if (!content) {

        alert(
            "Please write something first."
        );

        return;
    }


    try {

        saveButton.disabled =
            true;


        setStatus(
            "Saving journal entry..."
        );


        const title =
            window.prompt(
                "Enter a title for this journal entry:",
                "Quick Journal Entry"
            );


        if (!title) {

            saveButton.disabled =
                false;

            return;
        }


        await apiRequest(
            "/api/journal",
            {
                method: "POST",
                body: JSON.stringify({
                    title:
                        title.trim(),

                    content,

                    mood: "",

                    messages: [
                        {
                            role: "user",
                            text: content
                        }
                    ]
                })
            }
        );


        journalInput.value = "";


        await loadJournalEntries();


        setStatus(
            "Journal entry saved successfully."
        );


    } catch (error) {

        console.error(
            "Save quick journal error:",
            error
        );


        setStatus(
            error.message ||
            "Unable to save journal entry.",
            "error"
        );

    } finally {

        saveButton.disabled =
            false;
    }
}


// ------------------------------------------------------------
// New Conversation
// ------------------------------------------------------------

function handleNewConversation() {

    resetConversation();

    setStatus(
        "New conversation started."
    );

    chatInput.focus();
}


// ------------------------------------------------------------
// Event Listeners
// ------------------------------------------------------------

loginButton.addEventListener(
    "click",
    handleLogin
);


signupButton.addEventListener(
    "click",
    handleSignup
);


logoutButton.addEventListener(
    "click",
    handleLogout
);


newConversationButton.addEventListener(
    "click",
    handleNewConversation
);


sendButton.addEventListener(
    "click",
    sendMessage
);


saveJournalButton.addEventListener(
    "click",
    saveConversation
);


saveButton.addEventListener(
    "click",
    saveQuickJournal
);


clearButton.addEventListener(
    "click",
    () => {

        journalInput.value = "";

        setStatus(
            "Journal cleared."
        );
    }
);


chatInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


// ------------------------------------------------------------
// Firebase Authentication State
// ------------------------------------------------------------

onAuthStateChanged(
    auth,
    async (user) => {

        console.log(
            "Authentication state:",
            user
                ? user.email
                : "Not logged in"
        );


        currentUser =
            user;


        updateUIForAuth();


        if (user) {

            resetConversation();

            await loadJournalEntries();

        } else {

            resetConversation();

            entriesList.innerHTML = `
                <p class="empty-message">
                    Please login to view your journals.
                </p>
            `;
        }
    }
);


// ------------------------------------------------------------
// Initial UI
// ------------------------------------------------------------

updateUIForAuth();

renderMessages();

console.log(
    "Personal Gemini Journal frontend initialized."
);

console.log(
    "Backend:",
    BACKEND_URL
);

console.log(
    "Firebase project:",
    firebaseConfig.projectId
);