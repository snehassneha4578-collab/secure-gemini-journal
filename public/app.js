// ======================================================
// PERSONAL GEMINI JOURNAL - FRONTEND
// ======================================================

// ======================================================
// FIREBASE CONFIGURATION
// ======================================================

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_WEB_API_KEY",
    authDomain: "gemini-journal-8a53a.firebaseapp.com",
    projectId: "gemini-journal-8a53a",
    storageBucket: "gemini-journal-8a53a.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
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

const loginSection =
    document.getElementById("loginSection");

const journalSection =
    document.getElementById("journalSection");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const signupEmailInput =
    document.getElementById("signupEmail");

const signupPasswordInput =
    document.getElementById("signupPassword");

const loginMessage =
    document.getElementById("loginMessage");

const userEmailDisplay =
    document.getElementById("userEmail");

const logoutButton =
    document.getElementById("logoutButton");

const journalEntriesContainer =
    document.getElementById("journalEntries");

const messagesContainer =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendMessageButton =
    document.getElementById("sendMessageButton");

const newConversationButton =
    document.getElementById("newConversationButton");

const saveJournalButton =
    document.getElementById("saveJournalButton");

const clearButton =
    document.getElementById("clearButton");

const journalTitleInput =
    document.getElementById("journalTitle");

const journalContentInput =
    document.getElementById("journalContent");

const journalMoodInput =
    document.getElementById("journalMood");

const quickSaveButton =
    document.getElementById("quickSaveButton");

const quickJournalInput =
    document.getElementById("quickJournalInput");

const quickJournalMessage =
    document.getElementById("quickJournalMessage");

const resetPasswordButton =
    document.getElementById("resetPasswordButton");

const showSignupButton =
    document.getElementById("showSignupButton");

const showLoginButton =
    document.getElementById("showLoginButton");

const authContainer =
    document.getElementById("authContainer");

const appContainer =
    document.getElementById("appContainer");

// ======================================================
// SAFE ELEMENT DISPLAY
// ======================================================

function showElement(element) {

    if (element) {

        element.style.display = "";

    }

}

function hideElement(element) {

    if (element) {

        element.style.display = "none";

    }

}

// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

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
// API REQUEST HELPER
// ======================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    if (!currentUser) {

        throw new Error(
            "User is not logged in."
        );

    }

    const token =
        await currentUser.getIdToken(
            true
        );

    const requestOptions = {

        ...options,

        headers: {

            "Content-Type":
                "application/json",

            "Authorization":
                `Bearer ${token}`,

            ...(options.headers || {})

        }

    };

    const response =
        await fetch(
            BACKEND_URL + endpoint,
            requestOptions
        );

    let data;

    try {

        data =
            await response.json();

    } catch (error) {

        data = {};

    }

    if (!response.ok) {

        const errorMessage =
            data.error ||
            data.message ||
            `Request failed with status ${response.status}`;

        const error =
            new Error(
                errorMessage
            );

        error.status =
            response.status;

        throw error;

    }

    return data;

}

// ======================================================
// AUTH STATE
// ======================================================

auth.onAuthStateChanged(
    async (user) => {

        console.log(
            "Auth state changed:",
            user
                ? user.email
                : "No user"
        );


        currentUser =
            user;


        if (user) {

            console.log(
                "User logged in:",
                user.email
            );


            if (userEmailDisplay) {

                userEmailDisplay.textContent =
                    `Logged in as: ${user.email}`;

            }


            if (authContainer) {

                hideElement(
                    authContainer
                );

            }


            if (appContainer) {

                showElement(
                    appContainer
                );

            }


            if (loginSection) {

                hideElement(
                    loginSection
                );

            }


            if (journalSection) {

                showElement(
                    journalSection
                );

            }


            try {

                await loadJournalEntries();

            } catch (error) {

                console.error(
                    "Initial journal loading failed:",
                    error
                );

            }

        } else {

            console.log(
                "No user logged in."
            );


            if (authContainer) {

                showElement(
                    authContainer
                );

            }


            if (appContainer) {

                hideElement(
                    appContainer
                );

            }


            if (loginSection) {

                showElement(
                    loginSection
                );

            }


            if (journalSection) {

                hideElement(
                    journalSection
                );

            }

        }

    }
);

// ======================================================
// LOGIN
// ======================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            if (!email || !password) {

                setLoginMessage(
                    "Please enter email and password.",
                    true
                );

                return;

            }


            setLoginMessage(
                "Signing in...",
                false
            );


            try {

                await auth.signInWithEmailAndPassword(
                    email,
                    password
                );


                setLoginMessage(
                    "",
                    false
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                setLoginMessage(
                    getFirebaseErrorMessage(
                        error
                    ),
                    true
                );

            }

        }
    );

}

