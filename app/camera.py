#!/usr/bin/env python3

import cv2
import base64
import sys
import argparse

cam = cv2.VideoCapture(0)

if __name__ == "__main__":
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    ret, frame = cam.read()
    ret, buffer = cv2.imencode(".jpg", frame)
    sys.stdout.buffer.write(base64.b64encode(buffer))
