const fs = require('fs');
const js = `const API_BASE = 'http://localhost:3000';
const AI_BASE = 'http://localhost:8000';

let scanStream = null;
let regStream = null;
let adminStream = null;
let capturedBlob = null;
let adminCapturedBlob = null;
let scanInterval = null;

window.switchTab = function(tabName) {
    stopCamera();
    stopRegCamera();
    stopAdminCamera();

    ['scan', 'register', 'leaderboard', 'admin'].forEach(t => {
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
        else if (tabName === 'admin') activeBtn.className = 'px-5 py-2.5 bg-emerald-600 rounded-xl font-semibold shadow-lg hover:bg-emerald-500 transition flex items-center gap-2';
    }

    if (tabName === 'leaderboard') {
        loadLeaderboard();
    } else if (tabName === 'scan') {
        startCamera();
    } else if (tabName === 'register') {
        startRegCamera();
    } else if (tabName === 'admin') {
        startAdminCamera();
    }
};
`;
fs.writeFileSync('src/main.js', js);
console.log('Part 1 written');
