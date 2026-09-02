// ======================================================
// PERSONAL GEMINI JOURNAL - BACKEND
// ======================================================

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

// ======================================================
// FIREBASE ADMIN
// ======================================================

const {
    auth,
    db
} = require("./firebase-admin");

const {
    FieldValue
} = require("firebase-admin/firestore");

// ======================================================
// EXPRESS APP
// ======================================================

const app = express();

// ======================================================
// PORT
// ======================================================

const PORT =
    process.env.PORT || 8080;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(
    express.json({
        limit: "1mb"
    })
);

// ======================================================
// GEMINI API
// ======================================================

const geminiApiKey =
    process.env.GEMINI_API_KEY;

if (!geminiApiKey) {

    console.error(
        "ERROR: GEMINI_API_KEY is missing."
    );

} else {

    console.log(
        "Gemini API key loaded successfully."
    );

}

const ai =
    new GoogleGenAI({
        apiKey: geminiApiKey
    });

// ======================================================
// GEMINI MODEL CONFIGURATION
// ======================================================
//
// Primary model:
//   Gemini 3.6 Flash
//
// Fallback models:
//   Gemini 3.5 Flash-Lite
//   Gemini 3.1 Flash-Lite
//
// This protects the app from temporary 503/high-demand
// errors.
//
// ======================================================

const GEMINI_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite"
];

// ======================================================
// GEMINI RETRY SETTINGS
// ======================================================

const GEMINI_RETRIES_PER_MODEL = 2;

const GEMINI_RETRY_DELAY_MS = 1500;

// ======================================================
// DELAY HELPER
// ======================================================

