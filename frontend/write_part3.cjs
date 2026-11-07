const fs = require('fs');
const js3 = `
window.startRegCamera = async function() {
    try {
        const video = document.getElementById('reg-webcam');
        regStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 640 } });
        video.srcObject = regStream;
    } catch (err) {
        alert('Không thể mở camera đăng ký: ' + err.message);
    }
};

window.stopRegCamera = function() {
    if (regStream) {
        regStream.getTracks().forEach(track => track.stop());
        regStream = null;
    }
};

window.captureSnapshot = function() {
    const video = document.getElementById('reg-webcam');
    if (!video.videoWidth) return alert('Camera chưa sẵn sàng!');

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
        capturedBlob = blob;
        const imageUrl = URL.createObjectURL(blob);
        document.getElementById('captured-img').src = imageUrl;
        document.getElementById('snapshot-preview').classList.remove('hidden');
        stopRegCamera();
    }, 'image/jpeg', 0.9);
};

window.retakeSnapshot = function() {
    capturedBlob = null;
    document.getElementById('snapshot-preview').classList.add('hidden');
    startRegCamera();
};

window.startAdminCamera = async function() {
    try {
        const video = document.getElementById('admin-webcam');
        adminStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 640 } });
        video.srcObject = adminStream;
    } catch (err) {
        alert('Không thể mở camera chuẩn: ' + err.message);
    }
};

window.stopAdminCamera = function() {
    if (adminStream) {
        adminStream.getTracks().forEach(track => track.stop());
        adminStream = null;
    }
};

window.captureAdminSnapshot = function() {
    const video = document.getElementById('admin-webcam');
    if (!video.videoWidth) return alert('Camera chưa sẵn sàng!');

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
        adminCapturedBlob = blob;
        const imageUrl = URL.createObjectURL(blob);
        document.getElementById('admin-captured-img').src = imageUrl;
        document.getElementById('admin-snapshot-preview').classList.remove('hidden');
        document.getElementById('btn-save-standard').classList.remove('hidden');
        stopAdminCamera();
    }, 'image/jpeg', 0.95);
};
`;
fs.appendFileSync('src/main.js', js3);
console.log('Part 3 appended');