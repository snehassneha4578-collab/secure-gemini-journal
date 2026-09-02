//
// FIREBASE ADMIN - BACKEND
// Render-compatible secure configuration
//

const {
    initializeApp,
    cert,
    getApps
} = require("firebase-admin/app");

const {
    getAuth
} = require("firebase-admin/auth");

const {
    getFirestore
} = require("firebase-admin/firestore");


// ======================================================
// CHECK REQUIRED ENVIRONMENT VARIABLES
// ======================================================

const projectId =
    process.env.FIREBASE_PROJECT_ID;

const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL;

const privateKey =
    process.env.FIREBASE_PRIVATE_KEY;


// ======================================================
// VALIDATE CONFIGURATION
// ======================================================

if (
    !projectId ||
    !clientEmail ||
    !privateKey
) {

    console.error(
        "Firebase Admin configuration is missing."
    );

    console.error(
        "Required environment variables:"
    );

    console.error(
        "FIREBASE_PROJECT_ID"
    );

    console.error(
        "FIREBASE_CLIENT_EMAIL"
    );

    console.error(
        "FIREBASE_PRIVATE_KEY"
    );

    throw new Error(
        "Firebase Admin environment variables are missing."
    );
}


// ======================================================
// FIX PRIVATE KEY FORMAT
// ======================================================

const formattedPrivateKey =
    privateKey.replace(
        /\\n/g,
        "\n"
    );


// ======================================================
// FIREBASE ADMIN CONFIGURATION
// ======================================================

const firebaseConfig = {

    projectId:
        projectId,

    clientEmail:
        clientEmail,

    privateKey:
        formattedPrivateKey
};


// ======================================================
// INITIALIZE FIREBASE ADMIN
// ======================================================

let app;

if (getApps().length === 0) {

    app = initializeApp({

        credential:
            cert(firebaseConfig)
    });

} else {

    app =
        getApps()[0];
}


// ======================================================
// FIREBASE SERVICES
// ======================================================

const auth =
    getAuth(app);

const db =
    getFirestore(app);


// ======================================================
// STARTUP MESSAGE
// ======================================================

console.log(
    "Firebase Admin initialized successfully."
);

console.log(
    "Firebase project:",
    projectId
);


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    app,

    auth,

    db
};