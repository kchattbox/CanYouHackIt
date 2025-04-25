let containerLifetime = 1800

async function getCanvasFingerprint() {
  // Step 1: Create canvas and draw something complex
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');

  // Draw background gradient
  const gradient = ctx.createLinearGradient(0, 0, 200, 0);
  gradient.addColorStop(0, 'red');
  gradient.addColorStop(1, 'blue');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 200, 50);

  // Draw styled text
  ctx.fillStyle = 'white';
  ctx.font = '20px "Comic Sans MS", cursive, sans-serif';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'black';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 2;
  ctx.fillText('👋 Hello, fingerprint!', 2, 2);

  // Step 2: Convert to data URL
  const dataURL = canvas.toDataURL();

  // Step 3: Hash the image data
//  const hashBuffer = await crypto.subtle.digest(
//    'SHA-256',
//    new TextEncoder().encode(dataURL)
//  );
//  const hashArray = Array.from(new Uint8Array(hashBuffer));
//  const fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const fingerprint = sha256(dataURL);

  console.log('Canvas fingerprint:', fingerprint);

  // Optional Step 4: Send to server
  // await fetch('/store-fingerprint', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ fingerprint })
  // });

  return fingerprint;
}

async function loadContainerInformation() {	
	fingerprint = await getCanvasFingerprint();
	console.log(fingerprint)
	container_info = await fetch('/get-container', {
		method: 'POST',
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({ 'fingerprint': fingerprint })
	}).then(data => data.json());
	console.log(container_info);
	ip = container_info['ip'];
	let span = document.getElementById('containerIp');
	let statusElement = document.getElementById('containerStatus');
	statusElement.innerHTML = `Target is ${ip ? "active" : "unavailable"}`;
	span.innerHTML = ip;
}
loadContainerInformation();

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
	headers: {"Content-Type": "appliciation/json"},
        body: JSON.stringify({flag: flagValue}),
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

startContainerTimer();
