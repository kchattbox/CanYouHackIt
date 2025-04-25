from flask import Flask
import secrets

def create_app():
    app = Flask(__name__)
    app.secret_key = secrets.token_hex(32)
    with app.app_context():
        from .routes import main
        app.register_blueprint(main.bp)

    return app
