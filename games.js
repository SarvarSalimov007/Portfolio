// ============================
// SARVAR SALIMOV — Mini Games
// 12 Browser Games with Premium UI
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
      spacehockey: { title: '🏒 Space Hockey', init: initSpaceHockey },
      puppetfighter: { title: '🥷 Puppet Fighter 2', init: initPuppetFighter },
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
  // 10. SPACE WAVES (Geometry Dash Style - Wave Mode)
  // ============================================================
  function initSpaceWaves() {
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
    const GROUND_Y = H - 30, CEIL_Y = 30;
    const PLAYER_SIZE = 12;
    const FORWARD_SPEED = 4.5;
    const VERTICAL_SPEED = 4.5;

    let player = { x: 80, y: H / 2, vy: VERTICAL_SPEED, isUp: false };
    let path = [{ x: player.x, y: player.y }];
    let obstacles = [];
    let bgStars = Array.from({ length: 30 }, () => ({
      x: Math.random() * W, y: Math.random() * H, s: Math.random() * 2, speed: Math.random() * 0.5 + 0.5
    }));
    let score = 0;
    let distance = 0;
    let gameOver = false;
    let animId;

    scoreEl.innerHTML = 'Harakatlanish uchun bosing! ⚡';

    function spawnObstacle() {
      const h = 40 + Math.random() * 80;
      const isTop = Math.random() > 0.5;
      obstacles.push({
        x: W + 50,
        y: isTop ? CEIL_Y : GROUND_Y - h,
        w: 30, h: h,
        type: 'block'
      });
    }

    function toggle(up) { player.isUp = up; }

    canvas.addEventListener('mousedown', () => toggle(true));
    canvas.addEventListener('mouseup', () => toggle(false));
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); toggle(true); }, { passive: false });
    canvas.addEventListener('touchend', () => toggle(false));

    function onKey(e) {
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); toggle(true); }
    }
    function onKeyUp(e) {
      if (e.key === ' ' || e.key === 'ArrowUp') toggle(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);

    function update() {
      if (gameOver) return;

      distance++;
      score = Math.floor(distance / 10);
      scoreEl.innerHTML = `Ball: <strong>${score}</strong>`;

      // Player movement (Wave diagonal)
      if (player.isUp) {
        player.y -= VERTICAL_SPEED;
      } else {
        player.y += VERTICAL_SPEED;
      }

      // Border bounds
      if (player.y <= CEIL_Y || player.y >= GROUND_Y - PLAYER_SIZE) {
        gameOver = true;
        scoreEl.innerHTML = `💥 Portladi! Ball: <strong>${score}</strong>`;
      }

      // Path tracking (for the zigzag line)
      path.push({ x: player.x, y: player.y + PLAYER_SIZE / 2 });
      if (path.length > 50) path.shift();
      path.forEach(p => p.x -= FORWARD_SPEED);

      // Obstacles
      if (distance % 60 === 0) spawnObstacle();
      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= FORWARD_SPEED;
        if (obstacles[i].x < -50) { obstacles.splice(i, 1); continue; }

        // Collision
        const o = obstacles[i];
        if (player.x + PLAYER_SIZE > o.x && player.x < o.x + o.w &&
            player.y + PLAYER_SIZE > o.y && player.y < o.y + o.h) {
          gameOver = true;
          scoreEl.innerHTML = `💥 To'siq! Ball: <strong>${score}</strong>`;
        }
      }

      // Stars
      bgStars.forEach(s => {
        s.x -= s.speed + (FORWARD_SPEED * 0.2);
        if (s.x < -10) s.x = W + 10;
      });
    }

    function draw() {
      // BG
      ctx.fillStyle = '#05060f';
      ctx.fillRect(0, 0, W, H);

      // Stars
      bgStars.forEach(s => {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + s.s * 0.2})`;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      });

      // Borders
      ctx.fillStyle = '#1a1f3a';
      ctx.fillRect(0, 0, W, CEIL_Y);
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00D4AA';
      ctx.fillStyle = '#00D4AA';
      ctx.fillRect(0, CEIL_Y - 2, W, 2);
      ctx.fillRect(0, GROUND_Y, W, 2);
      ctx.shadowBlur = 0;

      // Obstacles
      obstacles.forEach(o => {
        ctx.fillStyle = '#FF6B9D';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF6B9D';
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.shadowBlur = 0;
        // Inner detail
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.strokeRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
      });

      // Zigzag path
      if (path.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#6C63FF';
        ctx.lineWidth = 3;
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
      }

      // Player (Triangle)
      ctx.save();
      ctx.translate(player.x, player.y + PLAYER_SIZE / 2);
      const angle = player.isUp ? -Math.PI / 4 : Math.PI / 4;
      ctx.rotate(angle);
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#6C63FF';
      ctx.fillStyle = '#6C63FF';
      ctx.beginPath();
      ctx.moveTo(PLAYER_SIZE, 0);
      ctx.lineTo(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2);
      ctx.lineTo(-PLAYER_SIZE / 2, PLAYER_SIZE / 2);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
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
      document.removeEventListener('keyup', onKeyUp);
    };
  }

  // ============================================================
  // 11. GEOMETRY DASH — SUB ZERO "PRESS START"
  // ============================================================
  function initGeoDash() {
    const W = 600, H = 340;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'game-canvas';
    canvas.style.width = '100%'; canvas.style.maxWidth = W + 'px';
    canvas.style.height = 'auto'; canvas.style.aspectRatio = W + '/' + H;

    const progressWrap = document.createElement('div');
    progressWrap.style.cssText = 'width:100%;max-width:' + W + 'px;margin:0 auto 8px;height:6px;background:#111;border-radius:3px;overflow:hidden;';
    const progressBar = document.createElement('div');
    progressBar.style.cssText = 'width:0%;height:100%;background:linear-gradient(90deg,#00bfff,#00ffcc);border-radius:3px;transition:width .1s;';
    progressWrap.appendChild(progressBar);

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
    wrap.appendChild(progressWrap);
    wrap.appendChild(canvas);
    container.appendChild(wrap);

    const ctx = canvas.getContext('2d');
    const GROUND_Y = H - 50;
    const SZ = 26;
    const GRAVITY = 0.65;
    const JUMP = -10.5;
    const SPEED = 5.5;
    const SHIP_GRAVITY = 0.35;
    const SHIP_THRUST = -0.7;

    // === PRE-DESIGNED LEVEL (Sub Zero "Press Start") ===
    // Types: s=spike, ds=double spike, b=block, j=jump pad, p=pillar, sp=ship portal, cp=cube portal
    const LEVEL = [
      // -- intro section --
      {t:'s', x:500}, {t:'s', x:560},
      {t:'b', x:700, h:SZ}, {t:'s', x:760},
      {t:'s', x:850}, {t:'s', x:880}, {t:'s', x:910},
      {t:'b', x:1000, h:SZ*2}, {t:'s', x:1060},
      // -- double spike section --
      {t:'ds', x:1200}, {t:'b', x:1290, h:SZ},
      {t:'s', x:1380}, {t:'ds', x:1450},
      {t:'s', x:1550}, {t:'s', x:1580}, {t:'b', x:1630, h:SZ},
      // -- pillar section --
      {t:'p', x:1780, h:SZ*3}, {t:'s', x:1850},
      {t:'p', x:1950, h:SZ*2}, {t:'s', x:2020}, {t:'s', x:2050},
      // -- ship portal transition --
      {t:'sp', x:2200},
      // Ship section – ceiling and floor spikes
      {t:'fs', x:2400, pos:'floor'}, {t:'fs', x:2500, pos:'ceil'},
      {t:'fs', x:2600, pos:'floor'}, {t:'fs', x:2650, pos:'floor'},
      {t:'fs', x:2750, pos:'ceil'}, {t:'fs', x:2850, pos:'floor'},
      {t:'fs', x:2950, pos:'ceil'}, {t:'fs', x:3000, pos:'ceil'},
      // -- cube portal back --
      {t:'cp', x:3150},
      // -- final cube section --
      {t:'s', x:3350}, {t:'ds', x:3420},
      {t:'b', x:3520, h:SZ*2}, {t:'s', x:3580}, {t:'s', x:3610},
      {t:'p', x:3700, h:SZ*3}, {t:'s', x:3770}, {t:'ds', x:3830},
      {t:'s', x:3950}, {t:'s', x:3980}, {t:'s', x:4010},
      // -- end marker --
      {t:'end', x:4200}
    ];
    const LEVEL_LENGTH = 4200;

    let mode = 'cube'; // cube or ship
    let player = {x:60, y:GROUND_Y - SZ, vy:0, grounded:true, rot:0, dead:false};
    let camX = 0;
    let attempt = 1;
    let gameOver = false;
    let won = false;
    let animId;
    let frame = 0;
    let holding = false;
    let particles = [];
    let deathParticles = [];
    let bgStars = [];

    for (let i = 0; i < 40; i++) bgStars.push({x:Math.random()*W*3, y:Math.random()*(GROUND_Y-20), s:1+Math.random()*2, a:0.1+Math.random()*0.4});

    scoreEl.innerHTML = `<span style="color:#00bfff">❄ PRESS START</span> — Urinish: <strong>${attempt}</strong> | Sakrash: Space / Tap`;

    function action(down) {
      if (won) return;
      if (gameOver) { resetLevel(); return; }
      holding = down;
      if (down && mode === 'cube' && player.grounded) {
        player.vy = JUMP;
        player.grounded = false;
      }
    }

    canvas.addEventListener('mousedown', () => action(true));
    canvas.addEventListener('mouseup', () => action(false));
    canvas.addEventListener('touchstart', e => { e.preventDefault(); action(true); }, {passive:false});
    canvas.addEventListener('touchend', () => action(false));
    function onKey(e) {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        if (e.type === 'keydown') action(true);
        else action(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);

    function resetLevel() {
      attempt++;
      mode = 'cube';
      player = {x:60, y:GROUND_Y - SZ, vy:0, grounded:true, rot:0, dead:false};
      camX = 0;
      gameOver = false;
      won = false;
      holding = false;
      deathParticles = [];
      scoreEl.innerHTML = `<span style="color:#00bfff">❄ PRESS START</span> — Urinish: <strong>${attempt}</strong>`;
    }

    function die() {
      if (gameOver) return;
      gameOver = true;
      player.dead = true;
      for (let i = 0; i < 20; i++) {
        deathParticles.push({x:player.x, y:player.y+SZ/2, vx:(Math.random()-0.5)*8, vy:(Math.random()-0.5)*8, life:40+Math.random()*20, s:3+Math.random()*5});
      }
      scoreEl.innerHTML = `💥 Yiqildingiz! Urinish: <strong>${attempt}</strong> — Bosib qayta boshlang`;
    }

    function rectCollide(ax,ay,aw,ah, bx,by,bw,bh) {
      return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
    }

    function update() {
      if (won || gameOver) return;
      frame++;
      camX += SPEED;
      const px = player.x;
      const progress = Math.min(1, camX / LEVEL_LENGTH);
      progressBar.style.width = (progress * 100) + '%';

      // Physics
      if (mode === 'cube') {
        player.vy += GRAVITY;
        player.y += player.vy;
        if (player.y >= GROUND_Y - SZ) {
          player.y = GROUND_Y - SZ;
          player.vy = 0;
          player.grounded = true;
        }
        if (!player.grounded) player.rot += 6;
        else player.rot = Math.round(player.rot / 90) * 90;
        // Hold to jump repeatedly
        if (holding && player.grounded) {
          player.vy = JUMP;
          player.grounded = false;
        }
      } else if (mode === 'ship') {
        if (holding) player.vy += SHIP_THRUST;
        else player.vy += SHIP_GRAVITY;
        player.vy = Math.max(-6, Math.min(6, player.vy));
        player.y += player.vy;
        player.rot = player.vy * 3;
        // Ceiling and floor bounds
        if (player.y < 20) { player.y = 20; player.vy = 0; }
        if (player.y >= GROUND_Y - SZ) { player.y = GROUND_Y - SZ; player.vy = 0; }
        // Trail particles
        if (frame % 2 === 0) particles.push({x:px - camX + 40, y:player.y+SZ/2, life:15, s:3, vx:-2, vy:(Math.random()-0.5)*1});
      }

      // Check level objects
      const pLeft = px;
      const pRight = px + SZ;
      const pTop = player.y;
      const pBot = player.y + SZ;
      const margin = 4;

      for (const obj of LEVEL) {
        const ox = obj.x - camX + px; // screen-relative
        const worldX = obj.x;

        if (worldX < camX - 100 || worldX > camX + W + 50) continue;

        const relX = worldX - camX + px;

        if (obj.t === 's') {
          // Ground spike
          const sw = SZ, sh = SZ + 4;
          const spikeX = relX;
          const spikeY = GROUND_Y - sh;
          // Simple box collision for spike with margin
          if (rectCollide(pLeft+margin, pTop+margin, SZ-margin*2, SZ-margin*2, spikeX+4, spikeY+6, sw-8, sh-6)) die();
        } else if (obj.t === 'ds') {
          // Double spike
          for (let di = 0; di < 2; di++) {
            const sw = SZ, sh = SZ + 4;
            const spikeX = relX + di * (SZ - 4);
            const spikeY = GROUND_Y - sh;
            if (rectCollide(pLeft+margin, pTop+margin, SZ-margin*2, SZ-margin*2, spikeX+4, spikeY+6, sw-8, sh-6)) die();
          }
        } else if (obj.t === 'b') {
          const bh = obj.h || SZ;
          const bx = relX, by = GROUND_Y - bh;
          if (rectCollide(pLeft, pTop, SZ, SZ, bx, by, SZ, bh)) {
            // Side collision = death, top = land
            if (pBot - 6 <= by && player.vy >= 0) {
              player.y = by - SZ;
              player.vy = 0;
              player.grounded = true;
            } else {
              die();
            }
          }
        } else if (obj.t === 'p') {
          const bh = obj.h || SZ*2;
          const bx = relX, by = GROUND_Y - bh;
          if (rectCollide(pLeft, pTop, SZ, SZ, bx, by, SZ, bh)) {
            if (pBot - 6 <= by && player.vy >= 0) {
              player.y = by - SZ;
              player.vy = 0;
              player.grounded = true;
            } else die();
          }
        } else if (obj.t === 'fs') {
          const sw = SZ, sh = SZ;
          let sy;
          if (obj.pos === 'ceil') sy = 20;
          else sy = GROUND_Y - sh;
          const spikeX = relX;
          if (rectCollide(pLeft+margin, pTop+margin, SZ-margin*2, SZ-margin*2, spikeX+3, sy+3, sw-6, sh-6)) die();
        } else if (obj.t === 'sp') {
          if (rectCollide(pLeft, pTop, SZ, SZ, relX, GROUND_Y - SZ*2.5, SZ*1.5, SZ*2.5)) {
            if (mode !== 'ship') { mode = 'ship'; player.vy = 0; }
          }
        } else if (obj.t === 'cp') {
          if (rectCollide(pLeft, pTop, SZ, SZ, relX, GROUND_Y - SZ*2.5, SZ*1.5, SZ*2.5)) {
            if (mode !== 'cube') { mode = 'cube'; player.vy = 0; player.grounded = player.y >= GROUND_Y - SZ - 2; }
          }
        } else if (obj.t === 'end') {
          if (camX >= worldX - 100) {
            won = true;
            scoreEl.innerHTML = `🎉 <span style="color:#00ffcc">BOSQICH O'TILDI!</span> Urinishlar: <strong>${attempt}</strong>`;
          }
        }
      }

      // Particles update
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].life--;
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        if (particles[i].life <= 0) particles.splice(i, 1);
      }
    }

    function draw() {
      const pulse = Math.sin(frame * 0.02) * 0.15 + 0.85;
      // Sub Zero icy bg
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#010a1a');
      bg.addColorStop(0.5, '#041428');
      bg.addColorStop(1, '#0a1e3d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Stars
      bgStars.forEach(s => {
        const sx = ((s.x - camX * 0.3) % (W + 20) + W + 20) % (W + 20);
        ctx.fillStyle = `rgba(100,200,255,${s.a * pulse})`;
        ctx.fillRect(sx, s.y, s.s, s.s);
      });

      // Ground
      ctx.fillStyle = '#0d2040';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00bfff';
      ctx.fillStyle = '#00bfff';
      ctx.fillRect(0, GROUND_Y, W, 2);
      ctx.shadowBlur = 0;

      // Ground grid
      ctx.strokeStyle = 'rgba(0,180,255,0.06)';
      ctx.lineWidth = 1;
      const gOff = (-camX % 40 + 40) % 40;
      for (let x = gOff; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, GROUND_Y + 2); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = GROUND_Y + 12; y < H; y += 12) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Ceiling line for ship mode
      if (mode === 'ship') {
        ctx.shadowBlur = 6; ctx.shadowColor = '#00ffcc';
        ctx.fillStyle = '#00ffcc'; ctx.fillRect(0, 18, W, 2);
        ctx.shadowBlur = 0;
      }

      // Draw level objects
      for (const obj of LEVEL) {
        const relX = obj.x - camX + player.x;
        if (relX < -60 || relX > W + 60) continue;

        if (obj.t === 's' || obj.t === 'ds') {
          const count = obj.t === 'ds' ? 2 : 1;
          for (let di = 0; di < count; di++) {
            const sx = relX + di * (SZ - 4);
            const sh = SZ + 4;
            ctx.shadowBlur = 8; ctx.shadowColor = '#00bfff';
            ctx.fillStyle = '#00bfff';
            ctx.beginPath();
            ctx.moveTo(sx + SZ / 2, GROUND_Y - sh);
            ctx.lineTo(sx + SZ, GROUND_Y);
            ctx.lineTo(sx, GROUND_Y);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(0,30,60,0.4)';
            ctx.beginPath();
            ctx.moveTo(sx + SZ / 2, GROUND_Y - sh + 8);
            ctx.lineTo(sx + SZ - 5, GROUND_Y);
            ctx.lineTo(sx + 5, GROUND_Y);
            ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;
          }
        } else if (obj.t === 'b' || obj.t === 'p') {
          const bh = obj.h || SZ;
          ctx.fillStyle = '#0066aa';
          ctx.fillRect(relX, GROUND_Y - bh, SZ, bh);
          ctx.strokeStyle = '#00bfff'; ctx.lineWidth = 1.5;
          ctx.strokeRect(relX, GROUND_Y - bh, SZ, bh);
          ctx.fillStyle = 'rgba(0,190,255,0.15)';
          ctx.fillRect(relX+3, GROUND_Y-bh+3, SZ-6, bh/3);
        } else if (obj.t === 'fs') {
          const sh = SZ;
          let sy;
          if (obj.pos === 'ceil') {
            sy = 20;
            ctx.shadowBlur = 8; ctx.shadowColor = '#ff4466';
            ctx.fillStyle = '#ff4466';
            ctx.beginPath();
            ctx.moveTo(relX + SZ/2, sy + sh);
            ctx.lineTo(relX + SZ, sy);
            ctx.lineTo(relX, sy);
            ctx.closePath(); ctx.fill();
          } else {
            sy = GROUND_Y - sh;
            ctx.shadowBlur = 8; ctx.shadowColor = '#ff4466';
            ctx.fillStyle = '#ff4466';
            ctx.beginPath();
            ctx.moveTo(relX + SZ/2, sy);
            ctx.lineTo(relX + SZ, GROUND_Y);
            ctx.lineTo(relX, GROUND_Y);
            ctx.closePath(); ctx.fill();
          }
          ctx.shadowBlur = 0;
        } else if (obj.t === 'sp' || obj.t === 'cp') {
          const ph = SZ * 2.5;
          const py = GROUND_Y - ph;
          const col = obj.t === 'sp' ? '#ff00ff' : '#00ff88';
          ctx.shadowBlur = 15; ctx.shadowColor = col;
          ctx.strokeStyle = col; ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(relX + SZ*0.75, py);
          ctx.lineTo(relX + SZ*1.5, py + ph/2);
          ctx.lineTo(relX + SZ*0.75, py + ph);
          ctx.lineTo(relX, py + ph/2);
          ctx.closePath(); ctx.stroke();
          ctx.fillStyle = col.replace(')', ',0.15)').replace('rgb', 'rgba').replace('#', '');
          // Label
          ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
          ctx.fillStyle = col;
          ctx.fillText(obj.t === 'sp' ? 'SHIP' : 'CUBE', relX + SZ*0.75, py - 6);
          ctx.shadowBlur = 0;
        }
      }

      // Trail particles
      particles.forEach(p => {
        ctx.globalAlpha = p.life / 15;
        ctx.fillStyle = mode === 'ship' ? '#00ffcc' : '#00bfff';
        ctx.fillRect(p.x, p.y, p.s, p.s);
      });
      ctx.globalAlpha = 1;

      // Death particles
      deathParticles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life--;
        ctx.globalAlpha = Math.max(0, p.life / 60);
        ctx.fillStyle = '#00bfff';
        ctx.fillRect(p.x, p.y, p.s, p.s);
      });
      ctx.globalAlpha = 1;

      // Player
      if (!player.dead) {
        ctx.save();
        ctx.translate(player.x + SZ/2, player.y + SZ/2);
        ctx.rotate(player.rot * Math.PI / 180);

        if (mode === 'cube') {
          ctx.shadowBlur = 14; ctx.shadowColor = '#00ffcc';
          ctx.fillStyle = '#00ddbb';
          ctx.fillRect(-SZ/2, -SZ/2, SZ, SZ);
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fillRect(-SZ/2+3, -SZ/2+3, SZ-6, SZ/2-3);
          ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 1.5;
          ctx.strokeRect(-SZ/2, -SZ/2, SZ, SZ);
        } else {
          // Ship mode
          ctx.shadowBlur = 14; ctx.shadowColor = '#00ffcc';
          ctx.fillStyle = '#00ddbb';
          ctx.beginPath();
          ctx.moveTo(SZ/2, 0);
          ctx.lineTo(-SZ/2, -SZ/2);
          ctx.lineTo(-SZ/3, 0);
          ctx.lineTo(-SZ/2, SZ/2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 1;
          ctx.stroke();
        }
        // Eye
        ctx.fillStyle = '#fff';
        ctx.fillRect(2, -4, 6, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(4, -2, 3, 3);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Trail
        if (!player.grounded && mode === 'cube') {
          for (let i = 1; i <= 3; i++) {
            ctx.globalAlpha = 0.25 - i * 0.07;
            ctx.fillStyle = '#00ddbb';
            ctx.fillRect(player.x - i * 7, player.y + 3, SZ - 4, SZ - 4);
          }
          ctx.globalAlpha = 1;
        }
      }

      // Mode indicator
      ctx.fillStyle = 'rgba(0,190,255,0.5)';
      ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(mode === 'ship' ? '🚀 SHIP' : '🟦 CUBE', 10, 16);

      // Win overlay
      if (won) {
        ctx.fillStyle = 'rgba(0,20,40,0.7)';
        ctx.fillRect(0, 0, W, H);
        ctx.shadowBlur = 20; ctx.shadowColor = '#00ffcc';
        ctx.fillStyle = '#00ffcc';
        ctx.font = 'bold 30px "Space Grotesk", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('BOSQICH O\'TILDI!', W/2, H/2 - 15);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#88ddff';
        ctx.font = '16px sans-serif';
        ctx.fillText(`Urinishlar: ${attempt}`, W/2, H/2 + 18);
      }
    }

    function loop() { update(); draw(); if (!won) animId = requestAnimationFrame(loop); else { draw(); } }
    animId = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(animId); document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKey); };
  }

  // ============================================================
  // 12. SPACE HOCKEY
  // ============================================================
  function initSpaceHockey() {
    const W = 400, H = 500;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'game-canvas';
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const PADDLE_R = 30, PUCK_R = 15;
    const GOAL_W = 140;

    let player = { x: W / 2, y: H - 80 };
    let ai = { x: W / 2, y: 80 };
    let puck = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
    let playerScore = 0, aiScore = 0;
    let animId;

    scoreEl.innerHTML = `Siz: <strong>0</strong> — Kompyuter: <strong>0</strong>`;

    function resetPuck(toAI) {
      puck.x = W / 2;
      puck.y = toAI ? H / 2 - 50 : H / 2 + 50;
      puck.vx = 0; puck.vy = 0;
    }

    function update() {
      // AI Logic
      const targetSpeed = 4.5 + Math.min((playerScore + aiScore) * 0.2, 3);
      if (puck.y < H / 2) {
        const dx = puck.x - ai.x;
        const dy = puck.y - ai.y;
        ai.x += Math.sign(dx) * Math.min(targetSpeed, Math.abs(dx));
        ai.y += Math.sign(dy - 40) * Math.min(targetSpeed, Math.abs(dy - 40));
      } else {
        // Return to home position
        const dx = W / 2 - ai.x;
        const dy = 80 - ai.y;
        ai.x += Math.sign(dx) * 3;
        ai.y += Math.sign(dy) * 3;
      }
      // Ai bounds
      ai.x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, ai.x));
      ai.y = Math.max(PADDLE_R, Math.min(H / 2 - PADDLE_R, ai.y));

      // Puck Physics
      puck.x += puck.vx;
      puck.y += puck.vy;
      puck.vx *= 0.985; // Friction
      puck.vy *= 0.985;

      // Wall Bounce
      if (puck.x < PUCK_R) { puck.x = PUCK_R; puck.vx *= -0.8; }
      if (puck.x > W - PUCK_R) { puck.x = W - PUCK_R; puck.vx *= -0.8; }

      // Goals
      if (Math.abs(puck.x - W / 2) < GOAL_W / 2) {
        if (puck.y < 0) {
          playerScore++; resetPuck(true);
          scoreEl.innerHTML = `Siz: <strong>${playerScore}</strong> — Kompyuter: <strong>${aiScore}</strong>`;
        } else if (puck.y > H) {
          aiScore++; resetPuck(false);
          scoreEl.innerHTML = `Siz: <strong>${playerScore}</strong> — Kompyuter: <strong>${aiScore}</strong>`;
        }
      } else {
        if (puck.y < PUCK_R) { puck.y = PUCK_R; puck.vy *= -0.8; }
        if (puck.y > H - PUCK_R) { puck.y = H - PUCK_R; puck.vy *= -0.8; }
      }

      // Check Paddle Collisions
      [player, ai].forEach(p => {
        const dx = puck.x - p.x;
        const dy = puck.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PADDLE_R + PUCK_R) {
          const angle = Math.atan2(dy, dx);
          const force = 12;
          puck.vx = Math.cos(angle) * force;
          puck.vy = Math.sin(angle) * force;
          // Prevent sticking
          puck.x = p.x + (PADDLE_R + PUCK_R + 1) * Math.cos(angle);
          puck.y = p.y + (PADDLE_R + PUCK_R + 1) * Math.sin(angle);
        }
      });
    }

    function draw() {
      // Field
      ctx.fillStyle = '#05060f';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 60, 0, Math.PI * 2); ctx.stroke();

      // Goal Areas
      ctx.strokeStyle = '#00D4AA';
      ctx.strokeRect(W / 2 - GOAL_W / 2, -10, GOAL_W, 20);
      ctx.strokeStyle = '#6C63FF';
      ctx.strokeRect(W / 2 - GOAL_W / 2, H - 10, GOAL_W, 20);

      // Paddles
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#6C63FF';
      ctx.fillStyle = '#6C63FF';
      ctx.beginPath(); ctx.arc(player.x, player.y, PADDLE_R, 0, Math.PI * 2); ctx.fill();

      ctx.shadowColor = '#FF6B9D';
      ctx.fillStyle = '#FF6B9D';
      ctx.beginPath(); ctx.arc(ai.x, ai.y, PADDLE_R, 0, Math.PI * 2); ctx.fill();

      // Puck
      ctx.shadowColor = '#fff';
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(puck.x, puck.y, PUCK_R, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    function movePlayer(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      player.x = (clientX - rect.left) * (W / rect.width);
      player.y = (clientY - rect.top) * (H / rect.height);
      // Bound
      player.x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, player.x));
      player.y = Math.max(H / 2 + PADDLE_R, Math.min(H - PADDLE_R, player.y));
    }

    canvas.addEventListener('mousemove', movePlayer);
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); movePlayer(e); }, { passive: false });

    function loop() { update(); draw(); animId = requestAnimationFrame(loop); }
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }
  // ============================================================
  // 13. PUPPET FIGHTER 2 (Physics-based 2 Player/Bot)
  // ============================================================
  function initPuppetFighter() {
    const W = 800, H = 400;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'game-canvas';
    canvas.style.width = '100%'; canvas.style.maxWidth = W + 'px';
    canvas.style.height = 'auto'; canvas.style.aspectRatio = '2 / 1';
    
    // UI mapping for health and controls info
    const uiOverlay = document.createElement('div');
    uiOverlay.style.display = 'flex';
    uiOverlay.style.justifyContent = 'space-between';
    uiOverlay.style.width = '100%';
    uiOverlay.style.maxWidth = W + 'px';
    uiOverlay.style.margin = '0 auto 10px auto';
    uiOverlay.style.padding = '0 10px';
    uiOverlay.style.fontFamily = 'monospace';
    
    // P1 UI
    const p1UI = document.createElement('div');
    p1UI.innerHTML = `
      <div style="color:#00D4AA; font-weight:bold; margin-bottom:5px;">P1: WASD + Bo'sh joy (hujum)</div>
      <div style="background:#222; border:2px solid #00D4AA; border-radius:4px; width:180px; height:18px; position:relative; overflow:hidden;">
        <div id="pf-h1" style="width:100%; height:100%; background:linear-gradient(90deg, #008866, #00D4AA); transition:width 0.1s;"></div>
      </div>
      <div style="background:#111; border:1px solid #aaa; border-radius:3px; width:140px; height:6px; margin-top:4px;">
        <div id="pf-s1" style="width:100%; height:100%; background:#ffd700; transition:width 0.1s;"></div>
      </div>`;
                      
    // P2 UI
    const p2UI = document.createElement('div');
    p2UI.style.textAlign = 'right';
    p2UI.innerHTML = `
      <div style="color:#FF6B9D; font-weight:bold; margin-bottom:5px;">P2 / Bot: Yoylar + Enter (hujum)</div>
      <div style="background:#222; border:2px solid #FF6B9D; border-radius:4px; width:180px; height:18px; margin-left:auto; position:relative; overflow:hidden;">
        <div id="pf-h2" style="width:100%; height:100%; background:linear-gradient(90deg, #aa0044, #FF6B9D); transition:width 0.1s; float:right;"></div>
      </div>
      <div style="background:#111; border:1px solid #aaa; border-radius:3px; width:140px; height:6px; margin-top:4px; margin-left:auto;">
        <div id="pf-s2" style="width:100%; height:100%; background:#ffd700; transition:width 0.1s; float:right;"></div>
      </div>`;
                      
    uiOverlay.appendChild(p1UI);
    uiOverlay.appendChild(p2UI);
    
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.appendChild(uiOverlay);
    wrap.appendChild(canvas);
    container.appendChild(wrap);

    const ctx = canvas.getContext('2d');
    let animId;
    let gameOver = false;
    let winnerText = "";
    
    // Config
    const GRAVITY = 0.5;
    const FRICTION = 0.88;
    const FLOOR = H - 30;
    
    let screenShake = 0;
    let particles = [];

    class Ragdoll {
      constructor(x, color, dir, isP1) {
        this.isP1 = isP1;
        this.x = x;
        this.y = FLOOR - 70;
        this.vx = 0;
        this.vy = 0;
        this.color = color;
        this.dir = dir; // 1 for right, -1 for left
        this.hp = 100;
        this.stamina = 100;
        this.grounded = false;
        
        // Parts
        this.headR = 14;
        this.torsoH = 35;
        this.armL = 30;
        this.legL = 28;
        
        // Angles
        this.armAngle = dir === 1 ? Math.PI/4 : (3*Math.PI)/4;
        this.legAngle = 0;
        this.bodyTilt = 0;
        
        // Combat state
        this.attacking = false;
        this.attackPhase = 0; // 0-1
        this.attackType = 0; // 0=swing, 1=stab
        
        // Weapon
        this.wepL = 50;
        this.wepType = isP1 ? 'sword' : 'hammer';
      }
      
      update(keys, botControls) {
        // Recover stamina
        if (!this.attacking && this.stamina < 100) this.stamina += 0.5;
        
        // Movement processing
        let moveX = 0;
        let jumpBase = false;
        let attackBase = false;

        if (this.isP1) {
          if (keys['KeyA']) moveX = -1;
          if (keys['KeyD']) moveX = 1;
          if (keys['KeyW']) jumpBase = true;
          if (keys['Space']) attackBase = true;
        } else {
          if (botControls) {
            moveX = botControls.moveX;
            jumpBase = botControls.jump;
            attackBase = botControls.attack;
          } else {
            if (keys['ArrowLeft']) moveX = -1;
            if (keys['ArrowRight']) moveX = 1;
            if (keys['ArrowUp']) jumpBase = true;
            if (keys['Enter']) attackBase = true;
          }
        }

        // Apply movement forces
        if (moveX !== 0) {
          this.vx += moveX * 1.5;
          this.dir = moveX > 0 ? 1 : -1;
          this.legAngle += moveX * 0.2; // Walk cycle
        } else {
          this.legAngle *= 0.8; // Stand straight
        }

        // Jump
        if (jumpBase && this.grounded && this.stamina >= 15) {
          this.vy = -12;
          this.grounded = false;
          this.stamina -= 15;
          spawnDust(this.x, FLOOR);
        }

        // Attack
        if (attackBase && !this.attacking && this.stamina >= 25) {
          this.attacking = true;
          this.attackPhase = 0;
          this.stamina -= 25;
          this.attackType = Math.random() > 0.5 ? 0 : 1;
          this.vx += this.dir * 4; // Lunge forward
          spawnDust(this.x, FLOOR);
        }

        // Process Attack Animation
        if (this.attacking) {
          this.attackPhase += 0.08;
          if (this.attackPhase >= 1) {
            this.attacking = false;
            this.attackPhase = 0;
          }
          
          if (this.attackType === 0) {
            // Swing down
            const swingArc = Math.PI * 1.2;
            let start = this.dir === 1 ? -Math.PI/2 : 3*Math.PI/2;
            this.armAngle = start + this.dir * Math.sin(this.attackPhase * Math.PI) * swingArc;
          } else {
            // Stab forward tilt
            this.bodyTilt = this.dir * Math.sin(this.attackPhase * Math.PI) * 0.5;
            this.armAngle = this.dir === 1 ? 0 : Math.PI;
          }
        } else {
          // Idle arm
          this.bodyTilt *= 0.8;
          const tiltX = (this.vx / 10);
          this.armAngle = this.dir === 1 ? Math.PI/4 + tiltX : (3*Math.PI)/4 + tiltX;
        }

        // Physics
        this.vy += GRAVITY;
        this.vx *= FRICTION;
        
        // Speed cap
        this.vx = Math.max(-10, Math.min(10, this.vx));

        this.x += this.vx;
        this.y += this.vy;

        // Ground constraint
        if (this.y + this.torsoH + this.legL > FLOOR) {
          this.y = FLOOR - this.torsoH - this.legL;
          this.vy = 0;
          this.grounded = true;
        } else {
          this.grounded = false;
        }

        // Wall constraint
        if (this.x < 20) { this.x = 20; this.vx *= -0.5; }
        if (this.x > W - 20) { this.x = W - 20; this.vx *= -0.5; }
        
        // Update UI
        if (this.isP1) {
          document.getElementById('pf-h1').style.width = Math.max(0, this.hp) + '%';
          document.getElementById('pf-s1').style.width = Math.max(0, this.stamina) + '%';
        } else {
          document.getElementById('pf-h2').style.width = Math.max(0, this.hp) + '%';
          document.getElementById('pf-s2').style.width = Math.max(0, this.stamina) + '%';
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.bodyTilt);

        ctx.strokeStyle = this.color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw Legs
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, this.torsoH);
        ctx.lineTo(Math.sin(-this.legAngle)*this.legL, this.torsoH + Math.cos(-this.legAngle)*this.legL);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, this.torsoH);
        ctx.lineTo(Math.sin(this.legAngle)*this.legL, this.torsoH + Math.cos(this.legAngle)*this.legL);
        ctx.stroke();

        // Draw Torso
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.torsoH);
        ctx.stroke();

        // Draw Head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, -this.headR, this.headR, 0, Math.PI*2);
        ctx.fill();

        // Draw Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(this.dir * 4, -this.headR - 4);
        ctx.lineTo(this.dir * 10, -this.headR + 2);
        ctx.lineTo(this.dir * 4, -this.headR + 2);
        ctx.fill();

        // Draw Weapon Arm
        ctx.rotate(this.armAngle);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#ddd';
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(this.wepL * 0.4, 5); // Forearm
        ctx.stroke();
        
        // Draw Weapon
        ctx.translate(this.wepL * 0.4, 5);
        
        if (this.wepType === 'sword') {
          // Sword handle
          ctx.strokeStyle = '#553311'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(0, 5); ctx.stroke();
          // Blade
          ctx.shadowBlur = 10; ctx.shadowColor = '#00D4AA';
          ctx.fillStyle = '#ccc';
          ctx.beginPath();
          ctx.moveTo(0, -2);
          ctx.lineTo(this.wepL, 0);
          ctx.lineTo(0, 2);
          ctx.fill();
        } else {
          // Hammer handle
          ctx.strokeStyle = '#6e451b'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(this.wepL, 0); ctx.stroke();
          // Head
          ctx.shadowBlur = 10; ctx.shadowColor = '#FF6B9D';
          ctx.fillStyle = '#555';
          ctx.fillRect(this.wepL - 10, -15, 20, 30);
        }
        ctx.shadowBlur = 0;

        ctx.restore();
      }

      getDamageBox() {
        // Calculate weapon tip in world space
        const wX = this.x + Math.sin(this.bodyTilt) * 5 + Math.cos(this.armAngle + this.bodyTilt) * this.wepL * 1.3;
        const wY = this.y + Math.cos(this.bodyTilt) * 5 + Math.sin(this.armAngle + this.bodyTilt) * this.wepL * 1.3;
        return { x: wX, y: wY, r: 15 };
      }
      
      getHitBox() {
        return { x: this.x, y: this.y + this.torsoH/2, w: 30, h: this.torsoH + this.headR*2 };
      }
    }

    let p1 = new Ragdoll(150, '#00D4AA', 1, true);
    let p2 = new Ragdoll(650, '#FF6B9D', -1, false);
    
    const keys = {};
    let lastP2KeyTime = Date.now();
    let isVersus = false;

    function onKey(e) {
      if (gameOver) return;
      keys[e.code] = e.type === 'keydown';
      
      // Detect human P2
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.code) && e.type === 'keydown') {
        lastP2KeyTime = Date.now();
        isVersus = true;
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);

    function spawnDust(x, y) {
      for(let i=0; i<6; i++) {
        particles.push({
          x: x + (Math.random()-0.5)*20, y: y,
          vx: (Math.random()-0.5)*4, vy: -Math.random()*3 - 1,
          life: 20 + Math.random()*10,
          color: 'rgba(200,200,200,0.5)',
          size: Math.random()*4 + 2
        });
      }
    }

    function spawnSparks(x, y, color) {
      for(let i=0; i<12; i++) {
        particles.push({
          x: x, y: y,
          vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12,
          life: 15 + Math.random()*15,
          color: color,
          size: Math.random()*3 + 1
        });
      }
      screenShake = 8;
    }

    function checkHit(attacker, defender) {
      if (!attacker.attacking) return;
      // Only hit in the middle of swing
      if (attacker.attackPhase < 0.3 || attacker.attackPhase > 0.7) return;
      
      const wBox = attacker.getDamageBox();
      const tBox = defender.getHitBox();
      
      if (Math.abs(wBox.x - tBox.x) < (wBox.r + tBox.w/2) &&
          Math.abs(wBox.y - tBox.y) < (wBox.r + tBox.h/2)) {
          
        // Hit registered
        defender.hp -= attacker.wepType === 'sword' ? 4 : 6;
        
        // Knockback
        const kbDir = Math.sign(defender.x - attacker.x) || attacker.dir;
        defender.vx = kbDir * (attacker.wepType === 'hammer' ? 12 : 8);
        defender.vy = -6;
        
        spawnSparks(wBox.x, wBox.y, attacker.color);
        
        // End attack phase to prevent multi-hits from same swing
        attacker.attackPhase = 0.8;
      }
    }

    // AI Bot
    function getBotInput() {
      const controls = { moveX: 0, jump: false, attack: false };
      
      const dist = p1.x - p2.x;
      const absDist = Math.abs(dist);
      
      if (absDist > 90) {
        controls.moveX = Math.sign(dist);
      } else if (absDist < 50) {
        controls.moveX = -Math.sign(dist);
      } else {
        controls.moveX = Math.sign(dist) * 0.1;
        if (p2.stamina > 40 && Math.random() < 0.1 && !p1.attacking) {
          controls.attack = true;
        } else if (p1.attacking && Math.random() < 0.15) {
          controls.moveX = -Math.sign(dist);
          controls.jump = true;
        }
      }
      
      if (p2.vx < 1 && absDist > 150 && Math.random() < 0.02) {
        controls.jump = true;
      }

      return controls;
    }

    function update() {
      if (gameOver) return;

      // Auto revert to bot if idle for 5s
      if (isVersus && Date.now() - lastP2KeyTime > 5000) {
        isVersus = false;
      }

      let botControls = isVersus ? null : getBotInput();

      p1.update(keys, null);
      p2.update(keys, botControls);

      checkHit(p1, p2);
      checkHit(p2, p1);

      // Process Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Check Win
      if (p1.hp <= 0 || p2.hp <= 0) {
        gameOver = true;
        if (p1.hp <= 0 && p2.hp <= 0) winnerText = "DURRANG!";
        else if (p1.hp <= 0) winnerText = isVersus ? "O'YINCHI 2 G'OLIB!" : "BOT G'OLIB!";
        else winnerText = "O'YINCHI 1 G'OLIB!";
      }
      
      if (screenShake > 0) screenShake--;
    }

    function draw() {
      ctx.save();
      
      if (screenShake > 0) {
        const sx = (Math.random()-0.5) * screenShake * 2;
        const sy = (Math.random()-0.5) * screenShake * 2;
        ctx.translate(sx, sy);
      }

      // Background Grid
      ctx.fillStyle = '#0f111a';
      ctx.fillRect(0, 0, W, H);
      
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Ring Floor
      const ringL = 50, ringR = W - 50;
      
      const grad = ctx.createLinearGradient(0, FLOOR, 0, H);
      grad.addColorStop(0, '#1d2238');
      grad.addColorStop(1, '#000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, FLOOR, W, H-FLOOR);
      
      ctx.shadowBlur = 10; ctx.shadowColor = '#6C63FF';
      ctx.strokeStyle = '#6C63FF'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(ringL, FLOOR); ctx.lineTo(ringR, FLOOR); ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Ropes/Posts
      ctx.fillStyle = '#444';
      ctx.fillRect(ringL-10, FLOOR-100, 10, 100);
      ctx.fillRect(ringR, FLOOR-100, 10, 100);
      ctx.strokeStyle = 'rgba(255,50,50,0.5)'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(ringL, FLOOR-80); ctx.lineTo(ringR, FLOOR-80); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ringL, FLOOR-40); ctx.lineTo(ringR, FLOOR-40); ctx.stroke();

      // Bot Indicator
      if (!isVersus && !gameOver) {
        ctx.fillStyle = 'rgba(255,107,157,0.5)';
        ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        ctx.fillText('🤖 BOT', p2.x, p2.y - 45);
      }

      // Draw Entities
      p1.draw();
      p2.draw();

      // Particles
      particles.forEach(p => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Overlay
      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, W, H);
        ctx.shadowBlur = 15; ctx.shadowColor = '#FFD700';
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 38px "Space Grotesk", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(winnerText, W/2, H/2 - 10);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = '18px monospace';
        ctx.fillText(`P1 Qoldiq: ${Math.max(0, p1.hp)}% | P2 Qoldiq: ${Math.max(0, p2.hp)}%`, W/2, H/2 + 25);
        ctx.fillStyle = '#aaa';
        ctx.font = '14px monospace';
        ctx.fillText("Qayta boshlash uchun '🔄 Qayta' tugmasini bosing", W/2, H/2 + 55);
      }

      ctx.restore();
    }

    function loop() {
      update();
      draw();
      if (!gameOver) animId = requestAnimationFrame(loop);
      else draw();
    }
    
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKey);
    };
  }

})();
