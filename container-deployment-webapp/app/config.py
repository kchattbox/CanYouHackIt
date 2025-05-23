import os

class Config:
    TENANT_ID = os.getenv('AZURE_TENANT_ID', 'REDACTED')
    CLIENT_ID = os.getenv('AZURE_CLIENT_ID', 'REDACTED')
    CLIENT_SECRET = os.getenv('AZURE_CLIENT_SECRET', 'REDACTED')
    SUBSCRIPTION_ID = os.getenv('AZURE_SUBSCRIPTION_ID', 'REDACTED')
    RESOURCE_GROUP = os.getenv('AZURE_RESOURCE_GROUP', 'REDACTED')
    REGION = os.getenv('AZURE_REGION', 'REDACTED')
    ACR_LOGIN_SERVER = os.getenv('AZURE_ACR_LOGIN_SERVER', 'REDACTED')
    ACR_USERNAME = os.getenv('AZURE_ACR_USERNAME', 'REDACTED')
    ACR_PASSWORD = os.getenv('AZURE_ACR_PASSWORD', 'REDACTED')
    IMAGE_NAME = os.getenv('AZURE_IMAGE_NAME', 'REDACTED')
    PORTS = [21, 6200]
    CONTAINER_LIFETIME = 1800  # 30 minutes in seconds