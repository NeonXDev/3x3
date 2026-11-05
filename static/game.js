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
    if (!container || !list || list.length === 0) return;
    container.innerHTML = list.map((row, i) => `
    <div class="lb-row">
      <span>#${i + 1} ${row.name}</span>
      <span>${row.score} PTS (${row.time}s / ${row.moves}m)</span>
    </div>
  `).join('');
}

function checkWin() {
    if (state.every((val, i) => val === SOLVED[i])) {
        won = true;
        clearInterval(timer);
        const elapsed = (performance.now() - startTime) / 1000;
        const score = Math.max(500, Math.floor(1000 - (elapsed * 150) - (moves * 40)));
        const playerNameEl = document.getElementById('playerName');
        const name = (playerNameEl && playerNameEl.value.trim()) || "ANON";
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.innerText = `SOLVED IN ${elapsed.toFixed(1)}s // SCORE: ${score}`;
        
        fetch('/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score, time: elapsed, moves })
        })
        .then(r => r.json())
        .then(d => {
            const bestEl = document.getElementById('best');
            if (bestEl) bestEl.innerText = d.best;
            updateLeaderboardUI(d.leaderboard);
        })
        .catch(err => console.error("Error submitting score:", err));
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
