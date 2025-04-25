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

async function fingerprintedFetch(url, options = {}) {
        const fingerprint = await(getCanvasFingerprint());

        const headers = new Headers(options.headers || {});
        headers.set('X-Canvas-Fingerprint', fingerprint);

        return originalFetch(url, {...options, headers});
}

window.originalFetch = window.fetch;
window.fetch = fingerprintedFetch;

// Run on page load
getCanvasFingerprint();
