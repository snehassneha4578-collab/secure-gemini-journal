// ======================================================
// PERSONAL GEMINI JOURNAL - FRONTEND
// ======================================================

// ======================================================
// FIREBASE CONFIGURATION
// ======================================================

const firebaseConfig = {
    apiKey: "PASTE_YOUR_EXISTING_FIREBASE_WEB_API_KEY_HERE",
    authDomain: "gemini-journal-8a53a.firebaseapp.com",
    projectId: "gemini-journal-8a53a",
    storageBucket: "gemini-journal-8a53a.firebasestorage.app",
    messagingSenderId: "PASTE_YOUR_EXISTING_MESSAGING_SENDER_ID_HERE",
    appId: "PASTE_YOUR_EXISTING_FIREBASE_APP_ID_HERE"
};

// ======================================================
// FIREBASE INITIALIZATION
// ======================================================

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

// ======================================================
// BACKEND URL
// ======================================================

const BACKEND_URL =
    "https://secure-gemini-journal-tjdq.onrender.com";

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let currentUser = null;
let currentMessages = [];
let currentJournalId = null;

// ======================================================
// DOM ELEMENTS
// ======================================================

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

// ======================================================
// HTML ESCAPE
// ======================================================

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

// ======================================================
// STATUS
// ======================================================

function setStatus(message, isError = false) {
    if (!statusMessage) {
        return;
    }

    statusMessage.textContent = message || "";
    statusMessage.style.color = isError ? "red" : "";
}

// ======================================================
// UPDATE UI
// ======================================================

function updateUIForAuth() {

    const loggedIn = !!currentUser;

    if (loginButton) {
        loginButton.style.display =
            loggedIn ? "none" : "";
    }

    if (signupButton) {
        signupButton.style.display =
            loggedIn ? "none" : "";
    }

    if (logoutButton) {
        logoutButton.style.display =
            loggedIn ? "" : "none";
    }

    if (authStatus) {
        authStatus.textContent =
            loggedIn
                ? `Logged in as: ${currentUser.email}`
                : "Not logged in";
    }

    if (newConversationButton) {
        newConversationButton.disabled =
            !loggedIn;
    }

    if (chatInput) {
        chatInput.disabled =
            !loggedIn;
    }

    if (sendButton) {
        sendButton.disabled =
            !loggedIn;
    }

    if (journalInput) {
        journalInput.disabled =
            !loggedIn;
    }

    if (saveButton) {
        saveButton.disabled =
            !loggedIn;
    }

    if (saveJournalButton) {
        saveJournalButton.disabled =
            !loggedIn ||
            currentMessages.length === 0;
    }

    if (!loggedIn) {

        if (entriesList) {
            entriesList.innerHTML = `
                <p class="empty-message">
                    Please login to view your journals.
                </p>
            `;
        }

        renderLoggedOutChat();
    }
}

// ======================================================
// LOGGED OUT CHAT
// ======================================================

function renderLoggedOutChat() {

    if (!chatBox) {
        return;
    }

    chatBox.innerHTML = `
        <div class="ai-message">
            <strong>Gemini:</strong>
            <p>
                Please login to start a conversation.
            </p>
        </div>
    `;
}

// ======================================================
// API REQUEST
// ======================================================

async function apiRequest(endpoint, options = {}) {

    if (!currentUser) {
        throw new Error("Please login first.");
    }

    const token =
        await currentUser.getIdToken(true);

    const requestOptions = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(options.headers || {})
        }
    };

    const response =
        await fetch(
            BACKEND_URL + endpoint,
            requestOptions
        );

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {

        const message =
            data.error ||
            data.message ||
            `Request failed with status ${response.status}`;

        const error =
            new Error(message);

        error.status =
            response.status;

        throw error;
    }

    return data;
}

// ======================================================
// FIREBASE AUTH STATE
// ======================================================

auth.onAuthStateChanged(async (user) => {

    console.log(
        "Auth state:",
        user ? user.email : "No user"
    );

    currentUser = user;

    updateUIForAuth();

    if (!user) {

        currentMessages = [];
        currentJournalId = null;

        return;
    }

    try {

        setStatus("Loading your journals...");

        await loadJournalEntries();

        setStatus("");

    } catch (error) {

        console.error(
            "Initial journal loading failed:",
            error
        );

        setStatus(
            "Could not load journals.",
            true
        );
    }
});

// ======================================================
// SIGN IN
// ======================================================

if (loginButton) {

    loginButton.addEventListener(
        "click",
        async () => {

            const email =
                window.prompt(
                    "Enter your email:"
                );

            if (!email) {
                return;
            }

            const password =
                window.prompt(
                    "Enter your password:"
                );

            if (!password) {
                return;
            }

            try {

                setStatus("Signing in...");

                await auth.signInWithEmailAndPassword(
                    email.trim(),
                    password
                );

                setStatus(
                    "Signed in successfully."
                );

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                alert(
                    getFirebaseErrorMessage(error)
                );

                setStatus("");
            }
        }
    );
}

