const express = require("express");
const app = express();

const gameSocket = require("./routes/gameSockets");

app.use(express.static('public'));
app.set("view engine", "ejs");

app.get("/game", (req, res) => {
    res.render("index");
});

// app.use("/Socket", gameSocket);

module.exports = app;