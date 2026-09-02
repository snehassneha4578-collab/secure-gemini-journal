// ======================================================
// PERSONAL GEMINI JOURNAL - app.js
// ======================================================

// ======================================================
// FIREBASE AUTH
// ======================================================

import { auth } from "./firebase.js";

import {
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


// ======================================================
// RENDER BACKEND
// ======================================================

const BACKEND_URL =
    "https://secure-gemini-journal-tjdq.onrender.com";


// ======================================================
// DOM ELEMENTS
// ======================================================

const loginButton =
    document.getElementById("loginButton");

const signupButton =
    document.getElementById("signupButton");

const forgotPasswordButton =
    document.getElementById("forgotPasswordButton");

const logoutButton =
    document.getElementById("logoutButton");

const authModal =
    document.getElementById("authModal");

const authForm =
    document.getElementById("authForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const emailSignInButton =
    document.getElementById("emailSignInButton");

const closeAuthButton =
    document.getElementById("closeAuthButton");

const authMessage =
    document.getElementById("authMessage");

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
// VARIABLES
// ======================================================

let currentUser = null;

let currentMessages = [];

let currentEntryId = null;

let authMode = "signin";

let isSending = false;


// ======================================================
// HELPER
// ======================================================

function exists(element) {
    return element !== null;
}


// ======================================================
// STATUS MESSAGE
// ======================================================

function showStatus(
    message,
    isError = false
) {

    if (!exists(statusMessage)) {
        return;
    }

    statusMessage.textContent =
        message;

    if (isError) {

        statusMessage.classList.add(
            "error"
        );

    } else {

        statusMessage.classList.remove(
            "error"
        );
    }

    setTimeout(
        function () {

            if (
                statusMessage.textContent ===
                message
            ) {

                statusMessage.textContent =
                    "";
            }

        },
        4000
    );
}


// ======================================================
// AUTH MESSAGE
// ======================================================

function showAuthMessage(
    message,
    isError = false
) {

    if (!exists(authMessage)) {
        return;
    }

    authMessage.textContent =
        message;

    authMessage.style.color =
        isError
            ? "red"
            : "";
}


// ======================================================
// OPEN AUTH MODAL
// ======================================================

function openAuthModal(mode) {

    authMode =
        mode || "signin";

    if (!exists(authModal)) {
        return;
    }

    authModal.style.display =
        "block";

    if (exists(authForm)) {
        authForm.reset();
    }

    if (
        authMode ===
        "signup"
    ) {

        if (
            exists(emailSignInButton)
        ) {

            emailSignInButton.textContent =
                "Create Account";
        }

        showAuthMessage(
            "Enter your email and password to create an account."
        );

    } else {

        if (
            exists(emailSignInButton)
        ) {

            emailSignInButton.textContent =
                "Sign In";
        }

        showAuthMessage("");
    }

    if (exists(emailInput)) {
        emailInput.focus();
    }
}


// ======================================================
// CLOSE AUTH MODAL
// ======================================================

function closeAuthModal() {

    if (exists(authModal)) {

        authModal.style.display =
            "none";
    }

    if (exists(authForm)) {

        authForm.reset();
    }

    showAuthMessage("");
}


// ======================================================
// LOGIN BUTTON
// ======================================================

if (exists(loginButton)) {

    loginButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openAuthModal(
                "signin"
            );
        }
    );
}


// ======================================================
// SIGNUP BUTTON
// ======================================================

if (exists(signupButton)) {

    signupButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openAuthModal(
                "signup"
            );
        }
    );
}


// ======================================================
// CLOSE AUTH BUTTON
// ======================================================

if (exists(closeAuthButton)) {

    closeAuthButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            closeAuthModal();
        }
    );
}


// ======================================================
// AUTH FORM
// ======================================================

