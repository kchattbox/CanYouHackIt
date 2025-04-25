let containerName;
let containerLifetime = 30; // Container lifetime in seconds (for testing)
let timerInterval;

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
//  await fetch('/store-fingerprint', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', 'X-Canvas-Fingerprint': fingerprint},
//     body: JSON.stringify({ fingerprint })
//   });

  return fingerprint;
}


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

async function launchContainer() {
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

    let fingerprint = await getCanvasFingerprint()
    
    // Make the request to launch container
    fetch('/new-launch-container', {
        method: 'POST',
	headers: {"Content-Type": "application/json"},
	body: JSON.stringify({fingerprint: fingerprint})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Container launch response:", data);
	window.location.replace('/challenge');
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
