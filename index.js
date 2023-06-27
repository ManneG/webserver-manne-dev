const production = (process.env["NODE_ENV"] == "production");

const express = require("express");
const app = express();

const http = require("http");
const https = require("https");
const fs = require("fs");

if(production) app.use((req, res, next) => {
    if(req.secure || req.query?.http != undefined) return next();
    res.redirect("https://manne.dev" + req.originalUrl);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/homepage.html");
});

app.get("/info",(req, res) => {
    res.end(`You are (${req.ip}) visiting ${req.hostname} using ${req.protocol}.`);
});

if(production){
    const httpsOptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/manne.dev/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/manne.dev/fullchain.pem'),
    };

    https.createServer(httpsOptions, app).listen(443);
}

http.createServer(app).listen(production ? 80 : 8080);
  
console.log("Server Started");