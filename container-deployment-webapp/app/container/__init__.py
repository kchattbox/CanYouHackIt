from flask import Blueprint

container_bp = Blueprint('container', __name__)

from .azure_container import launch_container, delete_container_later

# Additional initialization code can be added here if needed.