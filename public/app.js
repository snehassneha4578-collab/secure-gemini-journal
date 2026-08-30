// ======================================================
// PERSONAL GEMINI JOURNAL - FRONTEND
// ======================================================


// ======================================================
// FIREBASE AUTH IMPORTS
// ======================================================

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


// ======================================================
// FIREBASE FIRESTORE IMPORTS
// ======================================================

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ======================================================
// FIREBASE CONFIG
// ======================================================

import {
    auth,
    db
} from "./firebase.js";


// ======================================================
// GET HTML ELEMENTS
// ======================================================

const loginButton =
    document.getElementById("loginButton");

const signupButton =
    document.getElementById("signupButton");

const logoutButton =
    document.getElementById("logoutButton");

const authStatus =
    document.getElementById("authStatus");

const journalInput =
    document.getElementById("journalInput");

const saveButton =
    document.getElementById("saveButton");

const clearButton =
    document.getElementById("clearButton");

const statusMessage =
    document.getElementById("statusMessage");

const entriesList =
    document.getElementById("entriesList");

const chatInput =
    document.getElementById("chatInput");

const sendButton =
    document.getElementById("sendButton");

const chatBox =
    document.getElementById("chatBox");

const newConversationButton =
    document.getElementById(
        "newConversationButton"
    );


// ======================================================
// APP LOADED
// ======================================================

console.log(
    "================================="
);

console.log(
    "Personal Gemini Journal"
);

console.log(
    "app.js loaded successfully"
);

console.log(
    "Firebase Auth:",
    auth
);

console.log(
    "Firestore:",
    db
);

console.log(
    "================================="
);


// ======================================================
// CONVERSATION
// ======================================================

let conversationMessages = [];


// ======================================================
// CREATE ACCOUNT
// ======================================================

signupButton.addEventListener(
    "click",
    async () => {

        console.log(
            "Create Account clicked"
        );

        const email =
            prompt(
                "Enter your email:"
            );

        if (!email) {
            return;
        }

        const password =
            prompt(
                "Create a password (minimum 6 characters):"
            );

        if (!password) {
            return;
        }

        if (password.length < 6) {

            alert(
                "Password must be at least 6 characters."
            );

            return;
        }

        try {

            await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            alert(
                "Account created successfully!"
            );

        } catch (error) {

            console.error(
                "Create account error:",
                error
            );

            alert(
                getAuthErrorMessage(error)
            );

        }

    }
);


// ======================================================
// SIGN IN
// ======================================================

