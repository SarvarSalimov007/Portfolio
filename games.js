// ============================
// SARVAR SALIMOV — Mini Games
// 11 Browser Games with Premium UI
// ============================

(() => {
  'use strict';

  // DOM refs
  const modal = document.getElementById('gameModal');
  const modalTitle = document.getElementById('gameModalTitle');
  const container = document.getElementById('gameContainer');
  const scoreEl = document.getElementById('gameScore');
  const closeBtn = document.getElementById('gameCloseBtn');
  const restartBtn = document.getElementById('gameRestartBtn');

  if (!modal || !container) return;

  let currentGame = null;
  let gameCleanup = null;

  // --- Modal Controls ---
  function openGame(name) {
    currentGame = name;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    container.innerHTML = '';
    scoreEl.textContent = '';

    const games = {
      tictactoe: { title: '❌⭕ Krestik-Nolik', init: initTicTacToe },
      snake: { title: '🐍 Ilon O\'yini', init: initSnake },
      memory: { title: '🧠 Xotira O\'yini', init: initMemory },
      flappy: { title: '🐦 Flappy Bird', init: initFlappy },
      game2048: { title: '🔢 2048', init: init2048 },
      tetris: { title: '🧱 Tetris', init: initTetris },
      pong: { title: '🏓 Pong', init: initPong },
      minesweeper: { title: '💣 Minesweeper', init: initMinesweeper },
      colormatch: { title: '🎨 Rang Topish', init: initColorMatch },
      spacewaves: { title: '🚀 Space Waves', init: initSpaceWaves },
      geodash: { title: '🔷 Geometry Dash', init: initGeoDash },
    };

    const game = games[name];
    if (game) {
      modalTitle.textContent = game.title;
      gameCleanup = game.init() || null;
    }
  }

  function closeGame() {
    if (gameCleanup) { gameCleanup(); gameCleanup = null; }
    modal.hidden = true;
    document.body.style.overflow = '';
    container.innerHTML = '';
    currentGame = null;
  }

  closeBtn.addEventListener('click', closeGame);
  restartBtn.addEventListener('click', () => { if (currentGame) openGame(currentGame); });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeGame(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeGame(); });

  // Play buttons
  document.querySelectorAll('.btn-play').forEach(btn => {
    btn.addEventListener('click', () => openGame(btn.dataset.game));
  });

  // ============================================================
  // 1. TIC-TAC-TOE (vs AI)
  // ============================================================
  function initTicTacToe() {
    let board = Array(9).fill('');
    let gameOver = false;
    let playerTurn = true;

    const wrapper = document.createElement('div');
    const status = document.createElement('div');
    status.className = 'ttt-status';
    status.textContent = 'Sizning navbatingiz (X)';
    wrapper.appendChild(status);

    const boardEl = document.createElement('div');
    boardEl.className = 'ttt-board';
    wrapper.appendChild(boardEl);

    const cells = [];
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('button');
      cell.className = 'ttt-cell';
      cell.dataset.idx = i;
      cell.addEventListener('click', () => handleClick(i));
      boardEl.appendChild(cell);
      cells.push(cell);
    }
    container.appendChild(wrapper);

    const winLines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    function checkWin(b, mark) {
      for (const line of winLines) {
        if (line.every(i => b[i] === mark)) return line;
      }
      return null;
    }

    function handleClick(idx) {
      if (gameOver || !playerTurn || board[idx]) return;
      board[idx] = 'X';
      cells[idx].textContent = 'X';
      cells[idx].classList.add('x', 'taken');
      playerTurn = false;

      const win = checkWin(board, 'X');
      if (win) { endGame('Siz yutdingiz! 🎉', win); return; }
      if (board.every(c => c)) { endGame('Durrang! 🤝', null); return; }

      status.textContent = 'Kompyuter o\'ylayapti...';
      setTimeout(aiMove, 400);
    }

    function aiMove() {
      if (gameOver) return;
      // Simple AI: win > block > center > corner > random
      let move = findBestMove();
      board[move] = 'O';
      cells[move].textContent = 'O';
      cells[move].classList.add('o', 'taken');

      const win = checkWin(board, 'O');
      if (win) { endGame('Kompyuter yutdi! 😅', win); return; }
      if (board.every(c => c)) { endGame('Durrang! 🤝', null); return; }

      playerTurn = true;
      status.textContent = 'Sizning navbatingiz (X)';
    }

    function findBestMove() {
      const empty = board.map((v, i) => v === '' ? i : -1).filter(i => i >= 0);
      // Try to win
      for (const i of empty) { board[i] = 'O'; if (checkWin(board, 'O')) { board[i] = ''; return i; } board[i] = ''; }
      // Block player
      for (const i of empty) { board[i] = 'X'; if (checkWin(board, 'X')) { board[i] = ''; return i; } board[i] = ''; }
      // Center
      if (empty.includes(4)) return 4;
      // Corners
      const corners = [0,2,6,8].filter(i => empty.includes(i));
      if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
      return empty[Math.floor(Math.random() * empty.length)];
    }

    function endGame(msg, winLine) {
      gameOver = true;
      status.textContent = msg;
      if (winLine) winLine.forEach(i => cells[i].classList.add('win'));
    }
  }

  // ============================================================
  // 2. SNAKE GAME
  // ============================================================
  function initSnake() {
    const W = 400, H = 400, CELL = 20;
    const cols = W / CELL, rows = H / CELL;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'game-canvas';
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.appendChild(canvas);
    container.appendChild(wrap);

    // Mobile controls
    const mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-controls';
    ['⬆','⬅','⬇','➡'].forEach((icon,i) => {
      const btn = document.createElement('button');
      btn.className = 'mobile-btn';
      btn.textContent = icon;
      const dirs = [{x:0,y:-1},{x:-1,y:0},{x:0,y:1},{x:1,y:0}];
      btn.addEventListener('click', () => {
        const d = dirs[i];
        if (d.x !== -dir.x || d.y !== -dir.y) { dir = d; }
      });
      mobileControls.appendChild(btn);
    });
    container.appendChild(mobileControls);

    const ctx = canvas.getContext('2d');
    let snake = [{x:5,y:5},{x:4,y:5},{x:3,y:5}];
    let dir = {x:1,y:0};
    let food = spawnFood();
    let score = 0;
    let gameOver = false;
    let interval;

    scoreEl.innerHTML = 'Ball: <strong>0</strong>';

    function spawnFood() {
      let pos;
      do {
        pos = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) };
      } while (snake.some(s => s.x === pos.x && s.y === pos.y));
      return pos;
    }

    function draw() {
      // Background
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0,0,W,H);
      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      for (let x = 0; x < W; x += CELL) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += CELL) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Food
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00D4AA';
      ctx.fillStyle = '#00D4AA';
      ctx.beginPath();
      ctx.arc(food.x*CELL+CELL/2, food.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Snake
      snake.forEach((seg,i) => {
        const alpha = 1 - (i / snake.length) * 0.5;
        if (i===0) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#6C63FF';
          ctx.fillStyle = '#6C63FF';
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(108,99,255,${alpha})`;
        }
        const r = 4;
        const x = seg.x*CELL+1, y = seg.y*CELL+1, w = CELL-2, h = CELL-2;
        ctx.beginPath();
        ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
        ctx.fill();
      });
    }

    function update() {
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      // Walls
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) { endSnake(); return; }
      // Self collision
      if (snake.some(s => s.x === head.x && s.y === head.y)) { endSnake(); return; }

      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerHTML = `Ball: <strong>${score}</strong>`;
        food = spawnFood();
      } else {
        snake.pop();
      }
      draw();
    }

    function endSnake() {
      gameOver = true;
      clearInterval(interval);
      scoreEl.innerHTML = `O'yin tugadi! Ball: <strong>${score}</strong>`;
    }

    function onKey(e) {
      if (gameOver) return;
      const dirs = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0} };
      const d = dirs[e.key];
      if (d && (d.x !== -dir.x || d.y !== -dir.y)) { dir = d; e.preventDefault(); }
    }

    document.addEventListener('keydown', onKey);
    draw();
    interval = setInterval(update, 120);

    return () => { clearInterval(interval); document.removeEventListener('keydown', onKey); };
  }

  // ============================================================
  // 3. MEMORY CARDS
  // ============================================================
  function initMemory() {
    const emojis = ['🎮','🚀','💎','🎨','⚡','🌟','🎯','🔥'];
    let cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    let flipped = [];
    let matched = 0;
    let moves = 0;
    let locked = false;

    const boardEl = document.createElement('div');
    boardEl.className = 'memory-board';

    const cardEls = cards.map((emoji, i) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-front">${emoji}</div>
          <div class="memory-card-back">?</div>
        </div>`;
      card.addEventListener('click', () => flipCard(card, i));
      boardEl.appendChild(card);
      return card;
    });

    container.appendChild(boardEl);
    scoreEl.innerHTML = 'Urinishlar: <strong>0</strong>';

    function flipCard(cardEl, idx) {
      if (locked || flipped.length >= 2 || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

      cardEl.classList.add('flipped');
      flipped.push({ el: cardEl, idx, emoji: cards[idx] });

      if (flipped.length === 2) {
        moves++;
        scoreEl.innerHTML = `Urinishlar: <strong>${moves}</strong>`;
        locked = true;

        if (flipped[0].emoji === flipped[1].emoji) {
          flipped.forEach(f => f.el.classList.add('matched'));
          matched += 2;
          flipped = [];
          locked = false;

          if (matched === cards.length) {
            scoreEl.innerHTML = `🎉 Tabriklaymiz! <strong>${moves}</strong> urinishda yutdingiz!`;
          }
        } else {
          setTimeout(() => {
            flipped.forEach(f => f.el.classList.remove('flipped'));
            flipped = [];
            locked = false;
          }, 800);
        }
      }
    }
  }

  // ============================================================
  // 4. FLAPPY BIRD
  // ============================================================
  function initFlappy() {
    const W = 320, H = 480;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'game-canvas';
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.appendChild(canvas);
    container.appendChild(wrap);

    const ctx = canvas.getContext('2d');
    const GRAVITY = 0.35;
    const FLAP = -6;
    const PIPE_W = 52;
    const GAP = 140;
    const PIPE_SPEED = 2.2;
    const BIRD_SIZE = 18;

    let bird = { x: 80, y: H/2, vy: 0 };
    let pipes = [];
    let score = 0;
    let frame = 0;
    let gameOver = false;
    let started = false;
    let animId;

    scoreEl.innerHTML = 'Ball: <strong>0</strong> — Boshlash uchun bosing!';

    function flap() {
      if (gameOver) return;
      if (!started) started = true;
      bird.vy = FLAP;
    }

    canvas.addEventListener('click', flap);
    function onKey(e) {
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); flap(); }
    }
    document.addEventListener('keydown', onKey);

    function spawnPipe() {
      const minY = 60, maxY = H - GAP - 60;
      const topH = minY + Math.random() * (maxY - minY);
      pipes.push({ x: W, topH, passed: false });
    }

    function drawBird() {
      ctx.save();
      ctx.translate(bird.x, bird.y);
      const angle = Math.min(bird.vy * 3, 30) * Math.PI / 180;
      ctx.rotate(angle);

      // Body
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#FFD700';
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.ellipse(0, 0, BIRD_SIZE, BIRD_SIZE * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(8, -5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(9, -5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.moveTo(BIRD_SIZE, -3);
      ctx.lineTo(BIRD_SIZE + 10, 0);
      ctx.lineTo(BIRD_SIZE, 5);
      ctx.closePath();
      ctx.fill();

      // Wing
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.ellipse(-4, 3, 10, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawPipe(p) {
      const grad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
      grad.addColorStop(0, '#2ecc71');
      grad.addColorStop(0.5, '#27ae60');
      grad.addColorStop(1, '#229954');

      // Top pipe
      ctx.fillStyle = grad;
      ctx.fillRect(p.x, 0, PIPE_W, p.topH);
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(p.x - 3, p.topH - 20, PIPE_W + 6, 20);

      // Bottom pipe
      const botY = p.topH + GAP;
      ctx.fillStyle = grad;
      ctx.fillRect(p.x, botY, PIPE_W, H - botY);
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(p.x - 3, botY, PIPE_W + 6, 20);
    }

    function loop() {
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#0B0F1A');
      skyGrad.addColorStop(1, '#1a1f3a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      for (let i = 0; i < 20; i++) {
        const sx = (i * 47 + frame * 0.2) % W;
        const sy = (i * 31) % (H - 60);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Ground
      ctx.fillStyle = '#1a3a1a';
      ctx.fillRect(0, H - 20, W, 20);
      ctx.fillStyle = '#2d5a2d';
      ctx.fillRect(0, H - 20, W, 3);

      if (started && !gameOver) {
        bird.vy += GRAVITY;
        bird.y += bird.vy;

        // Spawn pipes
        if (frame % 90 === 0) spawnPipe();

        // Move pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
          pipes[i].x -= PIPE_SPEED;
          if (pipes[i].x + PIPE_W < 0) { pipes.splice(i, 1); continue; }
          // Score
          if (!pipes[i].passed && pipes[i].x + PIPE_W < bird.x) {
            pipes[i].passed = true;
            score++;
            scoreEl.innerHTML = `Ball: <strong>${score}</strong>`;
          }
          // Collision
          if (bird.x + BIRD_SIZE > pipes[i].x && bird.x - BIRD_SIZE < pipes[i].x + PIPE_W) {
            if (bird.y - BIRD_SIZE * 0.7 < pipes[i].topH || bird.y + BIRD_SIZE * 0.7 > pipes[i].topH + GAP) {
              endFlappy();
            }
          }
        }
        // Floor/ceiling
        if (bird.y + BIRD_SIZE > H - 20 || bird.y - BIRD_SIZE < 0) endFlappy();
        frame++;
      }

      pipes.forEach(drawPipe);
      drawBird();

      if (!started) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Boshlash uchun bosing!', W/2, H/2);
      }

      if (!gameOver) animId = requestAnimationFrame(loop);
    }

    function endFlappy() {
      gameOver = true;
      scoreEl.innerHTML = `O'yin tugadi! Ball: <strong>${score}</strong>`;
    }

    animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); document.removeEventListener('keydown', onKey); };
  }

  // ============================================================
  // 5. 2048
  // ============================================================
  function init2048() {
    let grid = Array(16).fill(0);
    let score2048 = 0;
    let gameOver = false;

    const wrapper = document.createElement('div');
    const boardEl = document.createElement('div');
    boardEl.className = 'game-2048-board';

    const tileEls = [];
    for (let i = 0; i < 16; i++) {
      const tile = document.createElement('div');
      tile.className = 'tile-2048';
      boardEl.appendChild(tile);
      tileEls.push(tile);
    }

    wrapper.appendChild(boardEl);

    // Mobile controls
    const mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-controls';
    ['⬆','⬅','⬇','➡'].forEach((icon,i) => {
      const btn = document.createElement('button');
      btn.className = 'mobile-btn';
      btn.textContent = icon;
      const dirs = ['up','left','down','right'];
      btn.addEventListener('click', () => move2048(dirs[i]));
      mobileControls.appendChild(btn);
    });
    wrapper.appendChild(mobileControls);
    container.appendChild(wrapper);

    addRandom(); addRandom();
    render2048();
    scoreEl.innerHTML = 'Ball: <strong>0</strong>';

    function addRandom() {
      const empty = grid.map((v,i) => v === 0 ? i : -1).filter(i => i >= 0);
      if (!empty.length) return;
      const idx = empty[Math.floor(Math.random() * empty.length)];
      grid[idx] = Math.random() < 0.9 ? 2 : 4;
    }

    function render2048() {
      tileEls.forEach((el, i) => {
        const v = grid[i];
        el.textContent = v || '';
        el.setAttribute('data-val', v || '0');
      });
    }

    function move2048(dir) {
      if (gameOver) return;
      let moved = false;

      function getLine(idx, dir) {
        const lines = { up: [], down: [], left: [], right: [] };
        for (let i = 0; i < 4; i++) {
          if (dir === 'up') lines[dir].push(idx + i * 4);
          else if (dir === 'down') lines[dir].push(idx + (3 - i) * 4);
          else if (dir === 'left') lines[dir].push(idx * 4 + i);
          else lines[dir].push(idx * 4 + (3 - i));
        }
        return lines[dir];
      }

      for (let i = 0; i < 4; i++) {
        const line = getLine(i, dir);
        const vals = line.map(idx => grid[idx]).filter(v => v > 0);
        const merged = [];

        for (let j = 0; j < vals.length; j++) {
          if (j + 1 < vals.length && vals[j] === vals[j + 1]) {
            merged.push(vals[j] * 2);
            score2048 += vals[j] * 2;
            j++;
          } else {
            merged.push(vals[j]);
          }
        }

        while (merged.length < 4) merged.push(0);

        for (let j = 0; j < 4; j++) {
          if (grid[line[j]] !== merged[j]) moved = true;
          grid[line[j]] = merged[j];
        }
      }

      if (moved) {
        addRandom();
        render2048();
        scoreEl.innerHTML = `Ball: <strong>${score2048}</strong>`;

        // Check win
        if (grid.includes(2048)) {
          scoreEl.innerHTML = `🎉 2048 ga yetdingiz! Ball: <strong>${score2048}</strong>`;
        }

        // Check game over
        if (!grid.includes(0)) {
          let canMove = false;
          for (let r = 0; r < 4 && !canMove; r++) {
            for (let c = 0; c < 4 && !canMove; c++) {
              const v = grid[r*4+c];
              if (c < 3 && v === grid[r*4+c+1]) canMove = true;
              if (r < 3 && v === grid[(r+1)*4+c]) canMove = true;
            }
          }
          if (!canMove) {
            gameOver = true;
            scoreEl.innerHTML = `O'yin tugadi! Ball: <strong>${score2048}</strong>`;
          }
        }
      }
    }

    function onKey(e) {
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (map[e.key]) { e.preventDefault(); move2048(map[e.key]); }
    }

    // Touch / swipe support
    let touchStart = null;
    function onTouchStart(e) { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
    function onTouchEnd(e) {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      const absDx = Math.abs(dx), absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) < 30) return;
      if (absDx > absDy) move2048(dx > 0 ? 'right' : 'left');
      else move2048(dy > 0 ? 'down' : 'up');
      touchStart = null;
    }

    document.addEventListener('keydown', onKey);
    boardEl.addEventListener('touchstart', onTouchStart, { passive: true });
    boardEl.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('keydown', onKey);
      boardEl.removeEventListener('touchstart', onTouchStart);
      boardEl.removeEventListener('touchend', onTouchEnd);
    };
  }

  // ============================================================
  // 6. TETRIS
  // ============================================================
  function initTetris() {
    const COLS = 10, ROWS = 20, BLOCK = 24;
    const canvas = document.createElement('canvas');
    canvas.width = COLS * BLOCK;
    canvas.height = ROWS * BLOCK;
    canvas.className = 'tetris-board';

    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = 4 * BLOCK;
    nextCanvas.height = 4 * BLOCK;

    const wrapper = document.createElement('div');
    wrapper.className = 'tetris-wrapper';

    wrapper.appendChild(canvas);

    const side = document.createElement('div');
    side.className = 'tetris-side';

    const nextBox = document.createElement('div');
    nextBox.className = 'tetris-next';
    nextBox.innerHTML = '<p>Keyingi</p>';
    nextBox.appendChild(nextCanvas);
    side.appendChild(nextBox);

    const scoreBox = document.createElement('div');
    scoreBox.className = 'tetris-info';
    scoreBox.innerHTML = 'Ball<span id="tetScore">0</span>';
    side.appendChild(scoreBox);

    const linesBox = document.createElement('div');
    linesBox.className = 'tetris-info';
    linesBox.innerHTML = 'Qatorlar<span id="tetLines">0</span>';
    side.appendChild(linesBox);

    wrapper.appendChild(side);

    // Mobile controls
    const mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-controls';
    mobileControls.style.width = '100%';
    const controlData = [
      {icon:'⬅', key:'ArrowLeft'}, {icon:'⬇', key:'ArrowDown'},
      {icon:'🔄', key:'ArrowUp'}, {icon:'➡', key:'ArrowRight'}
    ];
    controlData.forEach(({icon, key}) => {
      const btn = document.createElement('button');
      btn.className = 'mobile-btn';
      btn.textContent = icon;
      btn.addEventListener('click', () => {
        document.dispatchEvent(new KeyboardEvent('keydown', {key}));
      });
      mobileControls.appendChild(btn);
    });

    const outerWrap = document.createElement('div');
    outerWrap.appendChild(wrapper);
    outerWrap.appendChild(mobileControls);
    container.appendChild(outerWrap);

    const ctx = canvas.getContext('2d');
    const nctx = nextCanvas.getContext('2d');

    const SHAPES = [
      { shape: [[1,1,1,1]], color: '#00D4AA' },            // I
      { shape: [[1,1],[1,1]], color: '#FFD700' },           // O
      { shape: [[0,1,0],[1,1,1]], color: '#6C63FF' },       // T
      { shape: [[1,0],[1,0],[1,1]], color: '#FF6B9D' },     // L
      { shape: [[0,1],[0,1],[1,1]], color: '#FF6347' },     // J
      { shape: [[0,1,1],[1,1,0]], color: '#00D4AA' },       // S
      { shape: [[1,1,0],[0,1,1]], color: '#8B83FF' },       // Z
    ];

    let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    let colorBoard = Array.from({length: ROWS}, () => Array(COLS).fill(''));
    let current, next, pos, score = 0, lines = 0, gameOver = false, dropInterval, dropSpeed = 500;

    function randomPiece() {
      const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      return { shape: s.shape.map(r => [...r]), color: s.color };
    }

    function rotate(shape) {
      const rows = shape.length, cols = shape[0].length;
      const rotated = Array.from({length: cols}, (_, c) =>
        Array.from({length: rows}, (_, r) => shape[rows - 1 - r][c])
      );
      return rotated;
    }

    function valid(shape, px, py) {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const nx = px + c, ny = py + r;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
          if (ny >= 0 && board[ny][nx]) return false;
        }
      }
      return true;
    }

    function place() {
      for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
          if (!current.shape[r][c]) continue;
          const ny = pos.y + r;
          if (ny < 0) { gameOver = true; return; }
          board[ny][pos.x + c] = 1;
          colorBoard[ny][pos.x + c] = current.color;
        }
      }
      clearLines();
      spawn();
    }

    function clearLines() {
      let cleared = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(c => c)) {
          board.splice(r, 1);
          board.unshift(Array(COLS).fill(0));
          colorBoard.splice(r, 1);
          colorBoard.unshift(Array(COLS).fill(''));
          cleared++;
          r++;
        }
      }
      if (cleared) {
        const pts = [0, 100, 300, 500, 800];
        score += pts[cleared] || 800;
        lines += cleared;
        document.getElementById('tetScore').textContent = score;
        document.getElementById('tetLines').textContent = lines;
        // Speed up
        dropSpeed = Math.max(100, 500 - lines * 15);
        clearInterval(dropInterval);
        dropInterval = setInterval(drop, dropSpeed);
      }
    }

    function spawn() {
      current = next || randomPiece();
      next = randomPiece();
      pos = { x: Math.floor((COLS - current.shape[0].length) / 2), y: -current.shape.length };
      drawNext();
      if (!valid(current.shape, pos.x, pos.y + 1) && pos.y <= 0) {
        gameOver = true;
      }
    }

    function drop() {
      if (gameOver) { endTetris(); return; }
      if (valid(current.shape, pos.x, pos.y + 1)) {
        pos.y++;
      } else {
        place();
        if (gameOver) { endTetris(); return; }
      }
      drawBoard();
    }

    function drawBlock(context, x, y, color, size = BLOCK) {
      context.fillStyle = color;
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      // Highlight
      context.fillStyle = 'rgba(255,255,255,0.15)';
      context.fillRect(x * size + 1, y * size + 1, size - 2, 3);
      context.fillRect(x * size + 1, y * size + 1, 3, size - 2);
    }

    function drawBoard() {
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*BLOCK,0); ctx.lineTo(x*BLOCK,ROWS*BLOCK); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*BLOCK); ctx.lineTo(COLS*BLOCK,y*BLOCK); ctx.stroke(); }

      // Placed blocks
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (board[r][c]) drawBlock(ctx, c, r, colorBoard[r][c]);
        }
      }
      // Current piece + ghost
      if (current) {
        // Ghost
        let ghostY = pos.y;
        while (valid(current.shape, pos.x, ghostY + 1)) ghostY++;
        for (let r = 0; r < current.shape.length; r++) {
          for (let c = 0; c < current.shape[r].length; c++) {
            if (current.shape[r][c] && ghostY + r >= 0) {
              ctx.fillStyle = 'rgba(255,255,255,0.05)';
              ctx.fillRect((pos.x+c)*BLOCK+1, (ghostY+r)*BLOCK+1, BLOCK-2, BLOCK-2);
            }
          }
        }
        // Actual
        for (let r = 0; r < current.shape.length; r++) {
          for (let c = 0; c < current.shape[r].length; c++) {
            if (current.shape[r][c] && pos.y + r >= 0) {
              drawBlock(ctx, pos.x + c, pos.y + r, current.color);
            }
          }
        }
      }
    }

    function drawNext() {
      nctx.fillStyle = '#0a0e1a';
      nctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
      if (!next) return;
      const offsetX = Math.floor((4 - next.shape[0].length) / 2);
      const offsetY = Math.floor((4 - next.shape.length) / 2);
      for (let r = 0; r < next.shape.length; r++) {
        for (let c = 0; c < next.shape[r].length; c++) {
          if (next.shape[r][c]) drawBlock(nctx, offsetX + c, offsetY + r, next.color);
        }
      }
    }

    function onKey(e) {
      if (gameOver) return;
      switch (e.key) {
        case 'ArrowLeft':
          if (valid(current.shape, pos.x - 1, pos.y)) pos.x--;
          break;
        case 'ArrowRight':
          if (valid(current.shape, pos.x + 1, pos.y)) pos.x++;
          break;
        case 'ArrowDown':
          if (valid(current.shape, pos.x, pos.y + 1)) pos.y++;
          break;
        case 'ArrowUp': {
          const rotated = rotate(current.shape);
          if (valid(rotated, pos.x, pos.y)) current.shape = rotated;
          else if (valid(rotated, pos.x - 1, pos.y)) { current.shape = rotated; pos.x--; }
          else if (valid(rotated, pos.x + 1, pos.y)) { current.shape = rotated; pos.x++; }
          break;
        }
        case ' ':
          while (valid(current.shape, pos.x, pos.y + 1)) pos.y++;
          place();
          if (gameOver) { endTetris(); return; }
          break;
      }
      e.preventDefault();
      drawBoard();
    }

    function endTetris() {
      clearInterval(dropInterval);
      scoreEl.innerHTML = `O'yin tugadi! Ball: <strong>${score}</strong> | Qatorlar: <strong>${lines}</strong>`;
      drawBoard();
    }

    document.addEventListener('keydown', onKey);
    spawn();
    drawBoard();
    dropInterval = setInterval(drop, dropSpeed);

    return () => { clearInterval(dropInterval); document.removeEventListener('keydown', onKey); };
  }

  // ============================================================
  // 7. PONG (vs AI)
  // ============================================================
  function initPong() {
    const W = 400, H = 300;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'game-canvas';
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.appendChild(canvas);
    container.appendChild(wrap);

    // Mobile controls
    const mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-controls';
    ['⬆', '⬇'].forEach((icon, i) => {
      const btn = document.createElement('button');
      btn.className = 'mobile-btn';
      btn.textContent = icon;
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[i === 0 ? 'up' : 'down'] = true; });
      btn.addEventListener('touchend', () => { keys[i === 0 ? 'up' : 'down'] = false; });
      btn.addEventListener('mousedown', () => { keys[i === 0 ? 'up' : 'down'] = true; });
      btn.addEventListener('mouseup', () => { keys[i === 0 ? 'up' : 'down'] = false; });
      mobileControls.appendChild(btn);
    });
    container.appendChild(mobileControls);

    const ctx = canvas.getContext('2d');
    const PADDLE_W = 10, PADDLE_H = 60, BALL_R = 7;
    const PLAYER_SPEED = 5, AI_SPEED = 3.5;

    let player = { y: H / 2 - PADDLE_H / 2 };
    let ai = { y: H / 2 - PADDLE_H / 2 };
    let ball = { x: W / 2, y: H / 2, vx: 3.5, vy: 2 };
    let playerScore = 0, aiScore = 0;
    let keys = { up: false, down: false };
    let animId;

    scoreEl.innerHTML = 'Siz: <strong>0</strong> — Kompyuter: <strong>0</strong>';

    function resetBall(dir) {
      ball.x = W / 2;
      ball.y = H / 2;
      const angle = (Math.random() * 0.8 - 0.4);
      const speed = 3.5 + Math.min(playerScore + aiScore, 10) * 0.15;
      ball.vx = dir * speed * Math.cos(angle);
      ball.vy = speed * Math.sin(angle);
    }

    function update() {
      // Player movement
      if (keys.up && player.y > 0) player.y -= PLAYER_SPEED;
      if (keys.down && player.y < H - PADDLE_H) player.y += PLAYER_SPEED;

      // AI movement
      const aiCenter = ai.y + PADDLE_H / 2;
      const diff = ball.y - aiCenter;
      if (Math.abs(diff) > 5) {
        ai.y += Math.sign(diff) * Math.min(AI_SPEED, Math.abs(diff));
      }
      ai.y = Math.max(0, Math.min(H - PADDLE_H, ai.y));

      // Ball movement
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Top/bottom bounce
      if (ball.y - BALL_R <= 0 || ball.y + BALL_R >= H) {
        ball.vy = -ball.vy;
        ball.y = ball.y - BALL_R <= 0 ? BALL_R : H - BALL_R;
      }

      // Player paddle collision
      if (ball.x - BALL_R <= 20 + PADDLE_W && ball.x + BALL_R >= 20 &&
          ball.y >= player.y && ball.y <= player.y + PADDLE_H && ball.vx < 0) {
        ball.vx = -ball.vx * 1.05;
        const hitPos = (ball.y - player.y) / PADDLE_H - 0.5;
        ball.vy = hitPos * 6;
        ball.x = 20 + PADDLE_W + BALL_R;
      }

      // AI paddle collision
      if (ball.x + BALL_R >= W - 20 - PADDLE_W && ball.x - BALL_R <= W - 20 &&
          ball.y >= ai.y && ball.y <= ai.y + PADDLE_H && ball.vx > 0) {
        ball.vx = -ball.vx * 1.05;
        const hitPos = (ball.y - ai.y) / PADDLE_H - 0.5;
        ball.vy = hitPos * 6;
        ball.x = W - 20 - PADDLE_W - BALL_R;
      }

      // Scoring
      if (ball.x < 0) {
        aiScore++;
        scoreEl.innerHTML = `Siz: <strong>${playerScore}</strong> — Kompyuter: <strong>${aiScore}</strong>`;
        if (aiScore >= 7) {
          scoreEl.innerHTML = `😅 Kompyuter yutdi! ${playerScore} : ${aiScore}`;
          cancelAnimationFrame(animId); return;
        }
        resetBall(1);
      }
      if (ball.x > W) {
        playerScore++;
        scoreEl.innerHTML = `Siz: <strong>${playerScore}</strong> — Kompyuter: <strong>${aiScore}</strong>`;
        if (playerScore >= 7) {
          scoreEl.innerHTML = `🎉 Siz yutdingiz! ${playerScore} : ${aiScore}`;
          cancelAnimationFrame(animId); return;
        }
        resetBall(-1);
      }
    }

    function draw() {
      // Background
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, W, H);

      // Center line
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Scores in background
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.font = 'bold 64px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(playerScore, W / 4, 80);
      ctx.fillText(aiScore, 3 * W / 4, 80);

      // Player paddle
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#6C63FF';
      ctx.fillStyle = '#6C63FF';
      ctx.fillRect(20, player.y, PADDLE_W, PADDLE_H);
      ctx.shadowBlur = 0;

      // AI paddle
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#FF6B9D';
      ctx.fillStyle = '#FF6B9D';
      ctx.fillRect(W - 20 - PADDLE_W, ai.y, PADDLE_W, PADDLE_H);
      ctx.shadowBlur = 0;

      // Ball
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00D4AA';
      ctx.fillStyle = '#00D4AA';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function loop() {
      update();
      draw();
      animId = requestAnimationFrame(loop);
    }

    function onKey(e) {
      if (e.key === 'ArrowUp' || e.key === 'w') { keys.up = e.type === 'keydown'; e.preventDefault(); }
      if (e.key === 'ArrowDown' || e.key === 's') { keys.down = e.type === 'keydown'; e.preventDefault(); }
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKey);
    };
  }

  // ============================================================
  // 8. MINESWEEPER
  // ============================================================
  function initMinesweeper() {
    const ROWS = 10, COLS = 10, MINES = 15;
    let grid = [];
    let revealed = [];
    let flagged = [];
    let gameOver = false;
    let won = false;
    let firstClick = true;
    let flagCount = 0;

    const wrapper = document.createElement('div');

    const infoBar = document.createElement('div');
    infoBar.className = 'mine-info';
    infoBar.innerHTML = `💣 <strong>${MINES}</strong> ta mina | 🚩 <span id="mFlagCount">0</span> / ${MINES}`;
    wrapper.appendChild(infoBar);

    const boardEl = document.createElement('div');
    boardEl.className = 'mine-board';
    boardEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    wrapper.appendChild(boardEl);

    const hint = document.createElement('p');
    hint.className = 'mine-hint';
    hint.textContent = '💡 O\'ng klik = bayroq qo\'yish | Chapni bosing = ochish';
    wrapper.appendChild(hint);

    container.appendChild(wrapper);

    const cellEls = [];

    // Initialize empty grid
    for (let r = 0; r < ROWS; r++) {
      grid[r] = [];
      revealed[r] = [];
      flagged[r] = [];
      cellEls[r] = [];
      for (let c = 0; c < COLS; c++) {
        grid[r][c] = 0;
        revealed[r][c] = false;
        flagged[r][c] = false;

        const cell = document.createElement('button');
        cell.className = 'mine-cell';
        cell.addEventListener('click', () => reveal(r, c));
        cell.addEventListener('contextmenu', (e) => { e.preventDefault(); toggleFlag(r, c); });

        // Long press for mobile flag
        let pressTimer;
        cell.addEventListener('touchstart', (e) => {
          pressTimer = setTimeout(() => { e.preventDefault(); toggleFlag(r, c); }, 400);
        }, { passive: false });
        cell.addEventListener('touchend', () => clearTimeout(pressTimer));
        cell.addEventListener('touchmove', () => clearTimeout(pressTimer));

        boardEl.appendChild(cell);
        cellEls[r][c] = cell;
      }
    }

    scoreEl.innerHTML = 'Minalarni toping! 💣';

    function placeMines(safeR, safeC) {
      let placed = 0;
      while (placed < MINES) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        if (grid[r][c] === -1) continue;
        if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
        grid[r][c] = -1;
        placed++;
      }
      // Calculate numbers
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c] === -1) continue;
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === -1) count++;
            }
          }
          grid[r][c] = count;
        }
      }
    }

    function reveal(r, c) {
      if (gameOver || won || flagged[r][c] || revealed[r][c]) return;

      if (firstClick) {
        firstClick = false;
        placeMines(r, c);
      }

      revealed[r][c] = true;
      const cell = cellEls[r][c];
      cell.classList.add('revealed');

      if (grid[r][c] === -1) {
        // Hit mine
        gameOver = true;
        cell.classList.add('mine-hit');
        cell.textContent = '💥';
        revealAll();
        scoreEl.innerHTML = '💥 Mina portladi! O\'yin tugadi.';
        return;
      }

      const val = grid[r][c];
      if (val > 0) {
        cell.textContent = val;
        cell.setAttribute('data-num', val);
      } else {
        // Flood fill for empty cells
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              reveal(nr, nc);
            }
          }
        }
      }

      checkWin();
    }

    function toggleFlag(r, c) {
      if (gameOver || won || revealed[r][c]) return;
      flagged[r][c] = !flagged[r][c];
      cellEls[r][c].textContent = flagged[r][c] ? '🚩' : '';
      cellEls[r][c].classList.toggle('flagged', flagged[r][c]);
      flagCount += flagged[r][c] ? 1 : -1;
      const el = document.getElementById('mFlagCount');
      if (el) el.textContent = flagCount;
    }

    function checkWin() {
      let unrevealedSafe = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!revealed[r][c] && grid[r][c] !== -1) unrevealedSafe++;
        }
      }
      if (unrevealedSafe === 0) {
        won = true;
        scoreEl.innerHTML = '🎉 Tabriklaymiz! Barcha minalarni topdingiz!';
      }
    }

    function revealAll() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c] === -1 && !revealed[r][c]) {
            cellEls[r][c].textContent = '💣';
            cellEls[r][c].classList.add('revealed', 'mine-show');
          }
        }
      }
    }
  }

  // ============================================================
  // 9. COLOR MATCH (Reaction Game)
  // ============================================================
  function initColorMatch() {
    const COLORS = [
      { name: 'Qizil', hex: '#FF4757' },
      { name: 'Ko\'k', hex: '#3742FA' },
      { name: 'Yashil', hex: '#2ED573' },
      { name: 'Sariq', hex: '#FFA502' },
      { name: 'Pushti', hex: '#FF6B9D' },
      { name: 'Binafsha', hex: '#6C63FF' },
      { name: 'Zangori', hex: '#00D4AA' },
      { name: 'To\'q sariq', hex: '#FF6348' },
    ];

    let score = 0;
    let timeLeft = 30;
    let currentColor = null;
    let displayedName = '';
    let isMatch = false;
    let gameActive = true;
    let timer = null;
    let streak = 0;
    let bestStreak = 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'color-match-wrapper';

    const timerBar = document.createElement('div');
    timerBar.className = 'cm-timer-bar';
    const timerFill = document.createElement('div');
    timerFill.className = 'cm-timer-fill';
    timerBar.appendChild(timerFill);
    wrapper.appendChild(timerBar);

    const instruction = document.createElement('p');
    instruction.className = 'cm-instruction';
    instruction.textContent = 'Rang nomi va ko\'rsatilgan rang mos keladimi?';
    wrapper.appendChild(instruction);

    const colorDisplay = document.createElement('div');
    colorDisplay.className = 'cm-color-display';
    wrapper.appendChild(colorDisplay);

    const nameDisplay = document.createElement('div');
    nameDisplay.className = 'cm-name';
    wrapper.appendChild(nameDisplay);

    const streakDisplay = document.createElement('div');
    streakDisplay.className = 'cm-streak';
    wrapper.appendChild(streakDisplay);

    const btnWrap = document.createElement('div');
    btnWrap.className = 'cm-buttons';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'btn btn-primary cm-btn cm-yes';
    yesBtn.textContent = '✅ Ha';
    yesBtn.addEventListener('click', () => answer(true));

    const noBtn = document.createElement('button');
    noBtn.className = 'btn btn-outline cm-btn cm-no';
    noBtn.textContent = '❌ Yo\'q';
    noBtn.addEventListener('click', () => answer(false));

    btnWrap.appendChild(yesBtn);
    btnWrap.appendChild(noBtn);
    wrapper.appendChild(btnWrap);

    container.appendChild(wrapper);
    scoreEl.innerHTML = 'Ball: <strong>0</strong> | ⏱ <strong>30</strong>s';

    function nextRound() {
      if (!gameActive) return;
      const actualColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      currentColor = actualColor;

      // 50% chance the name matches the shown color
      if (Math.random() < 0.5) {
        displayedName = actualColor.name;
        isMatch = true;
      } else {
        let wrongColor;
        do {
          wrongColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        } while (wrongColor.name === actualColor.name);
        displayedName = wrongColor.name;
        isMatch = false;
      }

      colorDisplay.style.background = actualColor.hex;
      colorDisplay.style.boxShadow = `0 0 30px ${actualColor.hex}40`;
      nameDisplay.textContent = displayedName;
      nameDisplay.style.color = COLORS[Math.floor(Math.random() * COLORS.length)].hex;
    }

    function answer(playerSaidYes) {
      if (!gameActive) return;
      const correct = playerSaidYes === isMatch;

      if (correct) {
        score += 10 + streak * 2;
        streak++;
        bestStreak = Math.max(bestStreak, streak);
        colorDisplay.classList.add('cm-correct');
        setTimeout(() => colorDisplay.classList.remove('cm-correct'), 200);
      } else {
        score = Math.max(0, score - 5);
        streak = 0;
        colorDisplay.classList.add('cm-wrong');
        setTimeout(() => colorDisplay.classList.remove('cm-wrong'), 200);
      }

      streakDisplay.textContent = streak > 1 ? `🔥 ${streak}x ketma-ket!` : '';
      scoreEl.innerHTML = `Ball: <strong>${score}</strong> | ⏱ <strong>${timeLeft}</strong>s`;
      nextRound();
    }

    function onKey(e) {
      if (!gameActive) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') answer(true);
      if (e.key === 'ArrowRight' || e.key === 'd') answer(false);
    }

    document.addEventListener('keydown', onKey);

    timer = setInterval(() => {
      timeLeft--;
      timerFill.style.width = (timeLeft / 30 * 100) + '%';
      if (timeLeft <= 10) timerFill.style.background = '#FF4757';
      else if (timeLeft <= 20) timerFill.style.background = '#FFA502';

      scoreEl.innerHTML = `Ball: <strong>${score}</strong> | ⏱ <strong>${timeLeft}</strong>s`;

      if (timeLeft <= 0) {
        clearInterval(timer);
        gameActive = false;
        scoreEl.innerHTML = `🏁 Vaqt tugadi! Ball: <strong>${score}</strong> | Eng yaxshi: <strong>${bestStreak}x</strong>`;
        colorDisplay.textContent = '⏱️';
        colorDisplay.style.background = 'rgba(255,255,255,0.1)';
        colorDisplay.style.boxShadow = 'none';
        colorDisplay.style.fontSize = '48px';
        colorDisplay.style.display = 'flex';
        colorDisplay.style.alignItems = 'center';
        colorDisplay.style.justifyContent = 'center';
        nameDisplay.textContent = 'O\'yin tugadi!';
        nameDisplay.style.color = '#fff';
        yesBtn.disabled = true;
        noBtn.disabled = true;
      }
    }, 1000);

    nextRound();

    return () => { clearInterval(timer); document.removeEventListener('keydown', onKey); };
  }

  // ============================================================
  // 10. SPACE WAVES (Space Shooter)
  // ============================================================
  function initSpaceWaves() {
    const W = 360, H = 500;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'game-canvas';
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.appendChild(canvas);
    container.appendChild(wrap);

    // Mobile controls
    const mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-controls';
    ['⬅', '🔫', '➡'].forEach((icon, i) => {
      const btn = document.createElement('button');
      btn.className = 'mobile-btn';
      btn.textContent = icon;
      const actions = ['left', 'shoot', 'right'];
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[actions[i]] = true; });
      btn.addEventListener('touchend', () => { keys[actions[i]] = false; });
      btn.addEventListener('mousedown', () => { keys[actions[i]] = true; });
      btn.addEventListener('mouseup', () => { keys[actions[i]] = false; });
      mobileControls.appendChild(btn);
    });
    container.appendChild(mobileControls);

    const ctx = canvas.getContext('2d');
    let player = { x: W / 2, y: H - 50, w: 28, h: 28 };
    let bullets = [];
    let enemies = [];
    let particles = [];
    let stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: Math.random() * 1.5 + 0.5, speed: Math.random() * 1.5 + 0.5
    }));
    let score = 0;
    let wave = 1;
    let gameOver = false;
    let keys = { left: false, right: false, shoot: false };
    let shootCooldown = 0;
    let animId;
    let enemySpawnTimer = 0;

    scoreEl.innerHTML = `Ball: <strong>0</strong> | To'lqin: <strong>1</strong>`;

    function spawnWave() {
      const count = 3 + wave * 2;
      for (let i = 0; i < count; i++) {
        enemies.push({
          x: 20 + Math.random() * (W - 40),
          y: -20 - Math.random() * 200,
          w: 22, h: 22,
          speed: 0.8 + wave * 0.2 + Math.random() * 0.5,
          hp: wave > 3 ? 2 : 1,
          color: wave > 3 ? '#FF6B9D' : '#FF4757'
        });
      }
    }

    function addParticles(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 20 + Math.random() * 15,
          color, size: 2 + Math.random() * 3
        });
      }
    }

    function update() {
      if (gameOver) return;

      // Player movement
      if (keys.left && player.x > 14) player.x -= 5;
      if (keys.right && player.x < W - 14) player.x += 5;

      // Shooting
      if (shootCooldown > 0) shootCooldown--;
      if (keys.shoot && shootCooldown <= 0) {
        bullets.push({ x: player.x, y: player.y - 14, vy: -7 });
        shootCooldown = 10;
      }

      // Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y += bullets[i].vy;
        if (bullets[i].y < -10) { bullets.splice(i, 1); continue; }

        // Hit detection
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j], b = bullets[i];
          if (b && Math.abs(b.x - e.x) < (e.w / 2 + 4) && Math.abs(b.y - e.y) < (e.h / 2 + 4)) {
            bullets.splice(i, 1);
            e.hp--;
            if (e.hp <= 0) {
              addParticles(e.x, e.y, e.color, 8);
              enemies.splice(j, 1);
              score += 10 * wave;
              scoreEl.innerHTML = `Ball: <strong>${score}</strong> | To'lqin: <strong>${wave}</strong>`;
            }
            break;
          }
        }
      }

      // Enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        // Hit player
        if (Math.abs(enemies[i].x - player.x) < 20 && Math.abs(enemies[i].y - player.y) < 20) {
          gameOver = true;
          addParticles(player.x, player.y, '#6C63FF', 20);
          scoreEl.innerHTML = `💥 O'yin tugadi! Ball: <strong>${score}</strong> | To'lqin: <strong>${wave}</strong>`;
          return;
        }
        // Off screen
        if (enemies[i].y > H + 20) {
          enemies.splice(i, 1);
        }
      }

      // Spawn new wave
      if (enemies.length === 0) {
        wave++;
        scoreEl.innerHTML = `Ball: <strong>${score}</strong> | To'lqin: <strong>${wave}</strong>`;
        spawnWave();
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].life--;
        if (particles[i].life <= 0) particles.splice(i, 1);
      }

      // Stars
      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      });
    }

    function draw() {
      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#05060f');
      bg.addColorStop(1, '#0a0e1a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Stars
      stars.forEach(s => {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + s.s * 0.3})`;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      });

      // Player (spaceship)
      if (!gameOver) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#6C63FF';
        ctx.fillStyle = '#6C63FF';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(-12, 12);
        ctx.lineTo(-4, 8);
        ctx.lineTo(0, 14);
        ctx.lineTo(4, 8);
        ctx.lineTo(12, 12);
        ctx.closePath();
        ctx.fill();
        // Engine glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00D4AA';
        ctx.fillStyle = '#00D4AA';
        ctx.beginPath();
        ctx.moveTo(-4, 10);
        ctx.lineTo(0, 18 + Math.random() * 4);
        ctx.lineTo(4, 10);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Bullets
      bullets.forEach(b => {
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00D4AA';
        ctx.fillStyle = '#00D4AA';
        ctx.fillRect(b.x - 1.5, b.y, 3, 10);
        ctx.shadowBlur = 0;
      });

      // Enemies
      enemies.forEach(e => {
        ctx.shadowBlur = 8;
        ctx.shadowColor = e.color;
        ctx.fillStyle = e.color;
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.beginPath();
        ctx.moveTo(0, -e.h / 2);
        ctx.lineTo(e.w / 2, 0);
        ctx.lineTo(e.w / 4, e.h / 2);
        ctx.lineTo(-e.w / 4, e.h / 2);
        ctx.lineTo(-e.w / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // Particles
      particles.forEach(p => {
        ctx.globalAlpha = p.life / 35;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      });
      ctx.globalAlpha = 1;
    }

    function loop() {
      update();
      draw();
      if (!gameOver) animId = requestAnimationFrame(loop);
      else { draw(); }
    }

    function onKeyDown(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
      if (e.key === ' ' || e.key === 'ArrowUp') { keys.shoot = true; e.preventDefault(); }
    }
    function onKeyUp(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
      if (e.key === ' ' || e.key === 'ArrowUp') keys.shoot = false;
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    spawnWave();
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }

  // ============================================================
  // 11. GEOMETRY DASH
  // ============================================================
  function initGeoDash() {
    const W = 400, H = 300;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'game-canvas';
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.appendChild(canvas);
    container.appendChild(wrap);

    const ctx = canvas.getContext('2d');
    const GROUND_Y = H - 40;
    const PLAYER_SIZE = 24;
    const GRAVITY = 0.6;
    const JUMP_FORCE = -10;
    const BASE_SPEED = 4;

    let player = { x: 60, y: GROUND_Y - PLAYER_SIZE, vy: 0, grounded: true, rotation: 0 };
    let obstacles = [];
    let bgParticles = [];
    let groundX = 0;
    let score = 0;
    let distance = 0;
    let speed = BASE_SPEED;
    let gameOver = false;
    let animId;
    let colorPhase = 0;

    // Generate background particles
    for (let i = 0; i < 25; i++) {
      bgParticles.push({
        x: Math.random() * W, y: Math.random() * (GROUND_Y - 40),
        size: 1 + Math.random() * 2, alpha: 0.1 + Math.random() * 0.3,
        speed: 0.5 + Math.random()
      });
    }

    scoreEl.innerHTML = 'Sakrash uchun bosing! 👆';

    function spawnObstacle() {
      const types = ['spike', 'spike', 'spike', 'tallspike', 'platform'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'spike') {
        obstacles.push({
          x: W + 20, y: GROUND_Y, w: 24, h: 28, type: 'spike'
        });
      } else if (type === 'tallspike') {
        obstacles.push({
          x: W + 20, y: GROUND_Y, w: 24, h: 44, type: 'spike'
        });
      } else {
        obstacles.push({
          x: W + 20, y: GROUND_Y - 50 - Math.random() * 40, w: 60, h: 12, type: 'platform'
        });
        // Spike on platform
        obstacles.push({
          x: W + 20 + 80, y: GROUND_Y, w: 24, h: 28, type: 'spike'
        });
      }
    }

    function jump() {
      if (gameOver) return;
      if (player.grounded) {
        player.vy = JUMP_FORCE;
        player.grounded = false;
      }
    }

    canvas.addEventListener('click', jump);
    function onKey(e) {
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); jump(); }
    }
    document.addEventListener('keydown', onKey);

    // Touch support
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, { passive: false });

    function update() {
      if (gameOver) return;

      distance++;
      colorPhase += 0.003;
      speed = BASE_SPEED + Math.floor(distance / 500) * 0.5;

      // Player physics
      player.vy += GRAVITY;
      player.y += player.vy;

      if (player.y >= GROUND_Y - PLAYER_SIZE) {
        player.y = GROUND_Y - PLAYER_SIZE;
        player.vy = 0;
        player.grounded = true;
      }

      // Rotation
      if (!player.grounded) {
        player.rotation += 5;
      } else {
        player.rotation = Math.round(player.rotation / 90) * 90;
      }

      // Spawn obstacles
      if (distance % Math.max(40, 80 - Math.floor(distance / 300) * 5) === 0) {
        spawnObstacle();
      }

      // Move obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= speed;
        if (obstacles[i].x + obstacles[i].w < -20) {
          obstacles.splice(i, 1);
          score++;
          scoreEl.innerHTML = `Ball: <strong>${score}</strong> | Masofa: <strong>${distance}</strong>`;
          continue;
        }

        // Collision check
        const o = obstacles[i];
        if (o.type === 'spike') {
          // Triangle collision (simplified)
          const px = player.x + PLAYER_SIZE / 2;
          const py = player.y + PLAYER_SIZE / 2;
          const cx = o.x + o.w / 2;
          const cy = o.y - o.h / 2;
          if (Math.abs(px - cx) < (PLAYER_SIZE / 2 + o.w / 2 - 6) && 
              py > cy && py < o.y + 4) {
            gameOver = true;
            scoreEl.innerHTML = `💥 O'yin tugadi! Ball: <strong>${score}</strong> | Masofa: <strong>${distance}</strong>`;
          }
        }
      }

      // Background particles
      bgParticles.forEach(p => {
        p.x -= p.speed * (speed / BASE_SPEED);
        if (p.x < -5) { p.x = W + 5; p.y = Math.random() * (GROUND_Y - 40); }
      });

      groundX = (groundX - speed) % 40;
    }

    function getThemeColor() {
      const hue = (colorPhase * 360) % 360;
      return `hsl(${hue}, 70%, 55%)`;
    }

    function draw() {
      const themeColor = getThemeColor();

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#05060f');
      bg.addColorStop(0.7, '#0a0e1a');
      bg.addColorStop(1, '#121832');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Background particles
      bgParticles.forEach(p => {
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      // Ground
      ctx.fillStyle = '#1a1f3a';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      // Ground line
      ctx.shadowBlur = 8;
      ctx.shadowColor = themeColor;
      ctx.fillStyle = themeColor;
      ctx.fillRect(0, GROUND_Y, W, 2);
      ctx.shadowBlur = 0;

      // Ground pattern
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = groundX; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Obstacles
      obstacles.forEach(o => {
        if (o.type === 'spike') {
          ctx.shadowBlur = 8;
          ctx.shadowColor = themeColor;
          ctx.fillStyle = themeColor;
          ctx.beginPath();
          ctx.moveTo(o.x + o.w / 2, o.y - o.h);
          ctx.lineTo(o.x + o.w, o.y);
          ctx.lineTo(o.x, o.y);
          ctx.closePath();
          ctx.fill();
          // Inner triangle
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.moveTo(o.x + o.w / 2, o.y - o.h + 8);
          ctx.lineTo(o.x + o.w - 5, o.y);
          ctx.lineTo(o.x + 5, o.y);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (o.type === 'platform') {
          ctx.fillStyle = themeColor;
          ctx.fillRect(o.x, o.y, o.w, o.h);
        }
      });

      // Player (rotating cube)
      ctx.save();
      ctx.translate(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2);
      ctx.rotate(player.rotation * Math.PI / 180);
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#6C63FF';
      ctx.fillStyle = '#6C63FF';
      ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
      // Inner highlight
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(-PLAYER_SIZE / 2 + 3, -PLAYER_SIZE / 2 + 3, PLAYER_SIZE - 6, PLAYER_SIZE / 2 - 3);
      // Eye
      ctx.fillStyle = '#fff';
      ctx.fillRect(2, -4, 7, 7);
      ctx.fillStyle = '#000';
      ctx.fillRect(5, -2, 3, 3);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Trail effect
      if (!player.grounded && !gameOver) {
        ctx.fillStyle = 'rgba(108,99,255,0.3)';
        for (let i = 1; i <= 3; i++) {
          ctx.globalAlpha = 0.3 - i * 0.08;
          ctx.fillRect(player.x - i * 8, player.y + 4, PLAYER_SIZE - 4, PLAYER_SIZE - 4);
        }
        ctx.globalAlpha = 1;
      }

      // Game over overlay
      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('O\'yin tugadi!', W / 2, H / 2 - 10);
        ctx.font = '16px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Masofa: ${distance}`, W / 2, H / 2 + 20);
      }
    }

    function loop() {
      update();
      draw();
      if (!gameOver) animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('keydown', onKey);
    };
  }

})();