if (exists(authForm)) {

    authForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            if (!email) {

                showAuthMessage(
                    "Please enter your email address.",
                    true
                );

                emailInput.focus();

                return;
            }

            if (!password) {

                showAuthMessage(
                    "Please enter your password.",
                    true
                );

                passwordInput.focus();

                return;
            }


            // ==================================================
            // SIGN UP
            // ==================================================

            if (
                authMode ===
                "signup"
            ) {

                if (
                    password.length < 6
                ) {

                    showAuthMessage(
                        "Password must be at least 6 characters.",
                        true
                    );

                    return;
                }

                try {

                    emailSignInButton.disabled =
                        true;

                    showAuthMessage(
                        "Creating account..."
                    );

                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                    showAuthMessage(
                        "Account created successfully!"
                    );

                    setTimeout(
                        function () {

                            closeAuthModal();

                        },
                        700
                    );

                } catch (error) {

                    console.error(
                        "Signup error:",
                        error
                    );

                    let message =
                        "Account creation failed.";

                    if (
                        error.code ===
                        "auth/email-already-in-use"
                    ) {

                        message =
                            "This email already has an account.";

                    } else if (
                        error.code ===
                        "auth/invalid-email"
                    ) {

                        message =
                            "Invalid email address.";

                    } else if (
                        error.code ===
                        "auth/weak-password"
                    ) {

                        message =
                            "Password must be at least 6 characters.";

                    } else {

                        message =
                            error.message;
                    }

                    showAuthMessage(
                        message,
                        true
                    );

                } finally {

                    emailSignInButton.disabled =
                        false;
                }

                return;
            }


            // ==================================================
            // SIGN IN
            // ==================================================

            try {

                emailSignInButton.disabled =
                    true;

                showAuthMessage(
                    "Signing in..."
                );

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                showAuthMessage(
                    "Sign in successful!"
                );

                setTimeout(
                    function () {

                        closeAuthModal();

                    },
                    500
                );

            } catch (error) {

                console.error(
                    "Signin error:",
                    error
                );

                let message =
                    "Sign in failed.";

                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    message =
                        "Incorrect email or password.";

                } else if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    message =
                        "No account exists with this email.";

                } else if (
                    error.code ===
                    "auth/wrong-password"
                ) {

                    message =
                        "Incorrect password.";

                } else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    message =
                        "Invalid email address.";

                } else if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    message =
                        "Too many attempts. Try again later.";

                } else {

                    message =
                        error.message;
                }

                showAuthMessage(
                    message,
                    true
                );

            } finally {

                emailSignInButton.disabled =
                    false;
            }
        }
    );
}


// ======================================================
// FORGOT PASSWORD
// ======================================================

if (
    exists(forgotPasswordButton)
) {

    forgotPasswordButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            const email =
                prompt(
                    "Enter your registered email address:"
                );

            if (!email) {
                return;
            }

            try {

                await sendPasswordResetEmail(
                    auth,
                    email.trim()
                );

                alert(
                    "Password reset email sent successfully!"
                );

            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );

                alert(
                    error.message ||
                    "Password reset failed."
                );
            }
        }
    );
}


// ======================================================
// LOGOUT
// ======================================================

if (exists(logoutButton)) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                await signOut(
                    auth
                );

                currentUser =
                    null;

                currentMessages =
                    [];

                currentEntryId =
                    null;

                showStatus(
                    "Logged out successfully."
                );

            } catch (error) {

                showStatus(
                    error.message,
                    true
                );
            }
        }
    );
}


// ======================================================
// AUTH STATE
// ======================================================

