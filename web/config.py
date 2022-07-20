from dotenv import load_dotenv
import os


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "db.sqlite")


load_dotenv(os.path.join(BASE_DIR, "..", ".env"))


class Config:
	# Flask app configs

	DEBUG = False
	SECRET_KEY = os.environ.get("SECRET_KEY")
	SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_FILE}"
	TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
	TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
	TWILIO_SOURCE_NUMBER = os.environ.get("TWILIO_SOURCE_NUMBER")
	SMS_NOTIFICATION_DEST = os.environ.get("SMS_NOTIFICATION_DEST")
