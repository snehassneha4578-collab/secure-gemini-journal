const express = require("express");

const app = express();

const PORT = 8080;


// ======================================================
// TEST ROUTE
// ======================================================

app.get("/api/test", (req, res) => {

    console.log("TEST ROUTE CALLED");

    res.json({
        success: true,
        message: "TEST SERVER IS WORKING"
    });

});


// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {

    res.send(
        "Personal Gemini Journal TEST SERVER"
    );

});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, "127.0.0.1", () => {

    console.log("=================================");
    console.log("TEST SERVER STARTED");
    console.log(`http://127.0.0.1:${PORT}`);
    console.log("=================================");

});