onAuthStateChanged(
    auth,
    async function (user) {

        currentUser =
            user;

        if (user) {

            if (exists(authStatus)) {

                authStatus.textContent =
                    "Logged in as: " +
                    (
                        user.email ||
                        ""
                    );
            }

            if (exists(loginButton)) {

                loginButton.style.display =
                    "none";
            }

            if (exists(signupButton)) {

                signupButton.style.display =
                    "none";
            }

            if (
                exists(
                    forgotPasswordButton
                )
            ) {

                forgotPasswordButton.style.display =
                    "none";
            }

            if (exists(logoutButton)) {

                logoutButton.style.display =
                    "inline-block";
            }

            if (
                exists(
                    newConversationButton
                )
            ) {

                newConversationButton.disabled =
                    false;
            }

            if (exists(chatInput)) {

                chatInput.disabled =
                    false;
            }

            if (exists(sendButton)) {

                sendButton.disabled =
                    false;
            }

            if (exists(journalInput)) {

                journalInput.disabled =
                    false;
            }

            if (exists(saveButton)) {

                saveButton.disabled =
                    false;
            }

            if (exists(clearButton)) {

                clearButton.disabled =
                    false;
            }

            if (
                exists(
                    saveJournalButton
                )
            ) {

                saveJournalButton.disabled =
                    false;
            }

            currentMessages =
                [];

            currentEntryId =
                null;

            if (exists(chatBox)) {

                chatBox.innerHTML =
                    "";
            }

            addGeminiMessage(
                "Hello! I'm ready to help you."
            );

            await loadJournalEntries();

        } else {

            if (exists(authStatus)) {

                authStatus.textContent =
                    "Not logged in";
            }

            if (exists(loginButton)) {

                loginButton.style.display =
                    "inline-block";
            }

            if (exists(signupButton)) {

                signupButton.style.display =
                    "inline-block";
            }

            if (
                exists(
                    forgotPasswordButton
                )
            ) {

                forgotPasswordButton.style.display =
                    "inline-block";
            }

            if (exists(logoutButton)) {

                logoutButton.style.display =
                    "none";
            }

            if (
                exists(
                    newConversationButton
                )
            ) {

                newConversationButton.disabled =
                    true;
            }

            if (exists(chatInput)) {

                chatInput.disabled =
                    true;
            }

            if (exists(sendButton)) {

                sendButton.disabled =
                    true;
            }

            if (exists(journalInput)) {

                journalInput.disabled =
                    true;
            }

            if (exists(saveButton)) {

                saveButton.disabled =
                    true;
            }

            if (exists(clearButton)) {

                clearButton.disabled =
                    true;
            }

            if (
                exists(
                    saveJournalButton
                )
            ) {

                saveJournalButton.disabled =
                    true;
            }

            currentMessages =
                [];

            currentEntryId =
                null;

            if (exists(entriesList)) {

                entriesList.innerHTML = `
                    <p class="empty-message">
                        Please login to view your journals.
                    </p>
                `;
            }

            if (exists(chatBox)) {

                chatBox.innerHTML = `
                    <div class="ai-message">
                        <strong>Gemini:</strong>
                        <p>
                            Please login to start a conversation.
                        </p>
                    </div>
                `;
            }
        }
    }
);


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHtml(text) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ======================================================
// MARKDOWN
// ======================================================

function renderMarkdown(markdown) {

    if (!markdown) {

        return "";
    }

    const text =
        escapeHtml(
            markdown
        );

    return `
        <div class="gemini-markdown">
            <p>
                ${text.replace(
                    /\n/g,
                    "<br>"
                )}
            </p>
        </div>
    `;
}


// ======================================================
// USER MESSAGE
// ======================================================

