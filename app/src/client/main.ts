import io from "socket.io-client";
import "./style.css";

type ToastCmd = (
    message: string, status?: "success" | "info" | "error",
    duration?: number
) => void;

type ButtonDataset = {
    processing: boolean;
}

type ActionButton = {
    dataset: ButtonDataset;
} & HTMLButtonElement;

type RunActionCmd = (
    btnRef: ActionButton,
    cmdString: string,
    cmdFunc: Function
) => Promise<void>;

type ThisWindow = {
    toastMessage: ToastCmd;
} & Window & typeof globalThis;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <h1>Garage Door Access Control</h1>
  <div class="row">
      <img id="video" class="camera" src="/video" onerror="this.src='images/videoerror.png'">
  </div>
  <div class="row">
      <button id="open-door-btn" class="action-btn">Trigger Door</button>
  </div>
`;

const openDoorButton = document.getElementById("open-door-btn") as ActionButton;
const toastContainer = document.getElementById("toast-container") as HTMLElement;

var actionButtonsEnabled = false;


const toastMessage: ToastCmd = (message, status = "info", duration = 2000) => {
    const toastElement = document.createElement("span");
    toastElement.classList.add(status);
    toastElement.innerText = message;
    toastElement.style.opacity = "0";
    toastContainer.appendChild(toastElement);

    // hack to trigger reflow and css animation
    toastElement.getBoundingClientRect();
    toastElement.style.opacity = "1";

    setTimeout(() => {
        toastContainer.removeChild(toastElement)
    }, duration)
}

const runAction: RunActionCmd = async (btnRef, cmdString, cmdFunc) => {
    let initialValue = btnRef.value;
    btnRef.dataset.processing = true;
    btnRef.disabled = true;
    btnRef.value = cmdString;

    cmdFunc().then(() => {
        // Success response.
        btnRef.dataset.processing = false;
        btnRef.disabled = false;
        btnRef.value = initialValue;
    }).catch(() => {
        // Error response.
        btnRef.dataset.processing = false;
        btnRef.disabled = false;
        btnRef.value = initialValue;
    });
}

const actionOpenDoor = async () => {
    // Send the API request to open the door.

    let result = false

    try {
        const response = await fetch("/relay", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();

        result = (data && data.ok) === true;

        if (result) {
            toastMessage("Open / close command succeeded", "success");
        } else {
            toastMessage("Open / close command failed", "error");
        }

    } catch (e) {
        toastMessage("Failed to send command to the garage door", "error");
    }


    return result;
}

const checkServer = async () => {
    // send the API request to check status

    let ok = false

    try {
        const res = await fetch("/readycheck")
            .then(request => request.json())
            .catch((e) => console.log("Readycheck error", e));

        actionButtonEnable(res?.ok || false, true)

    } catch (e) {
        console.log("Readycheck status error", e);
    }

    return ok;
}

const actionButtonEnable = (val: boolean, skipToast = false) => {
    // enable or disable the action buttons on the page
    for (let btn of document.getElementsByClassName("action-btn") as HTMLCollectionOf<ActionButton>) {
        if (!btn.dataset.processing) {
            btn.disabled = !val
        }
    }

    if (!skipToast) {
        if (actionButtonsEnabled && !val) toastMessage("Controls are disabled, server is offline", "error")
        if (!actionButtonsEnabled && val) toastMessage("Controls re-enabled, server is online", "info")
    }
    actionButtonsEnabled = val
}

const socket = io();

socket.on("connect", () => console.log("Websocket connect"));
socket.on("disconnect", () => console.log("Websocket disconnect"));
socket.on("connect_error", () => console.log("Websocket connect_error"));

// listening to the image event in index.js 
socket.on('image', (data: string)=>{ 
    // Now we are getting the image and  
    // displaying it via img tag 
    const imageEle = document.getElementById('video') as HTMLImageElement; 
    imageEle.src = `data:image/jpeg;base64,${data}`; 
}); 

/**
 * When content is loaded, set the button click listeners and start the
 * recurring scripts.
 */
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Page ready");

    openDoorButton.addEventListener("click", () =>
        runAction(openDoorButton, "Opening Door", actionOpenDoor));

    // Enable the open door button if the server is ready
    await checkServer();
    // setTimeout(checkServer, 2000);

});

(window as ThisWindow).toastMessage = toastMessage;
window.checkServer = checkServer;