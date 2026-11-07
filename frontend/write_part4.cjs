const fs = require('fs');
const js4 = `
window.saveStandardFace = async function() {
    if (!adminCapturedBlob) return alert('Vui lòng chụp ảnh chuẩn trước!');

    const formData = new FormData();
    formData.append('file', adminCapturedBlob, 'standard.jpg');

    const btn = document.getElementById('btn-save-standard');
    btn.disabled = true;
    btn.innerText = 'Đang thiết lập ảnh chuẩn gốc...';

    try {
        const res = await fetch(API_BASE + '/users/admin/set-standard-face', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok && data.success) {
            alert('Đã thiết lập Ảnh Chuẩn Gốc thành công!');
            document.getElementById('admin-snapshot-preview').classList.add('hidden');
            btn.classList.add('hidden');
            adminCapturedBlob = null;
            switchTab('scan');
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể thiết lập ảnh chuẩn'));
        }
    } catch (err) {
        alert('Lỗi kết nối: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Lưu Làm Ảnh Chuẩn Hệ Thống';
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
        if (res.ok && data.success && Array.isArray(data.data)) {
            tbody.innerHTML = '';
            data.data.forEach((user, index) => {
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
`;
fs.appendFileSync('src/main.js', js4);
console.log('Part 4 appended');