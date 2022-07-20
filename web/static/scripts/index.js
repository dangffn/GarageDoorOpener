const openDoorButton = document.getElementById("open-door-btn")
const toastContainer = document.getElementById("toast-container")

var actionButtonsEnabled = false


var intervalStatusCheck = null


const toastMessage = (message, status = "info", duration = 2000) => {
    const toastElement = document.createElement("span")
    toastElement.classList.add(status)
    toastElement.innerText = message
    toastElement.style.opacity = 0

    toastContainer.appendChild(toastElement)

    // hack to trigger reflow and css animation
    toastElement.getBoundingClientRect()

    toastElement.style.opacity = 1

    setTimeout(() => {
        toastContainer.removeChild(toastElement)
    }, duration)
}


const runAction = async(btnRef, cmdString, cmdFunc) => {

    let initialValue = btnRef.value
    btnRef.dataset.processing = true
    btnRef.disabled = true
    btnRef.value = cmdString

    cmdFunc().then(result => {
        btnRef.dataset.processing = false
        btnRef.disabled = false
        btnRef.value = initialValue
    }).catch(err => {
        btnRef.dataset.processing = false
        btnRef.disabled = false
        btnRef.value = initialValue
    })
}


const _actionOpenDoor = async() => {
    // send the API request to open the door

    let result = false

    const request = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    }
    try {

        const response = await fetch(API_URL, request)
        const data = await response.json()

        result = (data && data.ok) === true

        if (result) {
            toastMessage("Open / close command succeeded", "success")
        } else {
            toastMessage("Open / close command failed", "error")
        }

    } catch (e) {
        toastMessage("Failed to send command to the garage door", "error")
    }


    return result
}


const checkServer = async() => {
    // send the API request to check status

    let result = false

    const request = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    }
    try {

        const response = await fetch(READY_URL, request).catch((e) => console.log("Fetch error", e))
        const data = (response) ? await response.json().catch((e) => console.log("Json error", e)) : null

        result = (data && data.ok) === true

    } catch (e) {
        console.log("Readycheck status error", e)
    }


    return result
}

const actionButtonEnable = (val, skipToast = false) => {
    // enable or disable the action buttons on the page
    for (let btn of document.getElementsByClassName("action-btn")) {
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


document.addEventListener("DOMContentLoaded", () => {

    console.log("Page ready")

    openDoorButton.addEventListener("click", () => runAction(openDoorButton, "Opening Door", _actionOpenDoor))

    // enable the open door button if the server is ready
    checkServer().then(status => {
        setTimeout(() => actionButtonEnable(status, true), 0)
    })

    // periodically check the server status
    // disable the action buttons if the server is not ready to receive commands
    intervalStatusCheck = setInterval(() => {
        checkServer().then(status => {
            setTimeout(() => actionButtonEnable(status), 0)
        })
    }, 2000)

})