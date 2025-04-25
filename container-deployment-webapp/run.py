from flask import Flask, request
import os
from app.routes.main import main as main_blueprint
from app.config import Config 
import secrets

def create_app():
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'app', 'templates'))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'app', 'static'))
    
    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
    app.secret_key = secrets.token_hex(32)    
    app.config.from_object(Config)
    
    app.register_blueprint(main_blueprint)

    import logging
    handler = logging.FileHandler('/home/ubuntu/ITC266_Project/azure-scripts/container-deployment-webapp/app.log')
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)

    @app.before_request
    def log_requests():
        app.logger.info(f"Request from {request.remote_addr}")
        app.logger.info(f"\tRequested resource: {request.url}")
        if request.method == "POST":
            app.logger.info(f"\tPayload: {request.form}")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=80, debug=False)