// ======================================================
// SIGN UP
// ======================================================

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                signupEmailInput
                    ? signupEmailInput.value.trim()
                    : "";

            const password =
                signupPasswordInput
                    ? signupPasswordInput.value
                    : "";


            if (!email || !password) {

                setLoginMessage(
                    "Please enter email and password.",
                    true
                );

                return;

            }


            if (password.length < 6) {

                setLoginMessage(
                    "Password must contain at least 6 characters.",
                    true
                );

                return;

            }


            setLoginMessage(
                "Creating account...",
                false
            );


            try {

                await auth.createUserWithEmailAndPassword(
                    email,
                    password
                );


                setLoginMessage(
                    "",
                    false
                );


            } catch (error) {

                console.error(
                    "Signup error:",
                    error
                );


                setLoginMessage(
                    getFirebaseErrorMessage(
                        error
                    ),
                    true
                );

            }

        }
    );

}

// ======================================================
// FIREBASE ERROR MESSAGE
// ======================================================

function getFirebaseErrorMessage(
    error
) {

    const code =
        error &&
        error.code
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

            return "Password is too weak.";

        case "auth/too-many-requests":

            return "Too many attempts. Please try again later.";

        default:

            return (
                error.message ||
                "Authentication failed."
            );

    }

}

// ======================================================
// LOGIN MESSAGE
// ======================================================

function setLoginMessage(
    message,
    isError
) {

    if (!loginMessage) {

        return;

    }


    loginMessage.textContent =
        message;


    loginMessage.style.display =
        message
            ? "block"
            : "none";


    if (isError) {

        loginMessage.style.color =
            "red";

    } else {

        loginMessage.style.color =
            "";

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

                currentMessages = [];

                currentJournalId = null;

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
// PASSWORD RESET
// ======================================================

if (resetPasswordButton) {

    resetPasswordButton.addEventListener(
        "click",
        async () => {

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            if (!email) {

                setLoginMessage(
                    "Enter your email address first.",
                    true
                );

                return;

            }


            try {

                await auth.sendPasswordResetEmail(
                    email
                );


                setLoginMessage(
                    "Password reset email sent.",
                    false
                );


            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );


                setLoginMessage(
                    getFirebaseErrorMessage(
                        error
                    ),
                    true
                );

            }

        }
    );

}

// ======================================================
// SHOW SIGNUP
// ======================================================

if (showSignupButton) {

    showSignupButton.addEventListener(
        "click",
        () => {

            if (loginForm) {

                hideElement(
                    loginForm
                );

            }


            if (signupForm) {

                showElement(
                    signupForm
                );

            }

        }
    );

}

// ======================================================
// SHOW LOGIN
// ======================================================

if (showLoginButton) {

    showLoginButton.addEventListener(
        "click",
        () => {

            if (signupForm) {

                hideElement(
                    signupForm
                );

            }


            if (loginForm) {

                showElement(
                    loginForm
                );

            }

        }
    );

}

// ======================================================
// LOAD JOURNAL ENTRIES
// ======================================================

async function loadJournalEntries() {

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


        // ==================================================
        // IMPORTANT FIX
        // ==================================================
        //
        // Backend returns:
        //
        // {
        //     journals: [...],
        //     count: 10
        // }
        //
        // displayJournalEntries() needs the ARRAY.
        //
        // ==================================================

        const entries =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(
                        data.journals
                    )
                        ? data.journals
                        : []
                );


        console.log(
            "Journal entries loaded:",
            entries.length
        );


        displayJournalEntries(
            entries
        );


    } catch (error) {

        console.error(
            "Load journals error:",
            error
        );


        if (journalEntriesContainer) {

            journalEntriesContainer.innerHTML = `

                <p>
                    Unable to load journal entries.
                </p>

            `;

        }

    }

}

// ======================================================
// JOURNAL DISPLAY DATA
// ======================================================

