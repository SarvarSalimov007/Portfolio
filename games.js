// ============================
// SARVAR SALIMOV — Mini Games
// 6 Browser Games with Premium UI
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

})();
