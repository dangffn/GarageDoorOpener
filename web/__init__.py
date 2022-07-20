from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
import os
import logging


# setup logger
logging.basicConfig(format='[%(asctime)s] [%(levelname)s] - %(message)s')

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


db = SQLAlchemy()


def create_app():

    app = Flask(__name__)

    # load configs from the config.py file
    app.config.from_object('web.config.Config')

    db.init_app(app)

    migrate = Migrate(app, db)

    from web.relay import relay
    app.register_blueprint(relay)

    from web.auth import auth
    app.register_blueprint(auth)

    from web.main import main
    app.register_blueprint(main)

    from web.videostream import videostream
    app.register_blueprint(videostream)

    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    from web.models import User
    @login_manager.user_loader
    def load_user(user_id):
        #return User.query.get(int(user_id))
        return User.query.get(int(user_id))

    return app

