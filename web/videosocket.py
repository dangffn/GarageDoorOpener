import os
import cv2
import logging
import time


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

sock_file = "/tmp/videocapture.sock"


def generator(camera):
    while True:
        rval, frame = camera.read()
        # frame_bytes = cv2.imencode(".jpg", frame)[1].tobytes()
        # yield b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
        yield cv2.imencode(".jpg", frame)[1].tobytes()


def read_generator(format_for_web=True):
    while True:
        with open(sock_file, "rb", 0) as in_file:
            time.sleep(0.25)
            data = in_file.read()
            print("Received", len(data), "bytes from camera")
            if len(data):
                if format_for_web:
                    yield b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + data + b'\r\n'
                else:
                    yield data


if __name__ == "__main__":

    pi_camera = cv2.VideoCapture(cv2.CAP_V4L2)
    pi_camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    pi_camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    if os.path.exists(sock_file):
        os.unlink(sock_file)

    if not os.path.exists(sock_file):
        os.mkfifo(sock_file)
        # logger.info(f"Initialized videocapture socket {sock_file}")
        print(f"Initialized videocapture socket {sock_file}")

    running = True
    while running:

        try:
            for frame in generator(pi_camera):
                with open(sock_file, "wb") as out_file:
                    print("Writing frame to socket file")
                    out_file.write(frame)

        except BrokenPipeError:
            pass