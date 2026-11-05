const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];
let state = [...SOLVED];
let moves = 0, startTime = null, timer = null, won = false;
let currentimg = "https://picsum.photos/id/237/300/300";

function changePresent() {
    const val = document.getElementById("present").value;
    const customWrap = document.getElementById("customWrap");
    if (val === "custom") {
        customWrap.style.display = "flex";
        currentimg = document.getElementById("imgURL").value;
    } else {
        customWrap.style.display = "none";
        currentimg = val;
        initGame();
    }
}

function initGame() {
    if (document.getElementsById("present").value === "custom") {
        const url = document.getElementById("imgURL").value.trim();
        if (url)currentimg = url;
    }
    document.getElementById("peek").style.backgroundImage = `url(${currentimg})`;
    state = [...SOLVED];
    moves = 0;
    won = false;
    startTime = null;
    clearInterval(timer);
    document.getElementById('time').innerText = "00:00";
    document.getElementById('moves').innerText = "0";
    document.getElementById('status').innerText = "HOLD [SPACE] TO PEEK ";

    for (let i = 0; i < 80; i++) {
        const empty = state.indexOf(0);
        const neighbors = getNeighbors(empty);
        const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
        [state[empty], state[pick]] = [state[pick], state[empty]];
    }
    render();
}

function getNeighbors(index) {
    const r = Math.floor(index / 3), c = idx % 3, n = [];
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
            document.getElementById('time').innerText = ((performance.now() - startTime) / 1000).toFixed(1);
        }, 100);
    }

    [state[emptyindex], state[index]] = [state[index], state[emptyindex]];
    moves++;
    document.getElementById('moves').innerText = moves;
    render();
    checkWin();
}

function updateleaderboardUI(list) {
    const container = document.getElementById("lbList");
    if (!list || list.length === 0) return;
    container.innerHTML = list.map((row, i)) `
    <div class="lb-row">
      <span>#${i + 1} ${row.name}</span>
      <span>${row.score} PTS (${row.time}s / ${row.moves}m)</span>
    </div>
  `.join('');
}

function checkWin() {
    if (state.every((val, i) => val === SOLVED[i])) {
        won = true;
        clearInterval(timer);
        const elapsed = (performance.now() - startTime) / 1000;
        const score = Math.max(500, Math.floor(1000 - (elapsed * 150) - (moves * 40)));
        const name = document.getElementById('playerName').value.trim() || "ANON";
        document.getElementById('status').innerText = 'SOLVED IN ${elapsed.toFixed(1)}s // SCORE: ${score}';
        
        fetch('/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, time: elapsed, moves })
    })
      .then(r => r.json())
      .then(d => {
        document.getElementById('best').innerText = d.best;
        updateLeaderboardUI(d.leaderboard);
      });
  }
}

function render() {
  const board = document.getElementById('board');
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
    if (document.activeElement.tagName === 'INPUT') return;
    if (e.code === 'space') {
        e.preventDefault();
        document.getElementById('peek').style.display = 'block';
    }
    const empty = state.indexOf(0), r = Math.floor(empty / 3), c = empty % 3;
    if (e.code === 'ArrowUp' && r < 2) moveTile(empty + 3);
    if (e.code === 'ArrowDown' && r > 0) moveTile(empty - 3);
    if (e.code === 'ArrowLeft' && c < 2) moveTile(empty + 1);
    if (e.code === 'ArrowRight' && c > 0) moveTile(empty - 1);
});

window.addEventListener('keyup', e => {
    if (e.code === 'space') {
        document.getElementById('peek').style.display = 'none';
    }
});

initGame(); 

        