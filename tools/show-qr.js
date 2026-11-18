// Makes a QR code for Expo Go and opens it in your web browser.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');
const QRCode = require('qrcode');

function wifiAddress() {
  const found = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family === 'IPv4' && !a.internal && !/vEthernet|VirtualBox|VMware|WSL/i.test(name)) found.push(a.address);
    }
  }
  return found.find((ip) => ip.startsWith('192.168.')) || found.find((ip) => ip.startsWith('10.')) || found[0] || 'localhost';
}

(async () => {
  const link = `exp://${wifiAddress()}:8081`;
  const out = path.join(__dirname, '..', 'rally-qr.png');
  await QRCode.toFile(out, link, { width: 420, margin: 2 });
  const html = path.join(__dirname, '..', 'rally-qr.html');
  fs.writeFileSync(
    html,
    `<!doctype html><meta charset="utf-8"><title>Rally. QR</title>
<body style="font-family:system-ui;text-align:center;background:#FFF8F0;color:#1F2340">
<h1 style="color:#5B3FD9">Rally.</h1><p>Open the <b>Expo Go</b> app on your phone and scan this code.</p>
<img src="rally-qr.png" width="320"><p style="font-size:20px"><b>${link}</b></p>
<p>Phone and computer must be on the same Wi-Fi. Keep both black windows open.</p></body>`
  );
  console.log('');
  console.log('  Expo Go link:  ' + link);
  console.log('  QR code saved:  rally-qr.png  (opening it now)');
  exec(process.platform === 'win32' ? `start "" "${html}"` : `open "${html}"`);
})();
