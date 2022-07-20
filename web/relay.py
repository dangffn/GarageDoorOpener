from flask import Flask, jsonify, current_app, Blueprint
from flask_login import login_required
from RPi import GPIO
import time
import logging
from .notify import sms_notify_default


logger = logging.getLogger(__name__)


LOGIC_PIN = 18


logger.info("Configuring GPIO")
GPIO.setmode(GPIO.BOARD)
GPIO.setup(LOGIC_PIN, GPIO.OUT)


def cleanup():
    GPIO.cleanup()

def trigger_relay():

    try:
        GPIO.output(LOGIC_PIN, GPIO.HIGH)
        time.sleep(1)
        GPIO.output(LOGIC_PIN, GPIO.LOW)
        return True
    except Exception as e:
        logger.exception("Error triggering relay")
        return False


relay = Blueprint("relay", __name__)


@relay.route("/relay/", methods=["POST"])
@login_required
def index():
    # POST command initiates the relay trigger
    # must be logged in to perform this action
    
    result = trigger_relay()

    # send a notification SMS to the destination number
    sms_notify_default(f"Garage door open command --> {'success' if result else 'fail'}")

    return jsonify({"ok": result})


@relay.route("/readycheck/", methods=["POST"])
@login_required
def readycheck():
    # server is up, return True
    return jsonify({"ok": True})