loginButton.addEventListener(
    "click",
    async () => {

        console.log(
            "Sign In clicked"
        );

        const email =
            prompt(
                "Enter your email:"
            );

        if (!email) {
            return;
        }

        const password =
            prompt(
                "Enter your password:"
            );

        if (!password) {
            return;
        }

        try {

            await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            alert(
                "Login successful!"
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            alert(
                getAuthErrorMessage(error)
            );

        }

    }
);


// ======================================================
// LOGOUT
// ======================================================

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            conversationMessages = [];

            alert(
                "Logged out successfully."
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


// ======================================================
// AUTH STATE
// ======================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (user) {

            console.log(
                "Logged in:",
                user.email
            );

            authStatus.textContent =
                "Logged in as: " +
                user.email;

            loginButton.style.display =
                "none";

            signupButton.style.display =
                "none";

            logoutButton.style.display =
                "inline-block";

            journalInput.disabled =
                false;

            saveButton.disabled =
                false;

            chatInput.disabled =
                false;

            sendButton.disabled =
                false;

            newConversationButton.disabled =
                false;

            await loadJournalEntries(
                user
            );

            chatBox.innerHTML = `
                <div class="ai-message">
                    <strong>Gemini:</strong>

                    <p>
                        Hello! I'm ready to help you.
                    </p>
                </div>
            `;

        } else {

            console.log(
                "Not logged in"
            );

            authStatus.textContent =
                "Not logged in";

            loginButton.style.display =
                "inline-block";

            signupButton.style.display =
                "inline-block";

            logoutButton.style.display =
                "none";

            journalInput.disabled =
                true;

            saveButton.disabled =
                true;

            chatInput.disabled =
                true;

            sendButton.disabled =
                true;

            newConversationButton.disabled =
                true;

            conversationMessages = [];

            entriesList.innerHTML = `
                <p class="empty-message">
                    Please login to view your journal entries.
                </p>
            `;

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
);


// ======================================================
// SAVE JOURNAL ENTRY
// ======================================================

saveButton.addEventListener(
    "click",
    async () => {

        const text =
            journalInput.value.trim();

        if (!text) {

            statusMessage.textContent =
                "Please write something before saving.";

            return;
        }

        const user =
            auth.currentUser;

        if (!user) {

            statusMessage.textContent =
                "Please login first.";

            return;
        }

        try {

            statusMessage.textContent =
                "Saving...";

            const journalRef =
                collection(
                    db,
                    "users",
                    user.uid,
                    "journal"
                );

            await addDoc(
                journalRef,
                {
                    userId:
                        user.uid,

                    text:
                        text,

                    aiResponse:
                        "",

                    createdAt:
                        serverTimestamp()
                }
            );

            journalInput.value = "";

            statusMessage.textContent =
                "Journal entry saved successfully!";

            await loadJournalEntries(
                user
            );

        } catch (error) {

            console.error(
                "Firestore error:",
                error
            );

            statusMessage.textContent =
                "Failed to save: " +
                error.message;

        }

    }
);


// ======================================================
// CLEAR JOURNAL
// ======================================================

clearButton.addEventListener(
    "click",
    () => {

        journalInput.value = "";

        statusMessage.textContent = "";

    }
);


// ======================================================
// SEND BUTTON
// ======================================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// ======================================================
// ENTER KEY
// ======================================================

chatInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ======================================================
// NEW CONVERSATION
// ======================================================

newConversationButton.addEventListener(
    "click",
    clearConversation
);


// ======================================================
// SEND MESSAGE
// ======================================================

async function sendMessage() {

    const message =
        chatInput.value.trim();

    if (!message) {
        return;
    }

    const user =
        auth.currentUser;

    if (!user) {

        alert(
            "Please login first."
        );

        return;
    }

    const userMessage = {

        role:
            "user",

        text:
            message

    };

    conversationMessages.push(
        userMessage
    );

    displayMessage(
        userMessage
    );

    chatInput.value = "";

    sendButton.disabled =
        true;

    const thinkingElement =
        document.createElement(
            "div"
        );

    thinkingElement.className =
        "ai-message";

    thinkingElement.innerHTML = `
        <strong>Gemini:</strong>

        <p>
            Thinking...
        </p>
    `;

    chatBox.appendChild(
        thinkingElement
    );

    chatBox.scrollTop =
        chatBox.scrollHeight;

    try {

        const response =
            await askGemini(
                conversationMessages
            );

        thinkingElement.remove();

        const modelMessage = {

            role:
                "model",

            text:
                response

        };

        conversationMessages.push(
            modelMessage
        );

        displayMessage(
            modelMessage
        );

        await saveConversation(
            user.uid,
            conversationMessages
        );

    } catch (error) {

        console.error(
            "Gemini error:",
            error
        );

        thinkingElement.remove();

        displayMessage({

            role:
                "model",

            text:
                "Sorry, Gemini could not respond.\n" +
                error.message

        });

    } finally {

        sendButton.disabled =
            false;

        chatInput.focus();

    }

}


// ======================================================
// CALL BACKEND
// ======================================================

async function askGemini(
    messages
) {

    console.log(
        "Preparing authenticated Gemini request..."
    );


    // --------------------------------------------------
    // GET CURRENT FIREBASE USER
    // --------------------------------------------------

    const user =
        auth.currentUser;

    if (!user) {

        throw new Error(
            "Please login before using Gemini."
        );

    }


    console.log(
        "Current Firebase user:",
        user.email
    );


    // --------------------------------------------------
    // GET FIREBASE ID TOKEN
    // --------------------------------------------------

    const idToken =
        await user.getIdToken(
            true
        );


    if (!idToken) {

        throw new Error(
            "Could not obtain Firebase authentication token."
        );

    }


    console.log(
        "Firebase ID token obtained."
    );


    // --------------------------------------------------
    // SEND REQUEST TO BACKEND
    // --------------------------------------------------

    const response =
        await fetch(
            "/api/chat",
            {
                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " +
                        idToken

                },

                body:
                    JSON.stringify({

                        messages:
                            messages

                    })

            }
        );


    // --------------------------------------------------
    // READ RESPONSE
    // --------------------------------------------------

    const responseText =
        await response.text();


    console.log(
        "Backend status:",
        response.status
    );

    console.log(
        "Backend response:",
        responseText
    );


    // --------------------------------------------------
    // CONVERT RESPONSE TO JSON
    // --------------------------------------------------

    let data;

    try {

        data =
            JSON.parse(
                responseText
            );

    } catch (error) {

        throw new Error(
            "Backend returned invalid JSON: " +
            responseText
        );

    }


    // --------------------------------------------------
    // CHECK HTTP ERROR
    // --------------------------------------------------

    if (!response.ok) {

        throw new Error(
            data.error ||
            "Gemini request failed."
        );

    }


    // --------------------------------------------------
    // CHECK GEMINI RESPONSE
    // --------------------------------------------------

    if (!data.response) {

        throw new Error(
            "Empty Gemini response."
        );

    }


    return data.response;

}


// ======================================================
// DISPLAY MESSAGE
// ======================================================