function addUserMessage(text) {

    if (!exists(chatBox)) {

        return;
    }

    const message =
        document.createElement(
            "div"
        );

    message.className =
        "user-message";

    message.innerHTML = `
        <strong>You:</strong>
        <p>
            ${escapeHtml(text)}
        </p>
    `;

    chatBox.appendChild(
        message
    );

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


// ======================================================
// GEMINI MESSAGE
// ======================================================

function addGeminiMessage(text) {

    if (!exists(chatBox)) {

        return;
    }

    const message =
        document.createElement(
            "div"
        );

    message.className =
        "ai-message";

    message.innerHTML = `
        <strong>Gemini:</strong>
        ${renderMarkdown(text)}
    `;

    chatBox.appendChild(
        message
    );

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


// ======================================================
// FIREBASE TOKEN
// ======================================================

async function getIdToken() {

    if (!currentUser) {

        throw new Error(
            "User is not logged in."
        );
    }

    return await currentUser.getIdToken(
        true
    );
}


// ======================================================
// LOAD JOURNALS
// ======================================================

async function loadJournalEntries() {

    if (!exists(entriesList)) {

        return;
    }

    try {

        const token =
            await getIdToken();

        const response =
            await fetch(
                BACKEND_URL + "/api/journal",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            token
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load journals."
            );
        }

        displayJournalEntries(
            data
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
    }
}


// ======================================================
// DISPLAY JOURNALS
// ======================================================

function displayJournalEntries(
    entries
) {

    if (!exists(entriesList)) {

        return;
    }

    entriesList.innerHTML =
        "";

    if (
        !entries ||
        entries.length === 0
    ) {

        entriesList.innerHTML = `
            <p class="empty-message">
                No journal entries yet.
            </p>
        `;

        return;
    }

    entries.forEach(
        function (entry) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "journal-entry-item";

            const title =
                entry.title ||
                "Untitled Entry";

            const preview =
                (
                    entry.content ||
                    ""
                ).substring(
                    0,
                    100
                );

            item.innerHTML = `
                <div class="journal-entry-title">
                    ${escapeHtml(title)}
                </div>

                <div class="journal-entry-preview">
                    ${escapeHtml(preview)}
                </div>

                <button
                    type="button"
                    class="delete-entry-button">
                    Delete
                </button>
            `;

            item.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target.classList.contains(
                            "delete-entry-button"
                        )
                    ) {

                        return;
                    }

                    openJournalEntry(
                        entry
                    );
                }
            );

            const deleteButton =
                item.querySelector(
                    ".delete-entry-button"
                );

            deleteButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    deleteJournalEntry(
                        entry.id
                    );
                }
            );

            entriesList.appendChild(
                item
            );
        }
    );
}


// ======================================================
// OPEN JOURNAL
// ======================================================

function openJournalEntry(
    entry
) {

    currentEntryId =
        entry.id;

    if (exists(journalTitle)) {

        journalTitle.textContent =
            entry.title ||
            "Journal Entry";
    }

    if (exists(journalStatus)) {

        journalStatus.textContent =
            "Saved journal entry";
    }

    if (exists(chatBox)) {

        chatBox.innerHTML =
            "";
    }

    currentMessages =
        [];

    addUserMessage(
        entry.content ||
        ""
    );
}


// ======================================================
// DELETE JOURNAL
// ======================================================