// ======================================================
// CREATE ACCOUNT
// ======================================================

if (signupButton) {

    signupButton.addEventListener(
        "click",
        async () => {

            const email =
                window.prompt(
                    "Enter your email:"
                );

            if (!email) {
                return;
            }

            const password =
                window.prompt(
                    "Create a password (minimum 6 characters):"
                );

            if (!password) {
                return;
            }

            try {

                setStatus(
                    "Creating account..."
                );

                await auth.createUserWithEmailAndPassword(
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

                alert(
                    getFirebaseErrorMessage(error)
                );

                setStatus("");
            }
        }
    );
}

// ======================================================
// FIREBASE ERROR MESSAGE
// ======================================================

function getFirebaseErrorMessage(error) {

    const code =
        error && error.code
            ? error.code
            : "";

    switch (code) {

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-not-found":
            return "No account found with this email.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/email-already-in-use":
            return "An account already exists with this email.";

        case "auth/weak-password":
            return "Password must contain at least 6 characters.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        default:
            return (
                error &&
                error.message
            ) || "Authentication failed.";
    }
}

// ======================================================
// LOGOUT
// ======================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await auth.signOut();

                currentUser = null;
                currentMessages = [];
                currentJournalId = null;

                updateUIForAuth();

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );
            }
        }
    );
}

// ======================================================
// LOAD JOURNALS
// ======================================================

async function loadJournalEntries() {

    if (!currentUser) {
        return;
    }

    try {

        console.log(
            "Loading journal entries..."
        );

        const data =
            await apiRequest(
                "/api/journal"
            );

        console.log(
            "Journal API response:",
            data
        );

        // Backend normally returns:
        // {
        //     journals: [...],
        //     count: 22
        // }

        let entries = [];

        if (Array.isArray(data)) {

            entries = data;

        } else if (
            data &&
            Array.isArray(data.journals)
        ) {

            entries = data.journals;
        }

        console.log(
            "Journal entries:",
            entries.length
        );

        displayJournalEntries(entries);

    } catch (error) {

        console.error(
            "Load journals error:",
            error
        );

        if (entriesList) {

            entriesList.innerHTML = `
                <p class="empty-message">
                    Unable to load journal entries.
                </p>
            `;
        }

        throw error;
    }
}

// ======================================================
// JOURNAL DISPLAY DATA
// ======================================================

function getJournalDisplayData(entry) {

    if (!entry) {

        return {
            title: "Journal Entry",
            content: "",
            preview: "",
            date: "",
            messages: []
        };
    }

    let title =
        typeof entry.title === "string"
            ? entry.title.trim()
            : "";

    let content =
        typeof entry.content === "string"
            ? entry.content
            : "";

    const messages =
        Array.isArray(entry.messages)
            ? entry.messages
            : [];

    // Generate title from first user message

    if (
        (
            !title ||
            title === "Gemini Conversation"
        ) &&
        messages.length > 0
    ) {

        const firstUserMessage =
            messages.find(
                message =>
                    message &&
                    message.role === "user" &&
                    typeof message.text === "string" &&
                    message.text.trim()
            );

        if (firstUserMessage) {

            title =
                firstUserMessage.text
                    .trim()
                    .substring(0, 45);

            if (
                firstUserMessage.text
                    .trim()
                    .length > 45
            ) {
                title += "...";
            }
        }
    }

    if (!title) {
        title = "Journal Entry";
    }

    // Build content from messages

    if (
        !content &&
        messages.length > 0
    ) {

        content =
            messages
                .map(message => {

                    const role =
                        message &&
                        message.role === "user"
                            ? "You"
                            : "Gemini";

                    const text =
                        message &&
                        typeof message.text === "string"
                            ? message.text
                            : "";

                    return `${role}: ${text}`;
                })
                .join("\n\n");
    }

    const preview =
        String(content || "")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 120);

    let date = "";

    if (entry.createdAt) {

        const parsedDate =
            new Date(entry.createdAt);

        if (
            !Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            date =
                parsedDate.toLocaleString();
        }
    }

    return {
        title,
        content,
        preview,
        date,
        messages
    };
}

// ======================================================
// DISPLAY JOURNAL ENTRIES
// ======================================================

