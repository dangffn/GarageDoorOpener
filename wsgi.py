from web import create_app
import os

os.environ["FLASK_APP"] = "web"
os.environ["FLASK_ENV"] = "production"

app = create_app()


if __name__ == "__main__":
    app.run()