async function deleteJournalEntry(
    id
) {

    if (
        !confirm(
            "Delete this journal entry?"
        )
    ) {

        return;
    }

    try {

        const token =
            await getIdToken();

        const response =
            await fetch(
                BACKEND_URL +
                `/api/journal/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            token
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Delete failed."
            );
        }

        if (
            currentEntryId ===
            id
        ) {

            currentEntryId =
                null;

            currentMessages =
                [];

            if (exists(chatBox)) {

                chatBox.innerHTML =
                    "";
            }

            if (exists(journalTitle)) {

                journalTitle.textContent =
                    "New Gemini Journal";
            }

            if (exists(journalStatus)) {

                journalStatus.textContent =
                    "Start a new conversation";
            }
        }

        showStatus(
            "Journal entry deleted."
        );

        await loadJournalEntries();

    } catch (error) {

        showStatus(
            error.message,
            true
        );
    }
}


// ======================================================
// RUN BUTTON
// ======================================================

if (exists(sendButton)) {

    sendButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            await sendMessage();
        }
    );
}


// ======================================================
// ENTER KEY
// ======================================================

if (exists(chatInput)) {

    chatInput.addEventListener(
        "keydown",
        async function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                await sendMessage();
            }
        }
    );
}


// ======================================================
// SEND MESSAGE TO GEMINI
// ======================================================

async function sendMessage() {

    if (isSending) {

        return;
    }

    if (!exists(chatInput)) {

        return;
    }

    const message =
        chatInput.value.trim();

    if (!message) {

        showStatus(
            "Please enter a message.",
            true
        );

        chatInput.focus();

        return;
    }

    if (!currentUser) {

        showStatus(
            "Please login first.",
            true
        );

        return;
    }


    // ==================================================
    // START REQUEST
    // ==================================================

    isSending =
        true;

    chatInput.value =
        "";

    if (exists(sendButton)) {

        sendButton.disabled =
            true;

        sendButton.textContent =
            "Thinking...";
    }


    // ==================================================
    // DISPLAY USER MESSAGE
    // ==================================================

    addUserMessage(
        message
    );


    // ==================================================
    // STORE USER MESSAGE
    // ==================================================

    currentMessages.push({

        role:
            "user",

        text:
            message
    });


    // ==================================================
    // THINKING MESSAGE
    // ==================================================

    const thinkingMessage =
        document.createElement(
            "div"
        );

    thinkingMessage.className =
        "ai-message";

    thinkingMessage.innerHTML = `
        <strong>Gemini:</strong>
        <p>Thinking...</p>
    `;

    if (exists(chatBox)) {

        chatBox.appendChild(
            thinkingMessage
        );

        chatBox.scrollTop =
            chatBox.scrollHeight;
    }


    try {

        // ==============================================
        // GET FIREBASE ID TOKEN
        // ==============================================

        const token =
            await getIdToken();


        // ==============================================
        // SEND TO RENDER BACKEND
        // ==============================================

        const response =
            await fetch(
                BACKEND_URL + "/api/chat",
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            token
                    },

                    body:
                        JSON.stringify({

                            messages:
                                currentMessages

                        })
                }
            );


        // ==============================================
        // READ RESPONSE
        // ==============================================

        let data;

        try {

            data =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                "Server returned an invalid response."
            );
        }


        // ==============================================
        // CHECK SERVER ERROR
        // ==============================================

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Gemini could not respond."
            );
        }


        // ==============================================
        // REMOVE THINKING MESSAGE
        // ==============================================

        if (
            thinkingMessage &&
            thinkingMessage.parentNode
        ) {

            thinkingMessage.remove();
        }


        // ==============================================
        // GET GEMINI RESPONSE
        // ==============================================

        const geminiText =
            data.response ||
            "Gemini did not return a response.";


        // ==============================================
        // STORE GEMINI RESPONSE
        // ==============================================

        currentMessages.push({

            role:
                "model",

            text:
                geminiText
        });


        // ==============================================
        // DISPLAY GEMINI RESPONSE
        // ==============================================

        addGeminiMessage(
            geminiText
        );


        // ==============================================
        // SUCCESS STATUS
        // ==============================================

        showStatus(
            "Gemini responded successfully."
        );

    } catch (error) {

        console.error(
            "Gemini error:",
            error
        );


        // ==============================================
        // REMOVE FAILED USER TURN
        // ==============================================

        if (
            currentMessages.length > 0
        ) {

            currentMessages.pop();
        }


        // ==============================================
        // SHOW ERROR
        // ==============================================

        if (
            thinkingMessage &&
            thinkingMessage.parentNode
        ) {

            thinkingMessage.innerHTML = `
                <strong>Gemini:</strong>

                <p>
                    Sorry, Gemini could not respond.
                </p>

                <small>
                    ${escapeHtml(
                        error.message
                    )}
                </small>
            `;

        } else {

            addGeminiMessage(
                "Sorry, Gemini could not respond."
            );
        }

        showStatus(
            error.message ||
            "Gemini request failed.",
            true
        );

    } finally {

        // ==============================================
        // RESTORE RUN BUTTON
        // ==============================================

        isSending =
            false;

        if (exists(sendButton)) {

            sendButton.disabled =
                false;

            sendButton.textContent =
                "Run";
        }

        if (exists(chatInput)) {

            chatInput.focus();
        }
    }
}


// ======================================================
// NEW CONVERSATION
// ======================================================

if (
    exists(
        newConversationButton
    )
) {

    newConversationButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            currentMessages =
                [];

            currentEntryId =
                null;

            if (exists(journalTitle)) {

                journalTitle.textContent =
                    "New Gemini Journal";
            }

            if (exists(journalStatus)) {

                journalStatus.textContent =
                    "Start a new conversation";
            }

            if (exists(chatBox)) {

                chatBox.innerHTML =
                    "";
            }

            addGeminiMessage(
                "Hello! I'm ready to help you."
            );

            if (exists(chatInput)) {

                chatInput.value =
                    "";

                chatInput.focus();
            }
        }
    );
}


// ======================================================
// SAVE CONVERSATION
// ======================================================

if (
    exists(
        saveJournalButton
    )
) {

    saveJournalButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            if (
                currentMessages.length ===
                0
            ) {

                showStatus(
                    "There is no conversation to save.",
                    true
                );

                return;
            }

            if (!currentUser) {

                showStatus(
                    "Please login first.",
                    true
                );

                return;
            }

            try {

                const content =
                    currentMessages
                        .map(
                            function (
                                message
                            ) {

                                const role =
                                    message.role ===
                                    "user"
                                        ? "You"
                                        : "Gemini";

                                return (
                                    role +
                                    ": " +
                                    message.text
                                );
                            }
                        )
                        .join(
                            "\n\n"
                        );

                const token =
                    await getIdToken();

                const response =
                    await fetch(
                        BACKEND_URL +
                        "/api/journal",
                        {
                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " +
                                    token
                            },

                            body:
                                JSON.stringify({

                                    title:
                                        "Gemini Conversation",

                                    content:
                                        content,

                                    mood:
                                        null

                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to save conversation."
                    );
                }

                showStatus(
                    "Conversation saved successfully."
                );

                await loadJournalEntries();

            } catch (error) {

                console.error(
                    "Save conversation error:",
                    error
                );

                showStatus(
                    error.message,
                    true
                );
            }
        }
    );
}


// ======================================================
// QUICK JOURNAL SAVE
// ======================================================

if (exists(saveButton)) {

    saveButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            if (!currentUser) {

                showStatus(
                    "Please login first.",
                    true
                );

                return;
            }

            const content =
                journalInput.value.trim();

            if (!content) {

                showStatus(
                    "Please write something first.",
                    true
                );

                return;
            }

            try {

                const token =
                    await getIdToken();

                const response =
                    await fetch(
                        BACKEND_URL +
                        "/api/journal",
                        {
                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " +
                                    token
                            },

                            body:
                                JSON.stringify({

                                    title:
                                        "Quick Journal Entry",

                                    content:
                                        content,

                                    mood:
                                        null

                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to save journal."
                    );
                }

                journalInput.value =
                    "";

                showStatus(
                    "Journal entry saved successfully."
                );

                await loadJournalEntries();

            } catch (error) {

                console.error(
                    "Quick journal error:",
                    error
                );

                showStatus(
                    error.message,
                    true
                );
            }
        }
    );
}


// ======================================================
// CLEAR JOURNAL
// ======================================================

if (exists(clearButton)) {

    clearButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            if (exists(journalInput)) {

                journalInput.value =
                    "";
            }
        }
    );
}


// ======================================================
// MODAL BACKDROP
// ======================================================

if (exists(authModal)) {

    authModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                authModal
            ) {

                closeAuthModal();
            }
        }
    );
}


// ======================================================
// STARTUP
// ======================================================

console.log(
    "================================="
);

console.log(
    "Personal Gemini Journal"
);

console.log(
    "Frontend loaded successfully."
);

console.log(
    "Firebase authentication connected."
);

console.log(
    "Email/password authentication enabled."
);

console.log(
    "Forgot Password enabled."
);

console.log(
    "Render Gemini backend connected."
);

console.log(
    "Run button connected."
);

console.log(
    "Conversation history enabled."
);

console.log(
    "Journal saving enabled."
);

console.log(
    "================================="
);