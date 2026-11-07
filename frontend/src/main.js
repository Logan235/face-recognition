const API_BASE = 'http://localhost:3000/api';
const AI_BASE = 'http://localhost:8000';

let scanStream = null;
let regStream = null;
let capturedBlob = null;
let scanInterval = null;

window.switchTab = function(tabName) {
    stopCamera();
    stopRegCamera();

    ['scan', 'register', 'leaderboard'].forEach(t => {
        const el = document.getElementById('tab-' + t);
        const btn = document.getElementById('btn-' + t);
        if (el) el.classList.add('hidden');
        if (btn) {
            btn.className = 'px-5 py-2.5 bg-slate-800 rounded-xl font-semibold shadow-lg hover:bg-slate-700 transition flex items-center gap-2';
        }
    });

    const activeEl = document.getElementById('tab-' + tabName);
    const activeBtn = document.getElementById('btn-' + tabName);
    if (activeEl) activeEl.classList.remove('hidden');
    if (activeBtn) {
        if (tabName === 'scan') activeBtn.className = 'px-5 py-2.5 bg-pink-600 rounded-xl font-semibold shadow-lg hover:bg-pink-500 transition flex items-center gap-2';
        else if (tabName === 'register') activeBtn.className = 'px-5 py-2.5 bg-indigo-600 rounded-xl font-semibold shadow-lg hover:bg-indigo-500 transition flex items-center gap-2';
        else if (tabName === 'leaderboard') activeBtn.className = 'px-5 py-2.5 bg-amber-600 rounded-xl font-semibold shadow-lg hover:bg-amber-500 transition flex items-center gap-2';
    }

    if (tabName === 'leaderboard') {
        loadLeaderboard();
    } else if (tabName === 'scan') {
        startCamera();
    } else if (tabName === 'register') {
        startRegCamera();
    }
};

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

window.loadLeaderboard = async function() {
    const loading = document.getElementById('leaderboard-loading');
    const table = document.getElementById('leaderboard-table');
    const tbody = document.getElementById('leaderboard-body');

    loading.style.display = 'block';
    table.classList.add('hidden');

    try {
        const res = await fetch(API_BASE + '/users/leaderboard');
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.user)) {
            tbody.innerHTML = '';
            data.user.forEach((user, index) => {
                let rankBadge = '#' + (index + 1);
                let rowClass = 'hover:bg-slate-700/40 transition';
                if (index === 0) {
                    rankBadge = '🥇 1';
                    rowClass = 'bg-yellow-500/15 hover:bg-yellow-500/25 transition font-semibold';
                } else if (index === 1) {
                    rankBadge = '🥈 2';
                    rowClass = 'bg-slate-400/10 hover:bg-slate-400/20 transition font-semibold';
                } else if (index === 2) {
                    rankBadge = '🥉 3';
                    rowClass = 'bg-amber-600/10 hover:bg-amber-600/20 transition font-semibold';
                }

                const tr = document.createElement('tr');
                tr.className = rowClass;
                tr.innerHTML = '<td class="py-3 px-4 font-bold text-center w-16">' + rankBadge + '</td><td class="py-3 px-4 font-medium text-white">' + user.name + '</td><td class="py-3 px-4 text-slate-400 text-sm">' + user.studentId + '</td><td class="py-3 px-4 text-center"><span class="px-3 py-1 bg-pink-500/20 text-pink-400 font-extrabold rounded-full">' + user.handsomeScore + '/100</span></td><td class="py-3 px-4 text-slate-300 italic text-sm">"' + (user.aiComment || 'Soái ca đích thực!') + '"</td>';
                tbody.appendChild(tr);
            });
            loading.style.display = 'none';
            table.classList.remove('hidden');
        } else {
            loading.innerText = 'Không thể tải dữ liệu bảng xếp hạng.';
        }
    } catch (err) {
        loading.innerText = 'Lỗi kết nối tới máy chủ: ' + err.message;
    }
};

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
            const res = await fetch(API_BASE + '/scan/recognize', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success && data.user) {
                showModal(data.user);
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

function showModal(user) {
    const modal = document.getElementById('result-modal');
    const content = document.getElementById('modal-content');

    content.innerHTML = '<div class="text-6xl mb-3">👑</div><h3 class="text-2xl font-extrabold text-pink-400 mb-1">' + user.name + '</h3><p class="text-sm text-slate-400 mb-4">Mã SV: ' + user.studentId + '</p><div class="inline-block px-6 py-3 bg-pink-500/20 border border-pink-500/50 rounded-2xl mb-4"><span class="text-sm text-pink-300 block">Handsome Score</span><span class="text-4xl font-black text-pink-400">' + user.handsomeScore + ' <span class="text-lg">/100</span></span></div><p class="text-slate-200 italic bg-slate-900/60 p-3 rounded-xl border border-slate-700 mb-6">"' + user.aiComment + '"</p><button onclick="closeModal()" class="w-full py-3 bg-pink-600 hover:bg-pink-500 font-bold rounded-xl transition shadow-lg">Tiếp Tục Quét</button>';

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (window.confetti) {
        confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

window.closeModal = function() {
    const modal = document.getElementById('result-modal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    if (document.getElementById('tab-scan').classList.contains('hidden') === false) {
        startCamera();
    }
};

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!capturedBlob) return alert('Vui lòng chụp ảnh khuôn mặt của bạn trước khi đăng ký!');

    const name = document.getElementById('reg-name').value;
    const studentId = document.getElementById('reg-student-id').value;

    const formData = new FormData();
    formData.append('file', capturedBlob, 'register.jpg');
    formData.append('name', name);
    formData.append('studentId', studentId);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = 'AI đang so sánh và chấm điểm...';

    try {
        const res = await fetch(API_BASE + '/users/register', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok && data.success) {
            showModal(data.user);
            document.getElementById('register-form').reset();
            document.getElementById('snapshot-preview').classList.add('hidden');
            capturedBlob = null;
            stopRegCamera();
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể đăng ký'));
        }
    } catch (err) {
        alert('Không thể kết nối server: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Gửi AI Chấm Điểm & Đăng Ký';
    }
});

switchTab('scan');


