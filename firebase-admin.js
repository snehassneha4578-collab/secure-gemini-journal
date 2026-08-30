// ======================================================
// FIREBASE ADMIN - BACKEND
// ======================================================

const path = require("path");


// ======================================================
// FIREBASE ADMIN IMPORTS
// ======================================================

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
// SERVICE ACCOUNT
// ======================================================

const serviceAccount =
    require(
        path.join(
            __dirname,
            "serviceAccountKey.json"
        )
    );


// ======================================================
// INITIALIZE FIREBASE ADMIN
// ======================================================

let app;

if (getApps().length === 0) {

    app = initializeApp({
        credential: cert(serviceAccount)
    });

} else {

    app = getApps()[0];

}


// ======================================================
// FIREBASE SERVICES
// ======================================================

const auth =
    getAuth(app);

const db =
    getFirestore(app);


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    app,
    auth,
    db
};