function getJournalDisplayData(
    entry
) {

    if (!entry) {

        return {

            title:
                "Journal Entry",

            content:
                "",

            preview:
                "",

            date:
                "",

            messages:
                []

        };

    }


    let title =
        typeof entry.title ===
        "string"
            ? entry.title.trim()
            : "";


    let content =
        typeof entry.content ===
        "string"
            ? entry.content
            : "";


    const messages =
        Array.isArray(
            entry.messages
        )
            ? entry.messages
            : [];


    // ==================================================
    // GENERATE TITLE FROM FIRST USER MESSAGE
    // ==================================================

    if (
        (
            !title ||
            title === "Gemini Conversation"
        ) &&
        messages.length > 0
    ) {

        const firstUserMessage =
            messages.find(
                (message) =>
                    message &&
                    message.role === "user" &&
                    typeof message.text ===
                        "string"
            );


        if (
            firstUserMessage &&
            firstUserMessage.text.trim()
        ) {

            title =
                firstUserMessage.text
                    .trim()
                    .substring(
                        0,
                        45
                    );


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

        title =
            "Journal Entry";

    }


    // ==================================================
    // BUILD CONTENT FROM MESSAGES
    // ==================================================

    if (
        !content &&
        messages.length > 0
    ) {

        content =
            messages
                .map(
                    (message) => {

                        const role =
                            message.role ===
                            "user"
                                ? "You"
                                : "Gemini";

                        const text =
                            typeof message.text ===
                            "string"
                                ? message.text
                                : "";

                        return (
                            `${role}: ${text}`
                        );

                    }
                )
                .join(
                    "\n\n"
                );

    }


    // ==================================================
    // PREVIEW
    // ==================================================

    const preview =
        String(
            content || ""
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .substring(
                0,
                120
            );


    // ==================================================
    // DATE
    // ==================================================

    let date = "";


    if (entry.createdAt) {

        try {

            const parsedDate =
                new Date(
                    entry.createdAt
                );


            if (
                !Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                date =
                    parsedDate.toLocaleString();

            }

        } catch (error) {

            date = "";

        }

    }


    return {

        title:
            title,

        content:
            content,

        preview:
            preview,

        date:
            date,

        messages:
            messages

    };

}

// ======================================================
// DISPLAY JOURNAL ENTRIES
// ======================================================

function displayJournalEntries(
    entries
) {

    if (!journalEntriesContainer) {

        return;

    }


    journalEntriesContainer.innerHTML =
        "";


    if (
        !Array.isArray(entries)
    ) {

        console.error(
            "displayJournalEntries expected an array:",
            entries
        );


        journalEntriesContainer.innerHTML = `

            <p>
                Unable to load journal entries.
            </p>

        `;

        return;

    }


    if (
        entries.length === 0
    ) {

        journalEntriesContainer.innerHTML = `

            <p>
                No journal entries yet.
            </p>

        `;

        return;

    }


    entries.forEach(
        (entry) => {

            const displayData =
                getJournalDisplayData(
                    entry
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "journal-entry";


            card.innerHTML = `

                <div class="journal-entry-header">

                    <h3>
                        ${escapeHtml(
                            displayData.title
                        )}
                    </h3>

                    ${
                        displayData.date
                            ? `
                                <small>
                                    ${escapeHtml(
                                        displayData.date
                                    )}
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
                        class="open-journal-button"
                    >
                        Open
                    </button>

                    <button
                        type="button"
                        class="delete-journal-button"
                    >
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

                        openJournalEntry(
                            entry
                        );

                    }
                );

            }


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    () => {

                        deleteJournalEntry(
                            entry.id
                        );

                    }
                );

            }


            journalEntriesContainer.appendChild(
                card
            );

        }
    );

}

// ======================================================
// OPEN JOURNAL ENTRY
// ======================================================

function openJournalEntry(
    entry
) {

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
        getJournalDisplayData(
            entry
        );


    // ==================================================
    // LOAD MESSAGES
    // ==================================================

    if (
        Array.isArray(
            entry.messages
        ) &&
        entry.messages.length > 0
    ) {

        currentMessages =
            entry.messages
                .filter(
                    (message) => {

                        return (
                            message &&
                            (
                                message.role ===
                                    "user" ||
                                message.role ===
                                    "model"
                            ) &&
                            typeof message.text ===
                                "string"
                        );

                    }
                )
                .map(
                    (message) => {

                        return {

                            role:
                                message.role,

                            text:
                                message.text

                        };

                    }
                );

    } else {

        currentMessages = [];

    }


    renderMessages();


    // ==================================================
    // LOAD QUICK JOURNAL CONTENT
    // ==================================================

    if (journalTitleInput) {

        journalTitleInput.value =
            displayData.title;

    }


    if (journalContentInput) {

        journalContentInput.value =
            displayData.content;

    }


    if (journalMoodInput) {

        journalMoodInput.value =
            entry.mood || "";

    }


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}

