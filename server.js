// ======================================================
// PERSONAL GEMINI JOURNAL - BACKEND
// ======================================================

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const {
    initializeApp
} = require("firebase-admin/app");

const {
    getAuth
} = require("firebase-admin/auth");

const {
    getFirestore,
    FieldValue
} = require("firebase-admin/firestore");


// ======================================================
// FIREBASE ADMIN INITIALIZATION
// ======================================================

initializeApp();

const auth = getAuth();
const db = getFirestore();


// ======================================================
// EXPRESS APP
// ======================================================

const app = express();


// ======================================================
// PORT
// ======================================================

const PORT = process.env.PORT || 8080;


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());


// ======================================================
// FRONTEND STATIC FILES
// ======================================================

// If public/index.html exists,
// Express can serve the frontend.

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ======================================================
// GEMINI API
// ======================================================

const geminiApiKey =
    process.env.GEMINI_API_KEY;

if (!geminiApiKey) {

    console.error(
        "ERROR: GEMINI_API_KEY is missing from .env"
    );

    process.exit(1);
}

console.log(
    "Gemini API key loaded successfully."
);

const ai = new GoogleGenAI({
    apiKey: geminiApiKey
});


// ======================================================
// FIREBASE AUTHENTICATION MIDDLEWARE
// ======================================================

async function authenticateUser(
    req,
    res,
    next
) {

    try {

        const authHeader =
            req.headers.authorization;


        // ------------------------------------------------
        // CHECK AUTHORIZATION HEADER
        // ------------------------------------------------

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                error:
                    "Authentication token required."
            });

        }


        // ------------------------------------------------
        // EXTRACT ID TOKEN
        // ------------------------------------------------

        const idToken =
            authHeader.substring(7);


        if (!idToken) {

            return res.status(401).json({
                error:
                    "Authentication token is missing."
            });

        }


        // ------------------------------------------------
        // VERIFY FIREBASE TOKEN
        // ------------------------------------------------

        const decodedToken =
            await auth.verifyIdToken(
                idToken
            );


        // ------------------------------------------------
        // STORE VERIFIED USER
        // ------------------------------------------------

        req.user = decodedToken;

        console.log(
            "Authenticated UID:",
            decodedToken.uid
        );


        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        return res.status(401).json({
            error:
                "Invalid or expired authentication token."
        });

    }

}


// ======================================================
// HOME / HEALTH CHECK
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.send(`
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Personal Gemini Journal</title>

<style>

body {

    font-family: Arial, sans-serif;

    text-align: center;

    margin-top: 100px;

    background: #f5f7fb;

}

h1 {

    color: #333;

}

.status {

    display: inline-block;

    padding: 15px 25px;

    background: #e8f5e9;

    color: #2e7d32;

    border-radius: 10px;

    font-size: 18px;

}

</style>

</head>

<body>

<h1>
Personal Gemini Journal
</h1>

<div class="status">

✅ Backend is running successfully

</div>

<p>
Port: ${PORT}
</p>

<p>
Firebase + Gemini + Firestore connected.
</p>

</body>

</html>
        `);

    }
);


// ======================================================
// POST /api/chat
// ======================================================
//
// Frontend sends:
//
// {
//     "messages": [
//         {
//             "role": "user",
//             "text": "Hello"
//         }
//     ]
// }
//
// Backend:
// 1. Verifies Firebase token
// 2. Gets verified UID
// 3. Sends conversation to Gemini
// 4. Saves journal to Firestore
// 5. Returns Gemini response
//
// ======================================================

