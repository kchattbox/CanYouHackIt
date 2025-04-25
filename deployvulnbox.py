import uuid
import threading
import time
from azure.identity import ClientSecretCredential
from azure.mgmt.containerinstance import ContainerInstanceManagementClient

# Replace with your actual values
obfuscated1 = 'REDACTED'
obfuscated2 = 'REDACTED'
obfuscated3 = 'REDACTED'
obfuscated4 = 'REDACTED'
obfuscated5 = 'REDACTED'
obfuscated6 = 'REDACTED'
obfuscated7 = 'REDACTED'
obfuscated8 = 'REDACTED'
obfuscated9 = 'REDACTED'
obfuscated10 = 'REDACTED'
PORTS = [21, 6200]

# Authenticate to Azure
credential = ClientSecretCredential(
    obfuscated1=obfuscated1,
    obfuscated2=obfuscated2,
    obfuscated3=obfuscated3
)
client = ContainerInstanceManagementClient(credential, obfuscated4)

def delete_container_later(name, delay=1800):
    def task():
        time.sleep(delay)
        print(f"[INFO] Deleting container {name}")
        try:
            client.container_groups.begin_delete(obfuscated5, name)
        except Exception as e:
            print(f"[ERROR] Failed to delete {name}: {e}")
    threading.Thread(target=task, daemon=True).start()

def launch_container():
    container_name = f"vulnbox-{uuid.uuid4().hex[:6]}"
    image = f"{obfuscated7}/{obfuscated10}"

    print(f"[INFO] Launching container: {container_name}")

    container_resource = {
        "location": obfuscated6,
        "containers": [{
            "name": container_name,
            "image": image,
            "resources": {
                "requests": {
                    "memory_in_gb": 0.5,
                    "cpu": 0.5
                }
            },
            "ports": [{"port": p} for p in PORTS]
        }],
        "os_type": "Linux",
        "ip_address": {
            "type": "Public",
            "ports": [{"protocol": "TCP", "port": p} for p in PORTS]
        },
        "restart_policy": "Never",
        "image_registry_credentials": [{
            "server": obfuscated7,
            "username": obfuscated8,
            "password": obfuscated9
        }]
    }

    # Deploy container
    poller = client.container_groups.begin_create_or_update(
        obfuscated5,
        container_name,
        container_resource
    )
    result = poller.result()

    # Schedule auto-deletion
    delete_container_later(container_name)

    return {
        "container_name": container_name,
        "ip": result.ip_address.ip,
        "ports": PORTS
    }

# If running standalone
if __name__ == '__main__':
    result = launch_container()
    print(f"[SUCCESS] Container launched at {result['ip']}")