// ======================================================
// DELETE JOURNAL ENTRY
// ======================================================

async function deleteJournalEntry(
    journalId
) {

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

        await apiRequest(
            `/api/journal/${encodeURIComponent(
                journalId
            )}`,
            {

                method:
                    "DELETE"

            }
        );


        if (
            currentJournalId ===
            journalId
        ) {

            currentJournalId =
                null;

        }


        await loadJournalEntries();


    } catch (error) {

        console.error(
            "Delete journal error:",
            error
        );


        alert(
            error.message ||
            "Failed to delete journal."
        );

    }

}

// ======================================================
// RENDER MESSAGES
// ======================================================

function renderMessages() {

    if (!messagesContainer) {

        return;

    }


    messagesContainer.innerHTML =
        "";


    if (
        currentMessages.length ===
        0
    ) {

        messagesContainer.innerHTML = `

            <div class="welcome-message">

                <strong>Gemini:</strong>

                <p>
                    Hello! I'm ready to help you.
                </p>

            </div>

        `;

        return;

    }


    currentMessages.forEach(
        (message) => {

            const messageDiv =
                document.createElement(
                    "div"
                );


            messageDiv.className =
                message.role ===
                    "user"
                        ? "message user-message"
                        : "message gemini-message";


            const label =
                message.role ===
                    "user"
                        ? "You"
                        : "Gemini";


            messageDiv.innerHTML = `

                <strong>
                    ${label}:
                </strong>

                <p>
                    ${escapeHtml(
                        message.text
                    ).replace(
                        /\n/g,
                        "<br>"
                    )}
                </p>

            `;


            messagesContainer.appendChild(
                messageDiv
            );

        }
    );


    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

}

// ======================================================
// SEND GEMINI MESSAGE
// ======================================================