function displayJournalEntries(entries) {

    if (!entriesList) {
        return;
    }

    if (!Array.isArray(entries)) {

        console.error(
            "Expected journal array:",
            entries
        );

        entries = [];
    }

    entriesList.innerHTML = "";

    if (entries.length === 0) {

        entriesList.innerHTML = `
            <p class="empty-message">
                No journal entries yet.
            </p>
        `;

        return;
    }

    entries.forEach(entry => {

        const displayData =
            getJournalDisplayData(entry);

        const card =
            document.createElement("div");

        card.className =
            "journal-entry";

        card.innerHTML = `
            <div class="journal-entry-header">

                <h3>
                    ${escapeHtml(displayData.title)}
                </h3>

                ${
                    displayData.date
                        ? `
                            <small>
                                ${escapeHtml(displayData.date)}
                            </small>
                          `
                        : ""
                }

            </div>

            <p>
                ${escapeHtml(
                    displayData.preview ||
                    "No preview available."
                )}
            </p>

            <div class="journal-entry-actions">

                <button
                    type="button"
                    class="open-journal-button">

                    Open

                </button>

                <button
                    type="button"
                    class="delete-journal-button">

                    Delete

                </button>

            </div>
        `;

        const openButton =
            card.querySelector(
                ".open-journal-button"
            );

        const deleteButton =
            card.querySelector(
                ".delete-journal-button"
            );

        if (openButton) {

            openButton.addEventListener(
                "click",
                () => {
                    openJournalEntry(entry);
                }
            );
        }

        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                () => {
                    deleteJournalEntry(entry.id);
                }
            );
        }

        entriesList.appendChild(card);
    });
}

// ======================================================
// OPEN JOURNAL
// ======================================================

function openJournalEntry(entry) {

    if (!entry) {
        return;
    }

    console.log(
        "Opening journal:",
        entry
    );

    currentJournalId =
        entry.id || null;

    const displayData =
        getJournalDisplayData(entry);

    currentMessages =
        Array.isArray(entry.messages)
            ? entry.messages
                .filter(
                    message =>
                        message &&
                        (
                            message.role === "user" ||
                            message.role === "model"
                        ) &&
                        typeof message.text === "string"
                )
                .map(message => ({
                    role: message.role,
                    text: message.text
                }))
            : [];

    if (journalTitle) {

        journalTitle.textContent =
            displayData.title;
    }

    if (journalStatus) {

        journalStatus.textContent =
            "Journal loaded";
    }

    if (saveJournalButton) {

        saveJournalButton.disabled =
            currentMessages.length === 0;
    }

    renderMessages();

    setStatus(
        "Journal opened."
    );
}

// ======================================================
// DELETE JOURNAL
// ======================================================

async function deleteJournalEntry(journalId) {

    if (!journalId) {
        return;
    }

    const confirmed =
        window.confirm(
            "Delete this journal entry?"
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

            currentJournalId = null;
            currentMessages = [];

            renderMessages();
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
            "Failed to delete journal.",
            true
        );
    }
}

// ======================================================
// RENDER CHAT
// ======================================================

function renderMessages() {

    if (!chatBox) {
        return;
    }

    chatBox.innerHTML = "";

    if (currentMessages.length === 0) {

        chatBox.innerHTML = `
            <div class="ai-message">

                <strong>
                    Gemini:
                </strong>

                <p>
                    Hello! I'm ready to help you.
                </p>

            </div>
        `;

        return;
    }

    currentMessages.forEach(message => {

        const messageDiv =
            document.createElement("div");

        messageDiv.className =
            message.role === "user"
                ? "user-message"
                : "ai-message";

        const label =
            message.role === "user"
                ? "You"
                : "Gemini";

        messageDiv.innerHTML = `
            <strong>
                ${label}:
            </strong>

            <p>
                ${escapeHtml(
                    message.text
                ).replace(/\n/g, "<br>")}
            </p>
        `;

        chatBox.appendChild(messageDiv);
    });

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

// ======================================================
// SEND GEMINI MESSAGE
// ======================================================

async function sendMessage() {

    if (!currentUser) {

        alert(
            "Please login first."
        );

        return;
    }

    if (!chatInput) {
        return;
    }

    const text =
        chatInput.value.trim();

    if (!text) {
        return;
    }

    currentMessages.push({
        role: "user",
        text: text
    });

    chatInput.value = "";

    renderMessages();

    if (sendButton) {

        sendButton.disabled = true;
        sendButton.textContent =
            "Thinking...";
    }

    try {

        setStatus(
            "Gemini is thinking..."
        );

        const data =
            await apiRequest(
                "/api/chat",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            messages:
                                currentMessages
                        })
                }
            );

        console.log(
            "Gemini response:",
            data
        );

        const reply =
            typeof data.response === "string"
                ? data.response
                : "";

        if (!reply) {

            throw new Error(
                "Gemini returned an empty response."
            );
        }

        currentMessages.push({
            role: "model",
            text: reply
        });

        if (data.journalId) {

            currentJournalId =
                data.journalId;
        }

        renderMessages();

        if (saveJournalButton) {

            saveJournalButton.disabled =
                false;
        }

        // Refresh journal list.

        await loadJournalEntries();

        setStatus(
            "Gemini responded."
        );

    } catch (error) {

        console.error(
            "Gemini request error:",
            error
        );

        // Remove failed user message.

        if (
            currentMessages.length > 0 &&
            currentMessages[
                currentMessages.length - 1
            ].role === "user"
        ) {

            currentMessages.pop();
        }

        renderMessages();

        const errorDiv =
            document.createElement("div");

        errorDiv.className =
            "ai-message";

        errorDiv.innerHTML = `
            <strong>
                Gemini:
            </strong>

            <p>
                ${escapeHtml(
                    error.message ||
                    "Gemini could not respond."
                )}
            </p>
        `;

        if (chatBox) {
            chatBox.appendChild(errorDiv);
        }

        setStatus(
            error.message ||
            "Gemini could not respond.",
            true
        );

    } finally {

        if (sendButton) {

            sendButton.disabled =
                !currentUser;

            sendButton.textContent =
                "Send";
        }
    }
}

