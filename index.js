const production = (process.env["NODE_ENV"] == "production");

const express = require("express");
const app = express();
const router = require('./router.js');

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require('path')

if(production) app.use((req, res, next) => {
    if(req.secure || req.query?.http != undefined) return next();
    res.redirect("https://manne.dev" + req.originalUrl);
});

app.use(express.static(path.join(__dirname, "public")))
app.use(router);

if(production){
    const httpsOptions = {
        key: fs.readFileSync("/etc/letsencrypt/live/manne.dev/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/manne.dev/fullchain.pem"),
    };

    https.createServer(httpsOptions, app).listen(443);
}

http.createServer(app).listen(production ? 80 : 8080);
  
console.log("Server Started");