async function sendMessage() {

    if (!messageInput) {

        return;

    }


    const text =
        messageInput.value.trim();


    if (!text) {

        return;

    }


    if (!currentUser) {

        alert(
            "Please log in first."
        );

        return;

    }


    // ==================================================
    // ADD USER MESSAGE
    // ==================================================

    currentMessages.push({

        role:
            "user",

        text:
            text

    });


    messageInput.value =
        "";


    renderMessages();


    // ==================================================
    // DISABLE BUTTON
    // ==================================================

    if (sendMessageButton) {

        sendMessageButton.disabled =
            true;

        sendMessageButton.textContent =
            "Thinking...";

    }


    try {

        console.log(
            "Sending Gemini request..."
        );


        const data =
            await apiRequest(
                "/api/chat",
                {

                    method:
                        "POST",

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
            typeof data.response ===
            "string"
                ? data.response
                : "";


        if (!reply) {

            throw new Error(
                "Gemini returned an empty response."
            );

        }


        // ==================================================
        // ADD GEMINI RESPONSE
        // ==================================================

        currentMessages.push({

            role:
                "model",

            text:
                reply

        });


        // ==================================================
        // STORE JOURNAL ID
        // ==================================================

        if (data.journalId) {

            currentJournalId =
                data.journalId;

        }


        renderMessages();


        // ==================================================
        // RELOAD JOURNALS
        // ==================================================

        await loadJournalEntries();


    } catch (error) {

        console.error(
            "Gemini request error:",
            error
        );


        // ==================================================
        // REMOVE USER MESSAGE IF REQUEST FAILED
        // ==================================================

        if (
            currentMessages.length >
            0 &&
            currentMessages[
                currentMessages.length - 1
            ].role === "user"
        ) {

            currentMessages.pop();

        }


        renderMessages();


        const errorText =
            error.message ||
            "Gemini could not respond.";


        const errorDiv =
            document.createElement(
                "div"
            );


        errorDiv.className =
            "message gemini-message";


        errorDiv.innerHTML = `

            <strong>
                Gemini:
            </strong>

            <p>
                ${escapeHtml(
                    errorText
                )}
            </p>

        `;


        if (messagesContainer) {

            messagesContainer.appendChild(
                errorDiv
            );

        }

    } finally {

        if (sendMessageButton) {

            sendMessageButton.disabled =
                false;

            sendMessageButton.textContent =
                "Send";

        }

    }

}

// ======================================================
// SEND MESSAGE BUTTON
// ======================================================

if (sendMessageButton) {

    sendMessageButton.addEventListener(
        "click",
        sendMessage
    );

}

// ======================================================
// ENTER KEY TO SEND
// ======================================================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                    "Enter" &&
                !event.shiftKey
            ) {

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

            currentMessages =
                [];

            currentJournalId =
                null;


            renderMessages();


            if (journalTitleInput) {

                journalTitleInput.value =
                    "";

            }


            if (journalContentInput) {

                journalContentInput.value =
                    "";

            }


            if (journalMoodInput) {

                journalMoodInput.value =
                    "";

            }


            if (messageInput) {

                messageInput.value =
                    "";

                messageInput.focus();

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
                    "Please log in first."
                );

                return;

            }


            if (
                currentMessages.length ===
                0
            ) {

                alert(
                    "There is no conversation to save."
                );

                return;

            }


            const title =
                journalTitleInput &&
                journalTitleInput.value.trim()
                    ? journalTitleInput.value.trim()
                    : "Gemini Conversation";


            const content =
                currentMessages
                    .map(
                        (message) => {

                            const label =
                                message.role ===
                                    "user"
                                        ? "You"
                                        : "Gemini";

                            return (
                                `${label}: ${message.text}`
                            );

                        }
                    )
                    .join(
                        "\n\n"
                    );


            try {

                saveJournalButton.disabled =
                    true;


                saveJournalButton.textContent =
                    "Saving...";


                const data =
                    await apiRequest(
                        "/api/journal",
                        {

                            method:
                                "POST",

                            body:
                                JSON.stringify({

                                    title:
                                        title,

                                    content:
                                        content,

                                    mood:
                                        journalMoodInput
                                            ? journalMoodInput.value
                                            : null,

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


                alert(
                    "Conversation saved successfully."
                );


            } catch (error) {

                console.error(
                    "Save conversation error:",
                    error
                );


                alert(
                    error.message ||
                    "Failed to save conversation."
                );


            } finally {

                saveJournalButton.disabled =
                    false;


                saveJournalButton.textContent =
                    "Save Conversation";

            }

        }
    );

}

// ======================================================
// CLEAR CURRENT CONVERSATION
// ======================================================

if (clearButton) {

    clearButton.addEventListener(
        "click",
        () => {

            const confirmed =
                window.confirm(
                    "Clear the current journal?"
                );


            if (!confirmed) {

                return;

            }


            currentMessages =
                [];

            currentJournalId =
                null;


            if (journalTitleInput) {

                journalTitleInput.value =
                    "";

            }


            if (journalContentInput) {

                journalContentInput.value =
                    "";

            }


            if (journalMoodInput) {

                journalMoodInput.value =
                    "";

            }


            renderMessages();

        }
    );

}

// ======================================================
// QUICK JOURNAL SAVE
// ======================================================

if (quickSaveButton) {

    quickSaveButton.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please log in first."
                );

                return;

            }


            const content =
                quickJournalInput
                    ? quickJournalInput.value.trim()
                    : "";


            if (!content) {

                if (quickJournalMessage) {

                    quickJournalMessage.textContent =
                        "Please write something first.";

                }

                return;

            }


            try {

                quickSaveButton.disabled =
                    true;


                quickSaveButton.textContent =
                    "Saving...";


                const title =
                    journalTitleInput &&
                    journalTitleInput.value.trim()
                        ? journalTitleInput.value.trim()
                        : "Quick Journal";


                const data =
                    await apiRequest(
                        "/api/journal",
                        {

                            method:
                                "POST",

                            body:
                                JSON.stringify({

                                    title:
                                        title,

                                    content:
                                        content,

                                    mood:
                                        journalMoodInput
                                            ? journalMoodInput.value
                                            : null

                                })

                        }
                    );


                console.log(
                    "Quick journal saved:",
                    data
                );


                if (quickJournalMessage) {

                    quickJournalMessage.textContent =
                        "Journal saved successfully.";

                }


                if (quickJournalInput) {

                    quickJournalInput.value =
                        "";

                }


                await loadJournalEntries();


            } catch (error) {

                console.error(
                    "Quick journal save error:",
                    error
                );


                if (quickJournalMessage) {

                    quickJournalMessage.textContent =
                        error.message ||
                        "Failed to save journal.";

                }


            } finally {

                quickSaveButton.disabled =
                    false;


                quickSaveButton.textContent =
                    "Save Journal";

            }

        }
    );

}

// ======================================================
// INITIAL MESSAGE
// ======================================================

renderMessages();


// ======================================================
// DEBUG INFORMATION
// ======================================================

console.log(
    "Personal Gemini Journal frontend loaded."
);

console.log(
    "Backend:",
    BACKEND_URL
);