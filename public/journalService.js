import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    db,
    auth
} from "./firebase.js";


// ======================================================
// SAVE JOURNAL ENTRY
// ======================================================

export async function saveJournalEntry(
    text,
    aiResponse = ""
) {

    const user = auth.currentUser;


    // --------------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------------

    if (!user) {

        throw new Error(
            "Please login first."
        );

    }


    // --------------------------------------------------
    // JOURNAL COLLECTION
    // --------------------------------------------------

    const journalRef =
        collection(
            db,
            "users",
            user.uid,
            "journal"
        );


    // --------------------------------------------------
    // SAVE ENTRY
    // --------------------------------------------------

    const docRef =
        await addDoc(
            journalRef,
            {

                userId:
                    user.uid,

                text:
                    text,

                aiResponse:
                    aiResponse,

                createdAt:
                    serverTimestamp()

            }
        );


    // --------------------------------------------------
    // RETURN DOCUMENT ID
    // --------------------------------------------------

    return docRef.id;

}


// ======================================================
// GET JOURNAL ENTRIES
// ======================================================

export async function getJournalEntries() {

    const user =
        auth.currentUser;


    // --------------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------------

    if (!user) {

        throw new Error(
            "Please login first."
        );

    }


    // --------------------------------------------------
    // JOURNAL COLLECTION
    // --------------------------------------------------

    const journalRef =
        collection(
            db,
            "users",
            user.uid,
            "journal"
        );


    // --------------------------------------------------
    // SORT BY DATE
    // --------------------------------------------------

    const journalQuery =
        query(
            journalRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );


    // --------------------------------------------------
    // GET DATA
    // --------------------------------------------------

    const snapshot =
        await getDocs(
            journalQuery
        );


    // --------------------------------------------------
    // CONVERT FIRESTORE DATA
    // --------------------------------------------------

    return snapshot.docs.map(
        (doc) => ({

            id:
                doc.id,

            ...doc.data()

        })
    );

}