const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];
let state = [...SOLVED];
let moves = 0, startTime = null, timer = null, won = false;
let currentImg = "https://picsum.photos/id/237/300/300";

function changePreset() {
    const presetEl = document.getElementById("preset");
    if (!presetEl) return;
    const val = presetEl.value;
    const customWrap = document.getElementById("customWrap");
    if (val === "custom") {
        if (customWrap) customWrap.style.display = "flex";
        const imgInput = document.getElementById("imgUrl");
        currentImg = imgInput ? imgInput.value : "";
    } else {
        if (customWrap) customWrap.style.display = "none";
        currentImg = val;
        initGame();
    }
}

function initGame() {
    const presetEl = document.getElementById("preset");
    if (presetEl && presetEl.value === "custom") {
        const urlInput = document.getElementById("imgUrl");
        const url = urlInput ? urlInput.value.trim() : "";
        if (url) currentImg = url;
    }
    const peekEl = document.getElementById("peek");
    if (peekEl) peekEl.style.backgroundImage = `url(${currentImg})`;
    state = [...SOLVED];
    moves = 0;
    won = false;
    startTime = null;
    clearInterval(timer);

    const timeEl = document.getElementById('time');
    if (timeEl) timeEl.innerText = "00:00";
    const movesEl = document.getElementById('moves');
    if (movesEl) movesEl.innerText = "0";
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.innerText = "HOLD [SPACE] TO PEEK // CLICK OR ARROWS";

    for (let i = 0; i < 80; i++) {
        const empty = state.indexOf(0);
        const neighbors = getNeighbors(empty);
        const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
        [state[empty], state[pick]] = [state[pick], state[empty]];
    }
    render();
}

function getNeighbors(index) {
    const r = Math.floor(index / 3), c = index % 3, n = [];
    if (r > 0) n.push(index - 3);
    if (r < 2) n.push(index + 3);
    if (c > 0) n.push(index - 1);
    if (c < 2) n.push(index + 1);
    return n;
}

function moveTile(index) {
    if (won) return;
    const emptyindex = state.indexOf(0);
    if (!getNeighbors(emptyindex).includes(index)) return;

    if (!startTime) {
        startTime = performance.now();
        timer = setInterval(() => {
            const timeEl = document.getElementById('time');
            if (timeEl) timeEl.innerText = ((performance.now() - startTime) / 1000).toFixed(1);
        }, 100);
    }

    [state[emptyindex], state[index]] = [state[index], state[emptyindex]];
    moves++;
    const movesEl = document.getElementById('moves');
    if (movesEl) movesEl.innerText = moves;
    render();
    checkWin();
}

function updateLeaderboardUI(list) {
    const container = document.getElementById("lbList");
    if (!container) return;
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="lb-empty">NO RECORDS YET. SOLVE TO CLAIM #1.</div>';
        return;
    }
    container.innerHTML = list.map((row, i) => `
    <div class="lb-row">
      <span>#${i + 1} ${row.name}</span>
      <span>${row.score} PTS (${row.time}s / ${row.moves}m)</span>
    </div>
  `).join('');
}

function saveLocalScore(name, score, time_s, movesCount) {
    try {
        const saved = JSON.parse(localStorage.getItem('3x3_leaderboard') || '[]');
        saved.push({
            name: name,
            score: score,
            time: Math.round(time_s * 10) / 10,
            moves: movesCount
        });
        saved.sort((a, b) => b.score - a.score || a.time - b.time);
        const top5 = saved.slice(0, 5);
        localStorage.setItem('3x3_leaderboard', JSON.stringify(top5));
        const best = top5[0] ? top5[0].score : 0;
        const bestEl = document.getElementById('best');
        if (bestEl) bestEl.innerText = best;
        updateLeaderboardUI(top5);
    } catch (e) {
        console.error("Local storage error:", e);
    }
}

function loadLeaderboard() {
    fetch('/scores')
        .then(r => {
            if (!r.ok) throw new Error("No backend /scores route");
            return r.json();
        })
        .then(d => {
            const bestEl = document.getElementById('best');
            if (bestEl) bestEl.innerText = d.best;
            updateLeaderboardUI(d.leaderboard);
        })
        .catch(() => {
            // Fallback to localStorage for GitHub Pages / static hosting
            try {
                const saved = JSON.parse(localStorage.getItem('3x3_leaderboard') || '[]');
                const best = saved.length ? saved[0].score : 0;
                const bestEl = document.getElementById('best');
                if (bestEl) bestEl.innerText = best;
                updateLeaderboardUI(saved);
            } catch (e) {
                console.error("Local storage load error:", e);
            }
        });
}

function checkWin() {
    if (state.every((val, i) => val === SOLVED[i])) {
        won = true;
        clearInterval(timer);
        const elapsed = (performance.now() - startTime) / 1000;
        const score = Math.max(500, Math.floor(1000 - (elapsed * 150) - (moves * 40)));
        const playerNameEl = document.getElementById('playerName');
        const name = (playerNameEl && playerNameEl.value.trim().toUpperCase().slice(0, 10)) || "ANON";
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.innerText = `SOLVED IN ${elapsed.toFixed(1)}s // SCORE: ${score}`;
        
        // Attempt POST to Flask backend; fall back to localStorage if static/GitHub Pages
        fetch('/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score, time: elapsed, moves })
        })
        .then(r => {
            if (!r.ok) throw new Error("Backend score post failed");
            return r.json();
        })
        .then(d => {
            const bestEl = document.getElementById('best');
            if (bestEl) bestEl.innerText = d.best;
            updateLeaderboardUI(d.leaderboard);
        })
        .catch(() => {
            // Client-side persistence for GitHub Pages
            saveLocalScore(name, score, elapsed, moves);
        });
    }
}

function render() {
    const board = document.getElementById('board');
    if (!board) return;
    board.innerHTML = '';
    state.forEach((val, idx) => {
        const tile = document.createElement('div');
        if (val === 0 && !won) {
            tile.className = 'tile empty';
        } else {
            tile.className = 'tile';
            const origIdx = val === 0 ? 8 : val - 1;
            const x = (origIdx % 3) * -100;
            const y = Math.floor(origIdx / 3) * -100;
            tile.style.backgroundImage = `url('${currentImg}')`;
            tile.style.backgroundPosition = `${x}px ${y}px`;
            tile.innerText = val || 9;
            tile.onclick = () => moveTile(idx);
        }
        board.appendChild(tile);
    });
}

window.addEventListener('keydown', e => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (e.code === 'Space') {
        e.preventDefault();
        const peekEl = document.getElementById('peek');
        if (peekEl) peekEl.style.display = 'block';
    }
    const empty = state.indexOf(0), r = Math.floor(empty / 3), c = empty % 3;
    if (e.code === 'ArrowUp' && r < 2) moveTile(empty + 3);
    if (e.code === 'ArrowDown' && r > 0) moveTile(empty - 3);
    if (e.code === 'ArrowLeft' && c < 2) moveTile(empty + 1);
    if (e.code === 'ArrowRight' && c > 0) moveTile(empty - 1);
});

window.addEventListener('keyup', e => {
    if (e.code === 'Space') {
        const peekEl = document.getElementById('peek');
        if (peekEl) peekEl.style.display = 'none';
    }
});

initGame();
loadLeaderboard();
