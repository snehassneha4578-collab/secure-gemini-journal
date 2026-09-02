// ======================================================
// PERSONAL GEMINI JOURNAL - COMPLETE app.js
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
        5000
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

function openAuthModal(
    mode
) {

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
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";

            if (!email) {

                showAuthMessage(
                    "Please enter your email address.",
                    true
                );

                if (exists(emailInput)) {

                    emailInput.focus();

                }

                return;
            }

            if (!password) {

                showAuthMessage(
                    "Please enter your password.",
                    true
                );

                if (exists(passwordInput)) {

                    passwordInput.focus();

                }

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

                    if (
                        exists(
                            emailSignInButton
                        )
                    ) {

                        emailSignInButton.disabled =
                            true;

                    }

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
                            error.message ||
                            message;

                    }

                    showAuthMessage(
                        message,
                        true
                    );

                } finally {

                    if (
                        exists(
                            emailSignInButton
                        )
                    ) {

                        emailSignInButton.disabled =
                            false;

                    }

                }

                return;
            }


            // ==================================================
            // SIGN IN
            // ==================================================

            try {

                if (
                    exists(
                        emailSignInButton
                    )
                ) {

                    emailSignInButton.disabled =
                        true;

                }

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
                        error.message ||
                        message;

                }

                showAuthMessage(
                    message,
                    true
                );

            } finally {

                if (
                    exists(
                        emailSignInButton
                    )
                ) {

                    emailSignInButton.disabled =
                        false;

                }

            }

        }
    );

}


// ======================================================
// FORGOT PASSWORD
// ======================================================

if (
    exists(
        forgotPasswordButton
    )
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

                await signOut(auth);

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
                    error.message ||
                    "Logout failed.",
                    true
                );

            }

        }
    );

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
// API RESPONSE HELPER
// ======================================================

