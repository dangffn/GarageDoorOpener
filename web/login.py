from flask import Blueprint, render_template, current_app


login = Blueprint("login", __name__, url_prefix="/login")

@login.route("/")
def index():
    recaptcha_site_key = current_app.config["RECAPTCHA_SITE_KEY"]
    return render_template("login.html", recaptcha_site_key=recaptcha_site_key)
