from flask import Response, Blueprint
from flask_login import login_required
from .videosocket import read_generator
import cv2
import logging


logger = logging.getLogger(__name__)


videostream = Blueprint("videostream", __name__)


@videostream.route("/videostream/")
@login_required
def stream():
    return Response(read_generator(), mimetype='multipart/x-mixed-replace; boundary=frame')