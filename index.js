const production = (process.env["NODE_ENV"] == "production");

const express = require("express");
const app = express();
const router = require('./router.js');

const ws = require("ws");
const game = require("./game.js")

const http = require("http");
const https = require("https");
const fs = require("fs");

if(production) app.use((req, res, next) => {
    if(req.secure || req.query?.http != undefined) return next();
    res.redirect("https://manne.dev" + req.originalUrl);
});

app.use(express.static("static"))
app.use(router);

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', game.join);

const connectToWsServer = httpServer => httpServer.on('upgrade', (request, socket, head) => {
    if(request.url != "/game") return
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});

if(production){
    const httpsOptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/manne.dev/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/manne.dev/fullchain.pem'),
    };

    connectToWsServer(https.createServer(httpsOptions, app).listen(443));
}

connectToWsServer(http.createServer(app).listen(production ? 80 : 8080));


  
console.log("Server Started");