app.post(
    "/api/chat",
    authenticateUser,
    async (req, res) => {

        try {

            const {
                messages
            } = req.body;


            // ------------------------------------------------
            // CHECK MESSAGES
            // ------------------------------------------------

            if (
                !Array.isArray(messages) ||
                messages.length === 0
            ) {

                return res.status(400).json({
                    error:
                        "Messages are required."
                });

            }


            // ------------------------------------------------
            // VERIFIED UID
            // ------------------------------------------------

            const uid =
                req.user.uid;

            console.log(
                "Processing chat for UID:",
                uid
            );


            // ------------------------------------------------
            // CLEAN MESSAGE HISTORY
            // ------------------------------------------------

            const cleanMessages =
                messages

                    .filter(
                        (item) => {

                            return (
                                item &&
                                (
                                    item.role === "user" ||
                                    item.role === "model"
                                ) &&
                                typeof item.text === "string" &&
                                item.text.trim()
                            );

                        }
                    )

                    .map(
                        (item) => ({

                            role: item.role,

                            text:
                                item.text.trim()

                        })
                    );


            if (
                cleanMessages.length === 0
            ) {

                return res.status(400).json({
                    error:
                        "No valid messages were provided."
                });

            }


            // ------------------------------------------------
            // CONVERT TO GEMINI FORMAT
            // ------------------------------------------------

            const contents =
                cleanMessages.map(
                    (item) => ({

                        role: item.role,

                        parts: [
                            {
                                text: item.text
                            }
                        ]

                    })
                );


            console.log(
                "Sending",
                contents.length,
                "messages to Gemini..."
            );


            // ------------------------------------------------
            // CALL GEMINI
            // ------------------------------------------------

            const response =
                await ai.models.generateContent({

                    model:
                        "gemini-2.5-flash",

                    contents:
                        contents

                });


            const reply =
                response.text;


            // ------------------------------------------------
            // CHECK GEMINI RESPONSE
            // ------------------------------------------------

            if (
                !reply ||
                !reply.trim()
            ) {

                throw new Error(
                    "Gemini returned an empty response."
                );

            }


            console.log(
                "Gemini response received successfully."
            );


            // ------------------------------------------------
            // COMPLETE CONVERSATION
            // ------------------------------------------------

            const completeMessages = [

                ...cleanMessages,

                {
                    role: "model",

                    text:
                        reply.trim()
                }

            ];


            // ------------------------------------------------
            // SAVE TO FIRESTORE
            // ------------------------------------------------

            const journalRef =
                await db

                    .collection("users")

                    .doc(uid)

                    .collection("journal")

                    .add({

                        userId:
                            uid,

                        messages:
                            completeMessages,

                        createdAt:
                            FieldValue.serverTimestamp()

                    });


            console.log(
                "Journal saved successfully:",
                journalRef.id
            );


            // ------------------------------------------------
            // SEND RESPONSE
            // ------------------------------------------------

            res.json({

                response:
                    reply.trim(),

                journalId:
                    journalRef.id

            });

        } catch (error) {

            console.error(
                "Chat error:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to process your request."
            });

        }

    }
);


// ======================================================
// GET /api/journals
// ======================================================
//
// Returns journals ONLY for the
// authenticated Firebase user.
//
// ======================================================

app.get(
    "/api/journals",
    authenticateUser,
    async (req, res) => {

        try {

            const uid =
                req.user.uid;

            console.log(
                "Loading journals for UID:",
                uid
            );


            const snapshot =
                await db

                    .collection("users")

                    .doc(uid)

                    .collection("journal")

                    .orderBy(
                        "createdAt",
                        "desc"
                    )

                    .get();


            const journals = [];


            snapshot.forEach(
                (doc) => {

                    journals.push({

                        id:
                            doc.id,

                        ...doc.data()

                    });

                }
            );


            console.log(
                "Journals found:",
                journals.length
            );


            res.json({

                journals:
                    journals

            });

        } catch (error) {

            console.error(
                "Journal retrieval error:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to retrieve journals."
            });

        }

    }
);


// ======================================================
// GET /api/journals/:journalId
// ======================================================
//
// Returns ONE journal belonging ONLY
// to the authenticated user.
//
// ======================================================

app.get(
    "/api/journals/:journalId",
    authenticateUser,
    async (req, res) => {

        try {

            const uid =
                req.user.uid;

            const journalId =
                req.params.journalId;


            const journalDoc =
                await db

                    .collection("users")

                    .doc(uid)

                    .collection("journal")

                    .doc(journalId)

                    .get();


            if (
                !journalDoc.exists
            ) {

                return res.status(404).json({
                    error:
                        "Journal not found."
                });

            }


            res.json({

                id:
                    journalDoc.id,

                ...journalDoc.data()

            });

        } catch (error) {

            console.error(
                "Single journal error:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to retrieve journal."
            });

        }

    }
);


// ======================================================
// SERVER START
// ======================================================
//
// IMPORTANT FOR CLOUD RUN:
// 0.0.0.0 allows the container to receive
// external traffic.
//
// PORT is supplied by Cloud Run.
// Locally it defaults to 8080.
//
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "================================="
        );

        console.log(
            "Personal Gemini Journal"
        );

        console.log(
            "================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Open http://localhost:${PORT}`
        );

        console.log(
            "Cloud Run compatible: listening on 0.0.0.0"
        );

    }
);