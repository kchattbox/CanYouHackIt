from flask import current_app
import uuid
import threading
import time
from azure.identity import ClientSecretCredential
from azure.mgmt.containerinstance import ContainerInstanceManagementClient
from azure.core.exceptions import ResourceNotFoundError

def get_client(tenant_id, client_id, client_secret, subscription_id):
    credential = ClientSecretCredential(
        tenant_id=tenant_id,
        client_id=client_id,
        client_secret=client_secret
    )
    return ContainerInstanceManagementClient(credential, subscription_id)

def delete_container_later(name, resource_group, tenant_id, client_id, client_secret, subscription_id, delay=30):
    def task():
        time.sleep(delay)
        print(f"[INFO] Deleting container {name}")
        client = get_client(tenant_id, client_id, client_secret, subscription_id)
        try:
            client.container_groups.begin_delete(resource_group, name)
            print(f"[INFO] Container {name} deleted successfully")
        except Exception as e:
            print(f"[ERROR] Failed to delete {name}: {e}")
    threading.Thread(target=task, daemon=True).start()

def check_container_exists(container_name):
    """Check if a container exists in Azure"""
    tenant_id = current_app.config['TENANT_ID']
    client_id = current_app.config['CLIENT_ID']
    client_secret = current_app.config['CLIENT_SECRET']
    subscription_id = current_app.config['SUBSCRIPTION_ID']
    resource_group = current_app.config['RESOURCE_GROUP']
    
    client = get_client(tenant_id, client_id, client_secret, subscription_id)
    
    try:
        # Try to get the container
        container = client.container_groups.get(resource_group, container_name)
        # If we get here, the container exists
        return True, container.ip_address.ip if hasattr(container, 'ip_address') else None
    except ResourceNotFoundError:
        # Container doesn't exist
        return False, None
    except Exception as e:
        # Other error
        print(f"[ERROR] Error checking container status: {e}")
        return False, None

def launch_container():
    # Save config values needed for container deletion
    tenant_id = current_app.config['TENANT_ID']
    client_id = current_app.config['CLIENT_ID']
    client_secret = current_app.config['CLIENT_SECRET']
    subscription_id = current_app.config['SUBSCRIPTION_ID']
    resource_group = current_app.config['RESOURCE_GROUP']
    
    # For testing: Use 30 seconds instead of the config value
    container_lifetime = 1800 # Explicitly set to 30 seconds for testing
    print(f"[INFO] Container will be deleted after {container_lifetime} seconds")
    
    container_name = f"vulnbox-{uuid.uuid4().hex[:6]}"
    image = f"{current_app.config['ACR_LOGIN_SERVER']}/{current_app.config['IMAGE_NAME']}"

    print(f"[INFO] Launching container: {container_name}")

    container_resource = {
        "location": current_app.config['REGION'],
        "containers": [{
            "name": container_name,
            "image": image,
            "resources": {
                "requests": {
                    "memory_in_gb": 0.5,
                    "cpu": 0.5
                }
            },
            "ports": [{"port": p} for p in current_app.config['PORTS']]
        }],
        "os_type": "Linux",
        "ip_address": {
            "type": "Public",
            "ports": [{"protocol": "TCP", "port": p} for p in current_app.config['PORTS']]
        },
        "restart_policy": "Never",
        "image_registry_credentials": [{
            "server": current_app.config['ACR_LOGIN_SERVER'],
            "username": current_app.config['ACR_USERNAME'],
            "password": current_app.config['ACR_PASSWORD']
        }]
    }

    client = get_client(tenant_id, client_id, client_secret, subscription_id)
    poller = client.container_groups.begin_create_or_update(
        resource_group,
        container_name,
        container_resource
    )
    result = poller.result()

    # At the end of the function, make sure this call happens:
    print(f"[INFO] Scheduling container {container_name} to be deleted in {container_lifetime} seconds")
    delete_container_later(
        container_name, 
        resource_group, 
        tenant_id, 
        client_id, 
        client_secret, 
        subscription_id, 
        container_lifetime  # Pass the explicit 30 seconds value
    )

    return {
        "container_name": container_name,
        "ip": result.ip_address.ip,
        "ports": current_app.config['PORTS']
    }
