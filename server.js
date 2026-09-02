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
// GEMINI API
// ======================================================

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {

    console.error(
        "ERROR: GEMINI_API_KEY is missing."
    );

} else {

    console.log(
        "Gemini API key loaded successfully."
    );

}

const ai = new GoogleGenAI({
    apiKey: geminiApiKey
});


// ======================================================
// SERVE FRONTEND
// ======================================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ======================================================
// HOME PAGE
// ======================================================

app.get("/", (req, res) => {

    const indexPath =
        path.join(
            __dirname,
            "public",
            "index.html"
        );

    res.sendFile(indexPath);

});


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/health", (req, res) => {

    res.status(200).json({

        status: "healthy",

        message: "Backend is working"

    });

});


// ======================================================
// FIREBASE AUTHENTICATION MIDDLEWARE
// ======================================================

async function authenticateUser(req, res, next) {

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
        // GET TOKEN
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
        // VERIFY FIREBASE ID TOKEN
        // ------------------------------------------------

        const decodedToken =
            await auth.verifyIdToken(idToken);


        // ------------------------------------------------
        // STORE VERIFIED USER
        // ------------------------------------------------

        req.user =
            decodedToken;


        console.log(
            "Authenticated UID:",
            decodedToken.uid
        );


        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );

        return res.status(401).json({

            error:
                "Invalid or expired authentication token."

        });

    }

}


// ======================================================
// GEMINI CHAT - MULTI TURN
// ======================================================

app.post(
    "/api/chat",
    authenticateUser,
    async (req, res) => {

        console.log(
            "Gemini request received."
        );

        try {

            // --------------------------------------------
            // CHECK GEMINI API KEY
            // --------------------------------------------

            if (!geminiApiKey) {

                return res.status(500).json({

                    error:
                        "GEMINI_API_KEY is missing."

                });

            }


            // --------------------------------------------
            // GET MESSAGES
            // --------------------------------------------

            const {
                messages
            } = req.body;


            if (
                !Array.isArray(messages) ||
                messages.length === 0
            ) {

                return res.status(400).json({

                    error:
                        "No messages were provided."

                });

            }


            // --------------------------------------------
            // CLEAN MESSAGE HISTORY
            // --------------------------------------------

            const cleanMessages =
                messages
                    .filter((message) => {

                        return (
                            message &&
                            (
                                message.role === "user" ||
                                message.role === "model"
                            ) &&
                            typeof message.text === "string" &&
                            message.text.trim()
                        );

                    })
                    .map((message) => {

                        return {

                            role:
                                message.role,

                            text:
                                message.text.trim()

                        };

                    });


            if (
                cleanMessages.length === 0
            ) {

                return res.status(400).json({

                    error:
                        "Conversation is empty."

                });

            }


            console.log(
                "Conversation messages:",
                cleanMessages.length
            );


            // --------------------------------------------
            // CONVERT TO GEMINI FORMAT
            // --------------------------------------------

            const contents =
                cleanMessages.map((message) => {

                    return {

                        role:
                            message.role,

                        parts: [

                            {
                                text:
                                    message.text
                            }

                        ]

                    };

                });


            // --------------------------------------------
            // CALL GEMINI
            // --------------------------------------------

            const response =
                await ai.models.generateContent({

                    model:
                        "gemini-2.5-flash",

                    contents:
                        contents

                });


            // --------------------------------------------
            // GET RESPONSE
            // --------------------------------------------

            const reply =
                response.text;


            if (
                !reply ||
                !reply.trim()
            ) {

                return res.status(500).json({

                    error:
                        "Gemini returned an empty response."

                });

            }


            console.log(
                "Gemini response received."
            );


            // --------------------------------------------
            // SAVE COMPLETE CONVERSATION
            // --------------------------------------------

            const completeMessages = [

                ...cleanMessages,

                {

                    role:
                        "model",

                    text:
                        reply.trim()

                }

            ];


            // --------------------------------------------
            // SAVE JOURNAL TO FIRESTORE
            // --------------------------------------------

            const uid =
                req.user.uid;


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
                "Journal saved:",
                journalRef.id
            );


            // --------------------------------------------
            // RETURN RESPONSE
            // --------------------------------------------

            return res.json({

                response:
                    reply.trim(),

                journalId:
                    journalRef.id

            });

        } catch (error) {

            console.error(
                "================================="
            );

            console.error(
                "CHAT ERROR"
            );

            console.error(
                error
            );

            console.error(
                "================================="
            );


            return res.status(500).json({

                error:
                    error.message ||
                    "Failed to process your request."

            });

        }

    }
);


// ======================================================
// GET JOURNALS
// ======================================================
// Supports:
// /api/journals
// /api/journal
// ======================================================

async function getJournals(req, res) {

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


        snapshot.forEach((doc) => {

            const data =
                doc.data();


            journals.push({

                id:
                    doc.id,

                ...data

            });

        });


        console.log(
            "Journals found:",
            journals.length
        );


        return res.json({

            journals:
                journals

        });

    } catch (error) {

        console.error(
            "Journal retrieval error:",
            error
        );


        return res.status(500).json({

            error:
                "Failed to retrieve journals."

        });

    }

}


// ======================================================
// GET JOURNALS - BOTH ROUTES
// ======================================================

app.get(
    "/api/journals",
    authenticateUser,
    getJournals
);

app.get(
    "/api/journal",
    authenticateUser,
    getJournals
);


// ======================================================
// GET SINGLE JOURNAL
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


            return res.json({

                id:
                    journalDoc.id,

                ...journalDoc.data()

            });

        } catch (error) {

            console.error(
                "Single journal error:",
                error
            );


            return res.status(500).json({

                error:
                    "Failed to retrieve journal."

            });

        }

    }
);


// ======================================================
// GET SINGLE JOURNAL
// Also support /api/journal/:journalId
// ======================================================

app.get(
    "/api/journal/:journalId",
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


            return res.json({

                id:
                    journalDoc.id,

                ...journalDoc.data()

            });

        } catch (error) {

            console.error(
                "Single journal error:",
                error
            );


            return res.status(500).json({

                error:
                    "Failed to retrieve journal."

            });

        }

    }
);


// ======================================================
// DELETE JOURNAL
// ======================================================

async function deleteJournal(req, res) {

    try {

        const uid =
            req.user.uid;


        const journalId =
            req.params.journalId;


        await db

            .collection("users")

            .doc(uid)

            .collection("journal")

            .doc(journalId)

            .delete();


        console.log(
            "Journal deleted:",
            journalId
        );


        return res.json({

            success:
                true,

            message:
                "Journal deleted successfully."

        });

    } catch (error) {

        console.error(
            "Journal deletion error:",
            error
        );


        return res.status(500).json({

            error:
                "Failed to delete journal."

        });

    }

}


app.delete(
    "/api/journals/:journalId",
    authenticateUser,
    deleteJournal
);

app.delete(
    "/api/journal/:journalId",
    authenticateUser,
    deleteJournal
);


// ======================================================
// 404 API HANDLER
// ======================================================

app.use(
    "/api",
    (req, res) => {

        return res.status(404).json({

            error:
                "API endpoint not found."

        });

    }
);


// ======================================================
// START SERVER
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
            "Backend listening on 0.0.0.0"
        );

        console.log(
            "================================="
        );

    }
);
