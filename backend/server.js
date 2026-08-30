const express = require("express");
const cors = require("cors");
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


/* =========================================
   EXPRESS APP
========================================= */

const app = express();

app.use(cors());

app.use(express.json());


/* =========================================
   FIREBASE ADMIN
========================================= */

initializeApp();

const auth = getAuth();

const db = getFirestore();


/* =========================================
   GEMINI
========================================= */

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


/* =========================================
   AUTHENTICATION MIDDLEWARE
========================================= */

async function authenticateUser(
    req,
    res,
    next
) {

    try {

        const authHeader =
            req.headers.authorization;


        /* CHECK AUTHORIZATION HEADER */

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                error:
                    "Authentication token required."

            });

        }


        /* EXTRACT FIREBASE ID TOKEN */

        const idToken =
            authHeader.substring(7);


        if (!idToken) {

            return res.status(401).json({

                error:
                    "Authentication token missing."

            });

        }


        /* VERIFY TOKEN */

        const decodedToken =
            await auth.verifyIdToken(
                idToken
            );


        /* STORE VERIFIED USER */

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
            error
        );

        return res.status(401).json({

            error:
                "Invalid authentication token."

        });

    }

}


/* =========================================
   HOME / HEALTH CHECK
========================================= */

app.get(
    "/",
    (req, res) => {

        res.send(`

<!DOCTYPE html>

<html>

<head>

    <title>
        Personal Gemini Journal
    </title>

    <style>

        body {

            font-family:
                Arial, sans-serif;

            text-align:
                center;

            margin-top:
                100px;

            background:
                #f5f7fb;

        }

        h1 {

            color:
                #333;

        }

        .status {

            display:
                inline-block;

            padding:
                15px 25px;

            background:
                #e8f5e9;

            color:
                #2e7d32;

            border-radius:
                10px;

            font-size:
                18px;

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
        Port: ${process.env.PORT || 8080}
    </p>

    <p>
        Firebase + Gemini + Firestore connected.
    </p>

    <p>
        Day 13 — Persistent Multi-Turn Journal
    </p>

</body>

</html>

        `);

    }
);


/* =========================================
   CHAT WITH GEMINI
   POST /api/chat
========================================= */

app.post(
    "/api/chat",
    authenticateUser,
    async (req, res) => {

        try {

            /* VERIFIED USER UID */

            const uid =
                req.user.uid;


            /* REQUEST DATA */

            const {
                message,
                history = []
            } = req.body;


            /* VALIDATE MESSAGE */

            if (
                !message ||
                typeof message !== "string" ||
                !message.trim()
            ) {

                return res.status(400).json({

                    error:
                        "Message is required."

                });

            }


            /* VALIDATE HISTORY */

            if (
                !Array.isArray(history)
            ) {

                return res.status(400).json({

                    error:
                        "History must be an array."

                });

            }


            console.log(
                "Processing message for UID:",
                uid
            );


            /* =================================
               PREPARE GEMINI HISTORY
            ================================= */

            const contents = [];


            history.forEach(
                (item) => {

                    if (
                        item &&
                        (
                            item.role === "user" ||
                            item.role === "model"
                        ) &&
                        typeof item.text === "string" &&
                        item.text.trim()
                    ) {

                        contents.push({

                            role:
                                item.role,

                            parts: [
                                {
                                    text:
                                        item.text
                                }
                            ]

                        });

                    }

                }
            );


            /* =================================
               CURRENT USER MESSAGE
            ================================= */

            contents.push({

                role:
                    "user",

                parts: [
                    {
                        text:
                            message.trim()
                    }
                ]

            });


            /* =================================
               SEND TO GEMINI
            ================================= */

            const response =
                await ai.models.generateContent({

                    model:
                        "gemini-2.5-flash",

                    contents:
                        contents

                });


            const reply =
                response.text;


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


            /* =================================
               RESPONSE
            ================================= */

            res.json({

                success:
                    true,

                reply:
                    reply,

                uid:
                    uid

            });

        } catch (error) {

            console.error(
                "Chat error:",
                error
            );

            res.status(500).json({

                success:
                    false,

                error:
                    "Gemini request failed."

            });

        }

    }
);


/* =========================================
   CREATE NEW JOURNAL
   POST /api/journals
========================================= */

app.post(
    "/api/journals",
    authenticateUser,
    async (req, res) => {

        try {

            const uid =
                req.user.uid;


            const {
                title = "Untitled Journal",
                messages = []
            } = req.body;


            /* VALIDATE MESSAGES */

            if (
                !Array.isArray(messages)
            ) {

                return res.status(400).json({

                    error:
                        "Messages must be an array."

                });

            }


            /* =================================
               CREATE JOURNAL REFERENCE
            ================================= */

            const journalRef =
                db
                    .collection("users")
                    .doc(uid)
                    .collection("journals")
                    .doc();


            /* =================================
               SAVE JOURNAL
            ================================= */

            await journalRef.set({

                userId:
                    uid,

                title:
                    typeof title === "string" &&
                    title.trim()
                        ? title.trim()
                        : "Untitled Journal",

                messages:
                    messages,

                createdAt:
                    FieldValue.serverTimestamp(),

                updatedAt:
                    FieldValue.serverTimestamp()

            });


            console.log(
                "Journal created:",
                journalRef.id
            );


            res.status(201).json({

                success:
                    true,

                journalId:
                    journalRef.id,

                message:
                    "Journal created successfully."

            });

        } catch (error) {

            console.error(
                "Create journal error:",
                error
            );

            res.status(500).json({

                success:
                    false,

                error:
                    "Failed to create journal."

            });

        }

    }
);