async function readApiResponse(
    response
) {

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    const text =
        await response.text();

    if (!text) {

        return {};

    }

    if (
        contentType
            .toLowerCase()
            .includes(
                "application/json"
            )
    ) {

        try {

            return JSON.parse(
                text
            );

        } catch (error) {

            throw new Error(
                "Server returned invalid JSON."
            );

        }

    }


    if (
        text.trim().startsWith(
            "<!DOCTYPE"
        ) ||
        text.trim().startsWith(
            "<html"
        ) ||
        text.includes(
            "<!DOCTYPE html>"
        )
    ) {

        throw new Error(
            "Backend returned an HTML page instead of JSON. Please check the Render API."
        );

    }

    throw new Error(
        "Server returned an invalid response."
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

function escapeHtml(
    text
) {

    return String(
        text ?? ""
    )
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

function renderMarkdown(
    markdown
) {

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

function addUserMessage(
    text
) {

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

function addGeminiMessage(
    text
) {

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
// CONVERT JOURNAL TO DISPLAY DATA
// ======================================================

function getJournalDisplayData(
    entry
) {

    let title =
        entry.title ||
        "";

    let content =
        entry.content ||
        "";

    let messages =
        Array.isArray(
            entry.messages
        )
            ? entry.messages
            : [];


    // --------------------------------------------------
    // Journals created by /api/chat
    // contain messages but may not contain title/content.
    // --------------------------------------------------

    if (
        !content &&
        messages.length > 0
    ) {

        content =
            messages
                .map(
                    function (message) {

                        const role =
                            message.role ===
                            "user"
                                ? "You"
                                : "Gemini";

                        return (
                            role +
                            ": " +
                            (
                                message.text ||
                                ""
                            )
                        );

                    }
                )
                .join(
                    "\n\n"
                );

    }


    // --------------------------------------------------
    // Generate a useful title automatically.
    // --------------------------------------------------

    if (!title) {

        const firstUserMessage =
            messages.find(
                function (message) {

                    return (
                        message &&
                        message.role ===
                            "user" &&
                        typeof message.text ===
                            "string" &&
                        message.text.trim()
                    );

                }
            );

        if (
            firstUserMessage
        ) {

            title =
                firstUserMessage.text
                    .trim()
                    .substring(
                        0,
                        40
                    );

            if (
                firstUserMessage.text
                    .trim()
                    .length > 40
            ) {

                title +=
                    "...";

            }

        } else {

            title =
                "Gemini Conversation";

        }

    }


    // --------------------------------------------------
    // Preview
    // --------------------------------------------------

    let preview =
        content
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    if (
        preview.length > 100
    ) {

        preview =
            preview.substring(
                0,
                100
            ) +
            "...";

    }


    return {

        title:
            title,

        content:
            content,

        preview:
            preview,

        messages:
            messages

    };

}


// ======================================================
// LOAD JOURNALS
// ======================================================

async function loadJournalEntries() {

    if (!exists(entriesList)) {

        return;

    }

    if (!currentUser) {

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
                        "GET",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token

                    }

                }
            );


        const data =
            await readApiResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Unable to load journals."
            );

        }


        // --------------------------------------------------
        // Support all expected response formats
        // --------------------------------------------------

        let entries =
            [];

        if (
            Array.isArray(data)
        ) {

            entries =
                data;

        } else if (
            data &&
            Array.isArray(
                data.journals
            )
        ) {

            entries =
                data.journals;

        } else if (
            data &&
            Array.isArray(
                data.entries
            )
        ) {

            entries =
                data.entries;

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

        showStatus(
            error.message ||
            "Unable to load journal entries.",
            true
        );

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
        !Array.isArray(entries) ||
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

            const displayData =
                getJournalDisplayData(
                    entry
                );

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "journal-entry-item";


            item.innerHTML = `
                <div class="journal-entry-title">
                    ${escapeHtml(
                        displayData.title
                    )}
                </div>

                <div class="journal-entry-preview">
                    ${escapeHtml(
                        displayData.preview
                    )}
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


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();

                        deleteJournalEntry(
                            entry.id
                        );

                    }
                );

            }


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

    const displayData =
        getJournalDisplayData(
            entry
        );


    if (exists(journalTitle)) {

        journalTitle.textContent =
            displayData.title;

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
        Array.isArray(
            entry.messages
        )
            ? entry.messages.map(
                function (message) {

                    return {

                        role:
                            message.role,

                        text:
                            message.text ||
                            ""

                    };

                }
            )
            : [];


    // --------------------------------------------------
    // If the journal contains structured messages,
    // display them as an actual conversation.
    // --------------------------------------------------

    if (
        currentMessages.length > 0
    ) {

        currentMessages.forEach(
            function (message) {

                if (
                    message.role ===
                    "user"
                ) {

                    addUserMessage(
                        message.text
                    );

                } else {

                    addGeminiMessage(
                        message.text
                    );

                }

            }
        );

    } else {

        // ------------------------------------------------
        // Manual journal without messages
        // ------------------------------------------------

        addUserMessage(
            displayData.content
        );

    }


    if (exists(chatInput)) {

        chatInput.value =
            "";

    }

}


// ======================================================
// DELETE JOURNAL
// ======================================================

async function deleteJournalEntry(
    id
) {

    if (!id) {

        showStatus(
            "Invalid journal ID.",
            true
        );

        return;

    }

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
                    method:
                        "DELETE",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token

                    }

                }
            );


        const data =
            await readApiResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
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
            "Journal entry deleted successfully."
        );


        await loadJournalEntries();

    } catch (error) {

        console.error(
            "Delete journal error:",
            error
        );

        showStatus(
            error.message ||
            "Delete failed.",
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

        const token =
            await getIdToken();


        const response =
            await fetch(
                BACKEND_URL +
                "/api/chat",
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


        const data =
            await readApiResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Gemini could not respond."
            );

        }


        if (
            thinkingMessage &&
            thinkingMessage.parentNode
        ) {

            thinkingMessage.remove();

        }


        const geminiText =
            data.response ||
            data.text ||
            data.message ||
            "Gemini did not return a response.";


        currentMessages.push({

            role:
                "model",

            text:
                geminiText

        });


        addGeminiMessage(
            geminiText
        );


        // --------------------------------------------------
        // Backend automatically saves this conversation.
        // --------------------------------------------------

        if (data.journalId) {

            currentEntryId =
                data.journalId;

        }


        showStatus(
            "Gemini responded successfully."
        );


        // --------------------------------------------------
        // Refresh journal list so the new conversation
        // appears immediately.
        // --------------------------------------------------

        await loadJournalEntries();

    } catch (error) {

        console.error(
            "Gemini error:",
            error
        );


        if (
            currentMessages.length > 0 &&
            currentMessages[
                currentMessages.length - 1
            ].role ===
            "user"
        ) {

            currentMessages.pop();

        }


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
                        error.message ||
                        "Unknown server error."
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
                            function (message) {

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
                                        journalTitle &&
                                        journalTitle.textContent !==
                                        "New Gemini Journal"
                                            ? journalTitle.textContent
                                            : "Gemini Conversation",

                                    content:
                                        content,

                                    messages:
                                        currentMessages,

                                    mood:
                                        null

                                })

                        }
                    );


                const data =
                    await readApiResponse(
                        response
                    );


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        data.message ||
                        "Unable to save conversation."
                    );

                }


                showStatus(
                    "Conversation saved successfully."
                );


                if (data.id) {

                    currentEntryId =
                        data.id;

                }


                await loadJournalEntries();

            } catch (error) {

                console.error(
                    "Save conversation error:",
                    error
                );

                showStatus(
                    error.message ||
                    "Unable to save conversation.",
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
                exists(journalInput)
                    ? journalInput.value.trim()
                    : "";

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
                    await readApiResponse(
                        response
                    );


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        data.message ||
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
                    error.message ||
                    "Unable to save journal.",
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
    "Backend URL:",
    BACKEND_URL
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
    "Journal loading enabled."
);

console.log(
    "Journal deletion enabled."
);

console.log(
    "Structured journal message display enabled."
);

console.log(
    "================================="
);