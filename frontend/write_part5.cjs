const fs = require('fs');
const js5 = `
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
            showModal(data.data);
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
`;
fs.appendFileSync('src/main.js', js5);
console.log('Part 5 appended');