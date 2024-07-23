import express from "express";
import ViteExpress from "vite-express";
import http from "http";
import { Server, Socket } from "socket.io";
import { spawn } from "child_process";
import readline from "readline";


const GPIO_RELAY_PIN = 536;

const app = express();
const httpServer = new http.Server(app);
const io = new Server(httpServer);

const getFrame = (callback: (data: Buffer) => void) => {
    const proc = spawn("python3", ["./camera.py"]);
    proc.stderr.on("data", (err) => console.error(err.toString()))
    const line = readline.createInterface({ input: proc.stdout });
    line.on("line", callback);
}

let interval: NodeJS.Timeout | null = null;

const startCamera = () => {
    if (!interval) {
        interval = setInterval(() => {
            getFrame((data) => {
                io.to("video").emit("image", data.toString());
            });
        }, 1000);
    }
}

const stopCamera = () => {
    console.log("Camera stopping!");
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}


io.on("connection", (socket: Socket) => {
    console.log("New connection", socket.rooms);
    socket.join("video");
    startCamera();

    socket.on("disconnecting", () => {
        const size = io.of("/").adapter.rooms.get("video")?.size || 1;
        if (size <= 1) {
            stopCamera();
        }
    });
});

let relayTimeout = null;

app.post("/relay", (_, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (relayTimeout) {
        res.send({ "ok": false });
        return;
    }
    try {
        var Gpio = require("onoff").Gpio;
        var trigger = new Gpio(GPIO_RELAY_PIN, "out");

        trigger.writeSync(1);

        relayTimeout = setTimeout(() => {
            trigger.writeSync(0);
            trigger.unexport();
	    relayTimeout = null;
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
    res.send({ "ok": !relayTimeout });
});

ViteExpress.bind(app, httpServer);
httpServer.listen(3000, () =>
    console.log("Server is listening on port 3000..."),
);
