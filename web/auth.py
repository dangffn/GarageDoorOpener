from flask import render_template, redirect, url_for, request, flash, Blueprint
from .models import User
from werkzeug.security import check_password_hash
from flask_login import login_user, login_required, logout_user
from .notify import sms_notify_default

auth = Blueprint("auth", __name__)

@auth.route("/login/")
def login():
    return render_template("login.html")


@auth.route("/login/", methods=["POST"])
def login_post():
    username = request.form.get("username")
    password = request.form.get("password")
    remember = request.form.get("remember")

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        sms_notify_default(f"Failed login for user {username}")
        flash("Please check your username and password")
        return redirect(url_for("auth.login"))

    sms_notify_default(f"Successful login for user {username}")
    login_user(user, remember=remember)
    return redirect(url_for("main.index"))


@auth.route("/logout/")
@login_required
def logout():
    logout_user()
    return redirect(url_for("auth.login"))

