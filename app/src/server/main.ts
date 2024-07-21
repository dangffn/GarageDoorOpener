import express from "express";
import ViteExpress from "vite-express";
import cv from "opencv4nodejs";
import http from "http";
import { Server, Socket } from "socket.io";


const GPIO_RELAY_PIN = 18;

const app = express();
const httpServer = new http.Server(app);
const io = new Server(httpServer);

io.on("connection", (socket: Socket) => console.log("New connection", socket));

const wCap = new cv.VideoCapture(0);
wCap.set(cv.CAP_PROP_FRAME_WIDTH, 640); 
wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 480);

app.post("/relay", (_, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        var Gpio = require("onoff").Gpio;
        var trigger = new Gpio(GPIO_RELAY_PIN, "out");

        trigger.writeSync(1);

        setTimeout(() => {
            trigger.writeSync(0);
            trigger.unexport();
        }, 1000);
        console.log(`Successfully triggered relay`);
        res.send({ "ok": true });

    } catch (e) {
        console.error(`Error triggering relay (${e})`);
        res.send({ "ok": false });
    }
});

app.get("/readycheck", (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({ "ok": true });
});

setInterval(()=>{ 
    const frame = wCap.read(); 
    const image = cv.imencode('.jpg', frame).toString('base64'); 
    io.emit('image', image); 
}, 1000) 

ViteExpress.bind(app, httpServer);
httpServer.listen(3000, () =>
    console.log("Server is listening on port 3000..."),
);