function displayMessage(
    message
) {

    const messageElement =
        document.createElement(
            "div"
        );


    if (
        message.role === "user"
    ) {

        messageElement.className =
            "user-message";

        messageElement.innerHTML = `
            <strong>You:</strong>

            <p>
                ${escapeHtml(
                    message.text
                )}
            </p>
        `;

    } else {

        messageElement.className =
            "ai-message";

        messageElement.innerHTML = `
            <strong>Gemini:</strong>

            <p>
                ${escapeHtml(
                    message.text
                )}
            </p>
        `;

    }


    chatBox.appendChild(
        messageElement
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// ======================================================
// CLEAR CONVERSATION
// ======================================================

function clearConversation() {

    conversationMessages = [];

    chatBox.innerHTML = `
        <div class="ai-message">

            <strong>Gemini:</strong>

            <p>
                New conversation started.
            </p>

        </div>
    `;

    chatInput.value = "";

    chatInput.focus();

}


// ======================================================
// SAVE CONVERSATION
// ======================================================

async function saveConversation(
    userId,
    messages
) {

    if (!userId) {
        return;
    }

    if (
        !Array.isArray(messages) ||
        messages.length === 0
    ) {
        return;
    }


    const journalRef =
        collection(
            db,
            "users",
            userId,
            "journal"
        );


    await addDoc(
        journalRef,
        {

            userId:
                userId,

            messages:
                messages.map(
                    (message) => ({

                        role:
                            message.role,

                        text:
                            message.text

                    })
                ),

            createdAt:
                serverTimestamp()

        }
    );

}


// ======================================================
// LOAD JOURNAL ENTRIES
// ======================================================

async function loadJournalEntries(
    user
) {

    try {

        const journalRef =
            collection(
                db,
                "users",
                user.uid,
                "journal"
            );


        const journalQuery =
            query(
                journalRef,

                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                journalQuery
            );


        entriesList.innerHTML = "";


        if (snapshot.empty) {

            entriesList.innerHTML = `
                <p class="empty-message">
                    No journal entries yet.
                </p>
            `;

            return;

        }


        snapshot.forEach(
            (doc) => {

                const entry =
                    doc.data();


                const entryElement =
                    document.createElement(
                        "div"
                    );


                entryElement.className =
                    "entry";


                let dateText = "";


                if (
                    entry.createdAt &&
                    entry.createdAt.toDate
                ) {

                    dateText =
                        entry.createdAt
                            .toDate()
                            .toLocaleString();

                }


                // ------------------------------------------
                // NORMAL JOURNAL ENTRY
                // ------------------------------------------

                if (entry.text) {

                    entryElement.innerHTML = `
                        <p>
                            ${escapeHtml(
                                entry.text
                            )}
                        </p>

                        <small>
                            ${escapeHtml(
                                dateText
                            )}
                        </small>
                    `;

                }


                // ------------------------------------------
                // CONVERSATION ENTRY
                // ------------------------------------------

                else if (
                    Array.isArray(
                        entry.messages
                    )
                ) {

                    const conversationText =
                        entry.messages
                            .map(
                                (message) =>
                                    `${
                                        message.role ===
                                        "user"
                                            ? "You"
                                            : "Gemini"
                                    }: ${
                                        message.text
                                    }`
                            )
                            .join("\n");


                    entryElement.innerHTML = `
                        <p
                            style="
                                white-space:
                                pre-wrap;
                            "
                        >
                            ${escapeHtml(
                                conversationText
                            )}
                        </p>

                        <small>
                            ${escapeHtml(
                                dateText
                            )}
                        </small>
                    `;

                }


                entriesList.appendChild(
                    entryElement
                );

            }
        );


    } catch (error) {

        console.error(
            "Load journal error:",
            error
        );


        entriesList.innerHTML = `
            <p class="empty-message">

                Unable to load journal entries.

                <br>

                ${escapeHtml(
                    error.message
                )}

            </p>
        `;

    }

}


// ======================================================
// HTML SECURITY
// ======================================================

function escapeHtml(
    text
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(text);

    return div.innerHTML;

}


// ======================================================
// FIREBASE ERROR MESSAGES
// ======================================================

function getAuthErrorMessage(
    error
) {

    switch (error.code) {

        case "auth/email-already-in-use":

            return (
                "This email is already registered. " +
                "Please Sign In."
            );


        case "auth/invalid-email":

            return (
                "Please enter a valid email address."
            );


        case "auth/weak-password":

            return (
                "Password must be at least 6 characters."
            );


        case "auth/invalid-credential":

            return (
                "Invalid email or password."
            );


        case "auth/user-not-found":

            return (
                "No account found with this email."
            );


        case "auth/wrong-password":

            return (
                "Incorrect password."
            );


        case "auth/api-key-not-valid":

            return (
                "Firebase API key is not valid. " +
                "Check firebase.js."
            );


        case "permission-denied":

            return (
                "Firestore permission denied. " +
                "Check Firestore Security Rules."
            );


        default:

            return (
                error.message ||
                "An unknown Firebase error occurred."
            );

    }

}