// ======================================================
// SEND BUTTON
// ======================================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );
}

// ======================================================
// ENTER KEY
// ======================================================

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }
        }
    );
}

// ======================================================
// NEW CONVERSATION
// ======================================================

if (newConversationButton) {

    newConversationButton.addEventListener(
        "click",
        () => {

            currentMessages = [];
            currentJournalId = null;

            if (journalTitle) {

                journalTitle.textContent =
                    "New Gemini Journal";
            }

            if (journalStatus) {

                journalStatus.textContent =
                    "Start a new conversation";
            }

            if (saveJournalButton) {

                saveJournalButton.disabled =
                    true;
            }

            renderMessages();

            setStatus(
                "New conversation started."
            );

            if (chatInput) {

                chatInput.value = "";
                chatInput.focus();
            }
        }
    );
}

// ======================================================
// SAVE CONVERSATION
// ======================================================

if (saveJournalButton) {

    saveJournalButton.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;
            }

            if (currentMessages.length === 0) {

                alert(
                    "There is no conversation to save."
                );

                return;
            }

            try {

                saveJournalButton.disabled =
                    true;

                saveJournalButton.textContent =
                    "Saving...";

                const title =
                    journalTitle &&
                    journalTitle.textContent &&
                    journalTitle.textContent !==
                        "New Gemini Journal"
                        ? journalTitle.textContent
                        : "Gemini Conversation";

                const content =
                    currentMessages
                        .map(message => {

                            const label =
                                message.role === "user"
                                    ? "You"
                                    : "Gemini";

                            return `${label}: ${message.text}`;
                        })
                        .join("\n\n");

                const data =
                    await apiRequest(
                        "/api/journal",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    title,
                                    content,
                                    messages:
                                        currentMessages
                                })
                        }
                    );

                console.log(
                    "Conversation saved:",
                    data
                );

                if (data.id) {

                    currentJournalId =
                        data.id;
                }

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
                    "Failed to save conversation.",
                    true
                );

            } finally {

                saveJournalButton.disabled =
                    !currentUser ||
                    currentMessages.length === 0;

                saveJournalButton.textContent =
                    "Save";
            }
        }
    );
}

// ======================================================
// QUICK JOURNAL SAVE
// ======================================================

if (saveButton) {

    saveButton.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;
            }

            const content =
                journalInput
                    ? journalInput.value.trim()
                    : "";

            if (!content) {

                alert(
                    "Please write something first."
                );

                return;
            }

            try {

                saveButton.disabled = true;

                saveButton.textContent =
                    "Saving...";

                const data =
                    await apiRequest(
                        "/api/journal",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    title:
                                        "Quick Journal",

                                    content:
                                        content
                                })
                        }
                    );

                console.log(
                    "Quick journal saved:",
                    data
                );

                if (journalInput) {
                    journalInput.value = "";
                }

                await loadJournalEntries();

                setStatus(
                    "Journal entry saved successfully."
                );

            } catch (error) {

                console.error(
                    "Quick journal save error:",
                    error
                );

                setStatus(
                    error.message ||
                    "Failed to save journal.",
                    true
                );

            } finally {

                saveButton.disabled =
                    !currentUser;

                saveButton.textContent =
                    "Save Entry";
            }
        }
    );
}

// ======================================================
// CLEAR
// ======================================================

if (clearButton) {

    clearButton.addEventListener(
        "click",
        () => {

            if (journalInput) {
                journalInput.value = "";
            }

            setStatus("Cleared.");
        }
    );
}

// ======================================================
// INITIAL UI
// ======================================================

renderMessages();
updateUIForAuth();

console.log(
    "Personal Gemini Journal frontend loaded."
);

console.log(
    "Backend:",
    BACKEND_URL
);