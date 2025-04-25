async function getCanvasFingerprint() {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');

  // Draw something
  const gradient = ctx.createLinearGradient(0, 0, 200, 0);
  gradient.addColorStop(0, 'red');
  gradient.addColorStop(1, 'blue');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 200, 50);

  ctx.fillStyle = 'white';
  ctx.font = '20px "Comic Sans MS", cursive';
  ctx.fillText('👋 Hello, fingerprint!', 10, 10);

  // Convert to image data
  const dataURL = canvas.toDataURL();

  // Hash it
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(dataURL)
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return fingerprint;
}

// Attach fingerprint as header in a request
getCanvasFingerprint().then(fingerprint => {
  fetch('/store-fingerprint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Canvas-Fingerprint': fingerprint  // 👈 custom header
    },
    body: JSON.stringify({ /* other data */ })
  });
});

async function fingerprintedFetch(url, options = {}) {
	const fingerprint = await(getCanvasFingerprint());
	
	const headers = new Headers(option.headers || {});
	headers.set('X-Fingerprint', fingerprint);

	return fetch(url, {...options, headers});
}

window.originalFetch = window.fetch;
window.fetch = fingerprintedFetch;
