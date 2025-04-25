let containerName;
let containerLifetime = 1800; // Container lifetime in seconds (for testing)
let timerInterval;

document.addEventListener('DOMContentLoaded', function() {
    // Launch button event listener
    const launchButton = document.getElementById('launchButton');
    if (launchButton) {
        launchButton.addEventListener('click', launchContainer);
    }
    
    // Hide challenge content initially
    const challengeContent = document.getElementById('challengeContent');
    if (challengeContent) {
        challengeContent.style.display = 'none';
    }
});

function launchContainer() {
    // Show loading message
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
    
    // Disable the button
    const launchButton = document.getElementById('launchButton');
    if (launchButton) {
        launchButton.disabled = true;
        launchButton.textContent = 'Launching...';
    }
    
    // Make the request to launch container
    fetch('/launch-container', {
        method: 'POST',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Container launch response:", data);
        
        if (data.success) {
            // Store container name for polling
            containerName = data.container_name;
            console.log("Container name set to:", containerName);
            
            // Display the container IP
            const containerIp = document.getElementById('containerIp');
            if (containerIp) {
                containerIp.textContent = data.ip;
            }
            
            // Show the challenge content
            const challengeContent = document.getElementById('challengeContent');
            if (challengeContent) {
                challengeContent.style.display = 'block';
            }
            
            // Hide loading message
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
            
            // Hide the launch button container
            const launchButtonContainer = document.getElementById('launchButtonContainer');
            if (launchButtonContainer) {
                launchButtonContainer.style.display = 'none';
            }
            
            // Show container status
            const containerStatus = document.getElementById('containerStatus');
            if (containerStatus) {
                containerStatus.textContent = "Container is active";
            }
            
            // Start countdown timer
            startContainerTimer();
            
            // Poll container status
            pollContainerStatus();
        } else {
            alert('Failed to launch container: ' + data.error);
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
            if (launchButton) {
                launchButton.disabled = false;
                launchButton.textContent = 'Launch Hacking Target';
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while launching the container. Please try again.');
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
        if (launchButton) {
            launchButton.disabled = false;
            launchButton.textContent = 'Launch Hacking Target';
        }
    });
}

function startContainerTimer() {
    let timeRemaining = containerLifetime;
    
    // Clear any existing interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Update timer immediately
    updateTimerDisplay(timeRemaining);
    
    // Set up interval to update every second
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay(timeRemaining);
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const timerDisplay = document.getElementById('containerTimer');
    if (timerDisplay) {
        timerDisplay.textContent = `Container will be deleted in: ${seconds} seconds`;
        
        // Change color as time runs out
        if (seconds <= 10) {
            timerDisplay.style.color = '#FF3300';
        }
    }
}

function pollContainerStatus() {
    // Check container status every 5 seconds
    const statusInterval = setInterval(() => {
        // Make sure containerName has a value
        if (!containerName) {
            console.error("No container name available for status check");
            clearInterval(statusInterval);
            return;
        }
        
        console.log("Polling status for container:", containerName);
        
        fetch('/container-status?name=' + encodeURIComponent(containerName))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Status response not OK: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log("Container status:", data);
                if (!data.active) {
                    clearInterval(statusInterval);
                    containerDeleted();
                }
            })
            .catch(error => {
                console.error('Error polling container status:', error);
            });
    }, 5000);
}

function containerDeleted() {
    // Clear the timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Update UI to show container is deleted
    const containerStatus = document.getElementById('containerStatus');
    if (containerStatus) {
        containerStatus.textContent = "Container has been deleted";
        containerStatus.style.color = "#FF3300";
    }
    
    const containerTimer = document.getElementById('containerTimer');
    if (containerTimer) {
        containerTimer.textContent = "";
    }
    
    // Show launch button again
    const launchButtonContainer = document.getElementById('launchButtonContainer');
    if (launchButtonContainer) {
        launchButtonContainer.style.display = 'block';
    }
    
    const launchButton = document.getElementById('launchButton');
    if (launchButton) {
        launchButton.disabled = false;
        launchButton.textContent = 'Launch New Hacking Target';
    }
    
    // Hide challenge content
    const challengeContent = document.getElementById('challengeContent');
    if (challengeContent) {
        challengeContent.style.display = 'none';
    }
    
    // Reset container IP
    const containerIp = document.getElementById('containerIp');
    if (containerIp) {
        containerIp.textContent = "None";
    }
    
    // Hide any revealed hints
    for (let i = 1; i <= 5; i++) {
        const hint = document.getElementById('hint-' + i);
        if (hint) {
            hint.style.display = 'none';
        }
    }
}

function revealHint(hintNumber) {
    const hint = document.getElementById('hint-' + hintNumber);
    if (hint) {
        if (hint.style.display === 'none' || hint.style.display === '') {
            hint.style.display = 'block';
        } else {
            hint.style.display = 'none';
        }
    }
}

function checkFlag() {
    const input = document.getElementById("flagInput");
    const result = document.getElementById("flagResult");
    
    if (!input || !result) return;
    
    const flagValue = input.value.trim();

    fetch("/check_flag", {
        method: "POST",
        body: JSON.stringify({flag: flagValue}),
	headers: {"Content-Type": "application/json"},
    })
    .then(response => {
        console.log("Headers:", [...response.headers]);
        return response.text();
    })
    .then(text => {
        console.log("Response length:", text.length);
        if (text.trim() === "CORRECT") {
            result.innerHTML = "✅ Correct! Well done, hacker.";
            result.style.color = "#00FF00";
        } else {
            result.innerHTML = "❌ Incorrect flag. Try again.";
            result.style.color = "#FF3300";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        result.innerHTML = "❌ An error occurred. Try again.";
        result.style.color = "#FF3300";
    });
}