/* =========================================
   UPDATE EXISTING JOURNAL
   PUT /api/journals/:journalId
========================================= */

app.put(
    "/api/journals/:journalId",
    authenticateUser,
    async (req, res) => {

        try {

            const uid =
                req.user.uid;


            const journalId =
                req.params.journalId;


            const {
                title,
                messages
            } = req.body;


            /* VALIDATE JOURNAL ID */

            if (
                !journalId ||
                typeof journalId !== "string"
            ) {

                return res.status(400).json({

                    error:
                        "Journal ID is required."

                });

            }


            /* VALIDATE MESSAGES */

            if (
                messages !== undefined &&
                !Array.isArray(messages)
            ) {

                return res.status(400).json({

                    error:
                        "Messages must be an array."

                });

            }


            /* =================================
               USER-SPECIFIC JOURNAL REFERENCE
            ================================= */

            const journalRef =
                db
                    .collection("users")
                    .doc(uid)
                    .collection("journals")
                    .doc(journalId);


            /* =================================
               CHECK JOURNAL EXISTS
            ================================= */

            const journalDoc =
                await journalRef.get();


            if (!journalDoc.exists) {

                return res.status(404).json({

                    error:
                        "Journal not found."

                });

            }


            /* =================================
               UPDATE DATA
            ================================= */

            const updateData = {

                updatedAt:
                    FieldValue.serverTimestamp()

            };


            if (
                typeof title === "string" &&
                title.trim()
            ) {

                updateData.title =
                    title.trim();

            }


            if (
                Array.isArray(messages)
            ) {

                updateData.messages =
                    messages;

            }


            await journalRef.update(
                updateData
            );


            console.log(
                "Journal updated:",
                journalId
            );


            res.json({

                success:
                    true,

                message:
                    "Journal updated successfully."

            });

        } catch (error) {

            console.error(
                "Update journal error:",
                error
            );

            res.status(500).json({

                success:
                    false,

                error:
                    "Failed to update journal."

            });

        }

    }
);


/* =========================================
   GET ALL USER JOURNALS
   GET /api/journals
========================================= */

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


            /* =================================
               USER-SPECIFIC COLLECTION
            ================================= */

            const snapshot =
                await db
                    .collection("users")
                    .doc(uid)
                    .collection("journals")
                    .orderBy(
                        "updatedAt",
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

                success:
                    true,

                journals:
                    journals

            });

        } catch (error) {

            console.error(
                "Journal retrieval error:",
                error
            );

            res.status(500).json({

                success:
                    false,

                error:
                    "Failed to retrieve journals."

            });

        }

    }
);


/* =========================================
   GET SINGLE JOURNAL
   GET /api/journals/:journalId
========================================= */

app.get(
    "/api/journals/:journalId",
    authenticateUser,
    async (req, res) => {

        try {

            const uid =
                req.user.uid;


            const journalId =
                req.params.journalId;


            /* =================================
               USER-SPECIFIC JOURNAL
            ================================= */

            const journalRef =
                db
                    .collection("users")
                    .doc(uid)
                    .collection("journals")
                    .doc(journalId);


            const journalDoc =
                await journalRef.get();


            /* =================================
               JOURNAL NOT FOUND
            ================================= */

            if (
                !journalDoc.exists
            ) {

                return res.status(404).json({

                    error:
                        "Journal not found."

                });

            }


            /* =================================
               RETURN JOURNAL
            ================================= */

            res.json({

                success:
                    true,

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

                success:
                    false,

                error:
                    "Failed to load journal."

            });

        }

    }
);


/* =========================================
   DELETE JOURNAL
   DELETE /api/journals/:journalId
========================================= */

app.delete(
    "/api/journals/:journalId",
    authenticateUser,
    async (req, res) => {

        try {

            const uid =
                req.user.uid;


            const journalId =
                req.params.journalId;


            const journalRef =
                db
                    .collection("users")
                    .doc(uid)
                    .collection("journals")
                    .doc(journalId);


            const journalDoc =
                await journalRef.get();


            if (
                !journalDoc.exists
            ) {

                return res.status(404).json({

                    error:
                        "Journal not found."

                });

            }


            await journalRef.delete();


            console.log(
                "Journal deleted:",
                journalId
            );


            res.json({

                success:
                    true,

                message:
                    "Journal deleted successfully."

            });

        } catch (error) {

            console.error(
                "Delete journal error:",
                error
            );

            res.status(500).json({

                success:
                    false,

                error:
                    "Failed to delete journal."

            });

        }

    }
);


/* =========================================
   404 HANDLER
========================================= */

app.use(
    (req, res) => {

        res.status(404).json({

            error:
                "API endpoint not found."

        });

    }
);


/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use(
    (error, req, res, next) => {

        console.error(
            "Unhandled server error:",
            error
        );

        res.status(500).json({

            error:
                "Internal server error."

        });

    }
);


/* =========================================
   SERVER
========================================= */

const PORT =
    process.env.PORT || 8080;


app.listen(
    PORT,
    "127.0.0.1",
    () => {

        console.log(
            "================================="
        );

        console.log(
            "PERSONAL GEMINI JOURNAL"
        );

        console.log(
            "DAY 13 — PERSISTENT CHAT"
        );

        console.log(
            "================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Open http://127.0.0.1:${PORT}`
        );

        console.log(
            "Firebase Authentication: READY"
        );

        console.log(
            "Gemini API: READY"
        );

        console.log(
            "Firestore: READY"
        );

        console.log(
            "Multi-turn Chat: READY"
        );

        console.log(
            "Persistent Journals: READY"
        );

    }
);