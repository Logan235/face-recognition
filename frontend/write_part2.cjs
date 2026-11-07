const fs = require('fs');
const js2 = `
window.startCamera = async function() {
    try {
        const video = document.getElementById('webcam');
        scanStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = scanStream;
        document.getElementById('status-box').innerText = 'Camera đã sẵn sàng! Đang tự động quét khuôn mặt...';
        scanInterval = setInterval(triggerAutoScan, 4000);
    } catch (err) {
        document.getElementById('status-box').innerText = 'Không thể mở camera: ' + err.message;
    }
};

window.stopCamera = function() {
    if (scanInterval) clearInterval(scanInterval);
    if (scanStream) {
        scanStream.getTracks().forEach(track => track.stop());
        scanStream = null;
    }
};

async function triggerAutoScan() {
    if (!scanStream) return;
    const video = document.getElementById('webcam');
    if (!video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append('file', blob, 'scan.jpg');

        try {
            const res = await fetch(API_BASE + '/users/recognize', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success && data.match) {
                showModal(data.match);
                stopCamera();
            }
        } catch (err) {
            console.error('Scan error:', err);
        }
    }, 'image/jpeg', 0.85);
}

window.triggerManualScan = function() {
    triggerAutoScan();
};
`;
fs.appendFileSync('src/main.js', js2);
console.log('Part 2 appended');