function sleep(
    milliseconds
) {

    return new Promise(
        (resolve) => {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}

// ======================================================
// CHECK GEMINI 503 / TEMPORARY ERROR
// ======================================================

function isTemporaryGeminiError(
    error
) {

    if (!error) {

        return false;

    }

    const status =
        Number(
            error.status ||
            error.code ||
            error?.response?.status ||
            0
        );

    const message =
        String(
            error.message ||
            error
        ).toLowerCase();

    return (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        message.includes(
            "503"
        ) ||
        message.includes(
            "unavailable"
        ) ||
        message.includes(
            "high demand"
        ) ||
        message.includes(
            "overloaded"
        ) ||
        message.includes(
            "temporarily"
        )
    );

}

// ======================================================
// GEMINI REQUEST WITH RETRY + FALLBACK
// ======================================================

async function generateGeminiResponse(
    contents
) {

    let lastError =
        null;


    for (
        let modelIndex = 0;
        modelIndex < GEMINI_MODELS.length;
        modelIndex++
    ) {

        const model =
            GEMINI_MODELS[
                modelIndex
            ];


        for (
            let attempt = 1;
            attempt <= GEMINI_RETRIES_PER_MODEL;
            attempt++
        ) {

            try {

                console.log(
                    `Gemini model: ${model} | attempt ${attempt}/${GEMINI_RETRIES_PER_MODEL}`
                );


                const response =
                    await ai.models.generateContent({

                        model:
                            model,

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
                    `Gemini response received from ${model}.`
                );


                return {

                    reply:
                        reply.trim(),

                    model:
                        model

                };

            } catch (error) {

                lastError =
                    error;


                console.error(
                    `Gemini error using ${model}, attempt ${attempt}:`,
                    error.message ||
                    error
                );


                if (
                    !isTemporaryGeminiError(
                        error
                    )
                ) {

                    throw error;

                }


                if (
                    attempt <
                    GEMINI_RETRIES_PER_MODEL
                ) {

                    console.log(
                        `Temporary Gemini error. Retrying ${model}...`
                    );

                    await sleep(
                        GEMINI_RETRY_DELAY_MS
                    );

                } else {

                    console.log(
                        `Model ${model} unavailable after retries.`
                    );

                }

            }

        }

    }


    throw (
        lastError ||
        new Error(
            "All Gemini models are temporarily unavailable."
        )
    );

}

// ======================================================
// SERVE FRONTEND
// ======================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);

// ======================================================
// HOME PAGE
// ======================================================

app.get(
    "/",
    (req, res) => {

        const indexPath =
            path.join(
                __dirname,
                "public",
                "index.html"
            );

        res.sendFile(
            indexPath
        );

    }
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
    "/health",
    (req, res) => {

        res.status(200).json({

            status:
                "healthy",

            message:
                "Backend is working",

            geminiModels:
                GEMINI_MODELS

        });

    }
);

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


        if (
            !authHeader ||
            !authHeader.startsWith(
                "Bearer "
            )
        ) {

            return res.status(401).json({

                error:
                    "Authentication token required."

            });

        }


        const idToken =
            authHeader.substring(
                7
            );


        if (!idToken) {

            return res.status(401).json({

                error:
                    "Authentication token is missing."

            });

        }


        const decodedToken =
            await auth.verifyIdToken(
                idToken
            );


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
// FIRESTORE VALUE SERIALIZER
// ======================================================
//
// Converts Firestore Timestamp and other values into
// safe JSON-friendly values.
//
// ======================================================

function serializeFirestoreValue(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return value;

    }


    if (
        typeof value ===
        "string"
    ) {

        return value;

    }


    if (
        typeof value ===
        "number" ||
        typeof value ===
        "boolean"
    ) {

        return value;

    }


    // Firestore Timestamp

    if (
        value &&
        typeof value.toDate ===
        "function"
    ) {

        return value
            .toDate()
            .toISOString();

    }


    if (
        Array.isArray(value)
    ) {

        return value.map(
            serializeFirestoreValue
        );

    }


    if (
        typeof value ===
        "object"
    ) {

        const result = {};

        Object.keys(
            value
        ).forEach(
            (key) => {

                result[key] =
                    serializeFirestoreValue(
                        value[key]
                    );

            }
        );

        return result;

    }


    return String(
        value
    );

}

// ======================================================
// NORMALIZE JOURNAL
// ======================================================
//
// Ensures every journal returned to the frontend has
// predictable string/array values.
//
// ======================================================

function normalizeJournal(
    doc
) {

    const data =
        doc.data() || {};


    let title =
        data.title;


    if (
        typeof title !==
        "string"
    ) {

        title =
            title === null ||
            title === undefined
                ? ""
                : String(title);

    }


    let content =
        data.content;


    if (
        typeof content !==
        "string"
    ) {

        if (
            content === null ||
            content === undefined
        ) {

            content =
                "";

        } else {

            content =
                String(content);

        }

    }


    let messages =
        Array.isArray(
            data.messages
        )
            ? data.messages
            : [];


    messages =
        messages
            .filter(
                (message) => {

                    return (
                        message &&
                        typeof message ===
                            "object"
                    );

                }
            )
            .map(
                (message) => {

                    return {

                        role:
                            message.role ===
                            "user"
                                ? "user"
                                : "model",

                        text:
                            typeof message.text ===
                            "string"
                                ? message.text
                                : String(
                                    message.text ||
                                    ""
                                )

                    };

                }
            );


    let mood =
        data.mood;


    if (
        mood !== null &&
        mood !== undefined &&
        typeof mood !== "string"
    ) {

        mood =
            String(mood);

    }


    return {

        id:
            doc.id,

        userId:
            typeof data.userId ===
            "string"
                ? data.userId
                : "",

        title:
            title,

        content:
            content,

        mood:
            mood || null,

        messages:
            messages,

        createdAt:
            serializeFirestoreValue(
                data.createdAt
            )

    };

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

            if (!geminiApiKey) {

                return res.status(500).json({

                    error:
                        "GEMINI_API_KEY is missing."

                });

            }


            const {
                messages
            } =
                req.body;


            if (
                !Array.isArray(messages) ||
                messages.length === 0
            ) {

                return res.status(400).json({

                    error:
                        "No messages were provided."

                });

            }


            // ==================================================
            // CLEAN MESSAGES
            // ==================================================

            const cleanMessages =
                messages
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
                                    "string" &&

                                message.text.trim()

                            );

                        }
                    )
                    .map(
                        (message) => {

                            return {

                                role:
                                    message.role,

                                text:
                                    message.text.trim()

                            };

                        }
                    );


            if (
                cleanMessages.length ===
                0
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


            // ==================================================
            // GEMINI CONTENT FORMAT
            // ==================================================

            const contents =
                cleanMessages.map(
                    (message) => {

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

                    }
                );


            // ==================================================
            // GEMINI REQUEST
            // ==================================================

            const geminiResult =
                await generateGeminiResponse(
                    contents
                );


            const reply =
                geminiResult.reply;


            const modelUsed =
                geminiResult.model;


            // ==================================================
            // COMPLETE CONVERSATION
            // ==================================================

            const completeMessages = [

                ...cleanMessages,

                {

                    role:
                        "model",

                    text:
                        reply

                }

            ];


            // ==================================================
            // SAVE CHAT TO FIRESTORE
            // ==================================================

            const uid =
                req.user.uid;


            const journalRef =
                await db

                    .collection(
                        "users"
                    )

                    .doc(
                        uid
                    )

                    .collection(
                        "journal"
                    )

                    .add({

                        userId:
                            uid,

                        title:
                            "Gemini Conversation",

                        content:
                            "",

                        messages:
                            completeMessages,

                        mood:
                            null,

                        createdAt:
                            FieldValue.serverTimestamp()

                    });


            console.log(
                "Journal saved:",
                journalRef.id
            );


            // ==================================================
            // SEND RESPONSE
            // ==================================================

            return res.json({

                response:
                    reply,

                journalId:
                    journalRef.id,

                model:
                    modelUsed

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


            const temporary =
                isTemporaryGeminiError(
                    error
                );


            if (temporary) {

                return res.status(503).json({

                    error:
                        "Gemini is temporarily busy. The available Gemini models are experiencing high demand. Please try again in a few seconds."

                });

            }


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

async function getJournals(
    req,
    res
) {

    try {

        const uid =
            req.user.uid;


        console.log(
            "Loading journals for UID:",
            uid
        );


        const snapshot =
            await db

                .collection(
                    "users"
                )

                .doc(
                    uid
                )

                .collection(
                    "journal"
                )

                .orderBy(
                    "createdAt",
                    "desc"
                )

                .get();


        const journals = [];


        snapshot.forEach(
            (doc) => {

                journals.push(
                    normalizeJournal(
                        doc
                    )
                );

            }
        );


        console.log(
            "Journals found:",
            journals.length
        );


        return res.json({

            journals:
                journals,

            count:
                journals.length

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

async function getSingleJournal(
    req,
    res
) {

    try {

        const uid =
            req.user.uid;


        const journalId =
            req.params.journalId;


        if (!journalId) {

            return res.status(400).json({

                error:
                    "Journal ID is required."

            });

        }


        const journalDoc =
            await db

                .collection(
                    "users"
                )

                .doc(
                    uid
                )

                .collection(
                    "journal"
                )

                .doc(
                    journalId
                )

                .get();


        if (
            !journalDoc.exists
        ) {

            return res.status(404).json({

                error:
                    "Journal not found."

            });

        }


        return res.json(
            normalizeJournal(
                journalDoc
            )
        );


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

// ======================================================
// GET SINGLE JOURNAL - BOTH ROUTES
// ======================================================

app.get(
    "/api/journals/:journalId",
    authenticateUser,
    getSingleJournal
);

app.get(
    "/api/journal/:journalId",
    authenticateUser,
    getSingleJournal
);

// ======================================================
// CREATE JOURNAL
// ======================================================

app.post(
    "/api/journal",
    authenticateUser,
    async (req, res) => {

        try {

            const uid =
                req.user.uid;


            const {
                title,
                content,
                mood,
                messages
            } =
                req.body;


            const hasContent =
                typeof content ===
                    "string" &&
                content.trim().length >
                    0;


            const hasMessages =
                Array.isArray(messages) &&
                messages.length >
                    0;


            if (
                !hasContent &&
                !hasMessages
            ) {

                return res.status(400).json({

                    error:
                        "Journal content is required."

                });

            }


            const journalData = {

                userId:
                    uid,

                title:
                    typeof title ===
                        "string" &&
                    title.trim()
                        ? title.trim()
                        : "Journal Entry",

                content:
                    typeof content ===
                        "string"
                        ? content
                        : "",

                mood:
                    typeof mood ===
                        "string"
                        ? mood
                        : null,

                createdAt:
                    FieldValue.serverTimestamp()

            };


            if (
                Array.isArray(
                    messages
                )
            ) {

                journalData.messages =
                    messages
                        .filter(
                            (message) => {

                                return (
                                    message &&
                                    typeof message ===
                                        "object"
                                );

                            }
                        )
                        .map(
                            (message) => {

                                return {

                                    role:
                                        message.role ===
                                        "user"
                                            ? "user"
                                            : "model",

                                    text:
                                        typeof message.text ===
                                            "string"
                                            ? message.text
                                            : String(
                                                message.text ||
                                                ""
                                            )

                                };

                            }
                        );

            }


            const journalRef =
                await db

                    .collection(
                        "users"
                    )

                    .doc(
                        uid
                    )

                    .collection(
                        "journal"
                    )

                    .add(
                        journalData
                    );


            console.log(
                "Manual journal saved:",
                journalRef.id
            );


            return res.status(201).json({

                success:
                    true,

                id:
                    journalRef.id,

                message:
                    "Journal saved successfully."

            });


        } catch (error) {

            console.error(
                "Journal creation error:",
                error
            );


            return res.status(500).json({

                error:
                    "Failed to save journal."

            });

        }

    }
);

// ======================================================
// DELETE JOURNAL
// ======================================================

async function deleteJournal(
    req,
    res
) {

    try {

        const uid =
            req.user.uid;


        const journalId =
            req.params.journalId;


        if (!journalId) {

            return res.status(400).json({

                error:
                    "Journal ID is required."

            });

        }


        const journalRef =
            db

                .collection(
                    "users"
                )

                .doc(
                    uid
                )

                .collection(
                    "journal"
                )

                .doc(
                    journalId
                );


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

// ======================================================
// DELETE JOURNAL - BOTH ROUTES
// ======================================================

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
// API 404 HANDLER
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
            "Gemini models configured:"
        );

        GEMINI_MODELS.forEach(
            (model) => {

                console.log(
                    " -",
                    model
                );

            }
        );

        console.log(
            "================================="
        );

    }
);