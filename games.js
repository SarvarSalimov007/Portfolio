// ============================
// SARVAR SALIMOV вЂ” Mini Games
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
      tictactoe: { title: 'вќЊв­• Krestik-Nolik', init: initTicTacToe },
      snake: { title: 'рџђЌ Ilon O\'yini', init: initSnake },
      memory: { title: 'рџ§  Xotira O\'yini', init: initMemory },
      flappy: { title: 'рџђ¦ Flappy Bird', init: initFlappy },
      game2048: { title: 'рџ”ў 2048', init: init2048 },
      tetris: { title: 'рџ§± Tetris', init: initTetris },
      pong: { title: 'рџЏ“ Pong', init: initPong },
      minesweeper: { title: 'рџ’Ј Minesweeper', init: initMinesweeper },
      colormatch: { title: 'рџЋЁ Rang Topish', init: initColorMatch },
      spacewaves: { title: 'рџљЂ Space Waves', init: initSpaceWaves },
      geodash: { title: 'рџ”· Geometry Dash', init: initGeoDash },
      spacehockey: { title: 'рџЏ’ Space Hockey', init: initSpaceHockey },
      puppetfighter: { title: 'рџҐ· Puppet Fighter 2', init: initPuppetFighter },
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
      if (win) { endGame('Siz yutdingiz! рџЋ‰', win); return; }
      if (board.every(c => c)) { endGame('Durrang! рџ¤ќ', null); return; }

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
      if (win) { endGame('Kompyuter yutdi! рџ…', win); return; }
      if (board.every(c => c)) { endGame('Durrang! рџ¤ќ', null); return; }

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
    ['в¬†','в¬…','в¬‡','вћЎ'].forEach((icon,i) => {
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
    const emojis = ['рџЋ®','рџљЂ','рџ’Ћ','рџЋЁ','вљЎ','рџЊџ','рџЋЇ','рџ”Ґ'];
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
            scoreEl.innerHTML = `рџЋ‰ Tabriklaymiz! <strong>${moves}</strong> urinishda yutdingiz!`;
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

    scoreEl.innerHTML = 'Ball: <strong>0</strong> вЂ” Boshlash uchun bosing!';

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
    ['в¬†','в¬…','в¬‡','вћЎ'].forEach((icon,i) => {
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
          scoreEl.innerHTML = `рџЋ‰ 2048 ga yetdingiz! Ball: <strong>${score2048}</strong>`;
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
      {icon:'в¬…', key:'ArrowLeft'}, {icon:'в¬‡', key:'ArrowDown'},
      {icon:'рџ”„', key:'ArrowUp'}, {icon:'вћЎ', key:'ArrowRight'}
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
    ['в¬†', 'в¬‡'].forEach((icon, i) => {
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

    scoreEl.innerHTML = 'Siz: <strong>0</strong> вЂ” Kompyuter: <strong>0</strong>';

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
        scoreEl.innerHTML = `Siz: <strong>${playerScore}</strong> вЂ” Kompyuter: <strong>${aiScore}</strong>`;
        if (aiScore >= 7) {
          scoreEl.innerHTML = `рџ… Kompyuter yutdi! ${playerScore} : ${aiScore}`;
          cancelAnimationFrame(animId); return;
        }
        resetBall(1);
      }
      if (ball.x > W) {
        playerScore++;
        scoreEl.innerHTML = `Siz: <strong>${playerScore}</strong> вЂ” Kompyuter: <strong>${aiScore}</strong>`;
        if (playerScore >= 7) {
          scoreEl.innerHTML = `рџЋ‰ Siz yutdingiz! ${playerScore} : ${aiScore}`;
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
    infoBar.innerHTML = `рџ’Ј <strong>${MINES}</strong> ta mina | рџљ© <span id="mFlagCount">0</span> / ${MINES}`;
    wrapper.appendChild(infoBar);

    const boardEl = document.createElement('div');
    boardEl.className = 'mine-board';
    boardEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    wrapper.appendChild(boardEl);

    const hint = document.createElement('p');
    hint.className = 'mine-hint';
    hint.textContent = 'рџ’Ў O\'ng klik = bayroq qo\'yish | Chapni bosing = ochish';
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

    scoreEl.innerHTML = 'Minalarni toping! рџ’Ј';

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
        cell.textContent = 'рџ’Ґ';
        revealAll();
        scoreEl.innerHTML = 'рџ’Ґ Mina portladi! O\'yin tugadi.';
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
      cellEls[r][c].textContent = flagged[r][c] ? 'рџљ©' : '';
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
        scoreEl.innerHTML = 'рџЋ‰ Tabriklaymiz! Barcha minalarni topdingiz!';
      }
    }

    function revealAll() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c] === -1 && !revealed[r][c]) {
            cellEls[r][c].textContent = 'рџ’Ј';
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
    yesBtn.textContent = 'вњ… Ha';
    yesBtn.addEventListener('click', () => answer(true));

    const noBtn = document.createElement('button');
    noBtn.className = 'btn btn-outline cm-btn cm-no';
    noBtn.textContent = 'вќЊ Yo\'q';
    noBtn.addEventListener('click', () => answer(false));

    btnWrap.appendChild(yesBtn);
    btnWrap.appendChild(noBtn);
    wrapper.appendChild(btnWrap);

    container.appendChild(wrapper);
    scoreEl.innerHTML = 'Ball: <strong>0</strong> | вЏ± <strong>30</strong>s';

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

      streakDisplay.textContent = streak > 1 ? `рџ”Ґ ${streak}x ketma-ket!` : '';
      scoreEl.innerHTML = `Ball: <strong>${score}</strong> | вЏ± <strong>${timeLeft}</strong>s`;
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

      scoreEl.innerHTML = `Ball: <strong>${score}</strong> | вЏ± <strong>${timeLeft}</strong>s`;

      if (timeLeft <= 0) {
        clearInterval(timer);
        gameActive = false;
        scoreEl.innerHTML = `рџЏЃ Vaqt tugadi! Ball: <strong>${score}</strong> | Eng yaxshi: <strong>${bestStreak}x</strong>`;
        colorDisplay.textContent = 'вЏ±пёЏ';
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

    scoreEl.innerHTML = 'Harakatlanish uchun bosing! вљЎ';

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
        scoreEl.innerHTML = `рџ’Ґ Portladi! Ball: <strong>${score}</strong>`;
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
          scoreEl.innerHTML = `рџ’Ґ To'siq! Ball: <strong>${score}</strong>`;
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
  // 11. GEOMETRY DASH вЂ” SUB ZERO "PRESS START"
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
      // Ship section вЂ“ ceiling and floor spikes
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

    scoreEl.innerHTML = `<span style="color:#00bfff">вќ„ PRESS START</span> вЂ” Urinish: <strong>${attempt}</strong> | Sakrash: Space / Tap`;

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
      scoreEl.innerHTML = `<span style="color:#00bfff">вќ„ PRESS START</span> вЂ” Urinish: <strong>${attempt}</strong>`;
    }

    function die() {
      if (gameOver) return;
      gameOver = true;
      player.dead = true;
      for (let i = 0; i < 20; i++) {
        deathParticles.push({x:player.x, y:player.y+SZ/2, vx:(Math.random()-0.5)*8, vy:(Math.random()-0.5)*8, life:40+Math.random()*20, s:3+Math.random()*5});
      }
      scoreEl.innerHTML = `рџ’Ґ Yiqildingiz! Urinish: <strong>${attempt}</strong> вЂ” Bosib qayta boshlang`;
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
            scoreEl.innerHTML = `рџЋ‰ <span style="color:#00ffcc">BOSQICH O'TILDI!</span> Urinishlar: <strong>${attempt}</strong>`;
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
      ctx.fillText(mode === 'ship' ? 'рџљЂ SHIP' : 'рџџ¦ CUBE', 10, 16);

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

    scoreEl.innerHTML = `Siz: <strong>0</strong> вЂ” Kompyuter: <strong>0</strong>`;

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
          scoreEl.innerHTML = `Siz: <strong>${playerScore}</strong> вЂ” Kompyuter: <strong>${aiScore}</strong>`;
        } else if (puck.y > H) {
          aiScore++; resetPuck(false);
          scoreEl.innerHTML = `Siz: <strong>${playerScore}</strong> вЂ” Kompyuter: <strong>${aiScore}</strong>`;
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
    const W = 800, H = 500;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'game-canvas';
    canvas.style.width = '100%'; canvas.style.maxWidth = W + 'px';
    canvas.style.height = 'auto'; canvas.style.aspectRatio = '8 / 5';
    
    // UI
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
      <div style="color:#00D4AA; font-weight:bold; margin-bottom:5px;">P1 (KOK): WASD + Bo'sh joy (Hujum)</div>
      <div style="background:#222; border:2px solid #00D4AA; border-radius:4px; width:180px; height:18px; position:relative; overflow:hidden;">
        <div id="pf-h1" style="width:100%; height:100%; background:linear-gradient(90deg, #008866, #00D4AA); transition:width 0.1s;"></div>
      </div>`;
                      
    // P2 UI
    const p2UI = document.createElement('div');
    p2UI.style.textAlign = 'right';
    p2UI.innerHTML = `
      <div style="color:#FF6B9D; font-weight:bold; margin-bottom:5px;">P2 / Bot (QIZIL): Yoylar + Enter</div>
      <div style="background:#222; border:2px solid #FF6B9D; border-radius:4px; width:180px; height:18px; margin-left:auto; position:relative; overflow:hidden;">
        <div id="pf-h2" style="width:100%; height:100%; background:linear-gradient(90deg, #aa0044, #FF6B9D); transition:width 0.1s; float:right;"></div>
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
    
    let screenShake = 0;
    let particles = [];
    
    // Stars for the void background
    let stars = [];
    for(let i=0; i<80; i++) {
        stars.push({
            x: Math.random()*W, y: Math.random()*H, 
            s: Math.random()*2+1, 
            vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5
        });
    }

    // Traps (Sawblades)
    let saws = [
      { rad: 120, angle: 0, speed: 0.025, spin: 0, x:0, y:0 },
      { rad: 180, angle: Math.PI, speed: -0.018, spin: 0, x:0, y:0 }
    ];

    class FloppyPuppet {
      constructor(x, y, color, isP1) {
        this.isP1 = isP1;
        this.x = x; this.y = y;
        this.vx = 0; this.vy = 0;
        this.angle = isP1 ? 0 : Math.PI; 
        this.vAngle = 0;
        
        // Arm angles (world relative)
        this.armL = this.angle - 0.5; this.vArmL = 0;
        this.armR = this.angle + 0.5; this.vArmR = 0;
        
        this.color = color;
        this.hp = 100;
        this.dead = false;
        this.fallScale = 1;
        
        this.attackCd = 0;
        this.wepType = isP1 ? 'hammer' : 'sword';
        
        this.step = 0;
        this.prevWx = this.x; this.prevWy = this.y;
      }
      
      update(ctrl) {
        if(this.dead) {
           if(this.fallScale > 0) this.fallScale = Math.max(0, this.fallScale - 0.05);
           return;
        }
        
        // Ring out check
        if(Math.hypot(this.x - W/2, this.y - H/2) > 220) {
            this.dead = true; this.hp = 0;
        }
        
        if(ctrl.x || ctrl.y) {
          this.vx += ctrl.x * 1.2;
          this.vy += ctrl.y * 1.2;
          
          let targetA = Math.atan2(ctrl.y, ctrl.x);
          let diff = targetA - this.angle;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // normalize
          this.vAngle += diff * 0.15;
        }
        
        // Attack Spin (Beyblade style)
        if(ctrl.attack && this.attackCd <= 0) {
          this.vAngle += 2.5; // huge spin torque
          this.vx += Math.cos(this.angle) * 12; // propel forward
          this.vy += Math.sin(this.angle) * 12;
          this.attackCd = 35; // cooldown
          spawnDust(this.x, this.y);
        }
        if(this.attackCd > 0) this.attackCd--;

        // Friction & Damping
        this.vx *= 0.88;
        this.vy *= 0.88;
        this.vAngle *= 0.85;
        
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.vAngle;
        
        // Arms target forward but drag behind
        let targetL = this.angle - 0.5;
        let targetR = this.angle + 0.5;
        
        let dL = Math.atan2(Math.sin(targetL - this.armL), Math.cos(targetL - this.armL));
        let dR = Math.atan2(Math.sin(targetR - this.armR), Math.cos(targetR - this.armR));
        
        this.vArmL += dL * 0.2;
        this.vArmR += dR * 0.2;
        
        this.vArmL *= 0.85;
        this.vArmR *= 0.85;
        
        this.armL += this.vArmL + this.vAngle; 
        this.armR += this.vArmR + this.vAngle;
        
        // UI
        let bar = document.getElementById(this.isP1 ? 'pf-h1' : 'pf-h2');
        if(bar) bar.style.width = Math.max(0, this.hp) + '%';
      }

      draw() {
        if(this.fallScale === 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if(this.dead) {
           ctx.scale(this.fallScale, this.fallScale);
           ctx.rotate((1-this.fallScale)*10);
           ctx.globalAlpha = this.fallScale;
        }

        // Walk cycle feet
        let speed = Math.hypot(this.vx, this.vy);
        this.step += speed * 0.1;
        let ly = Math.sin(this.step)*12;
        let ry = -Math.sin(this.step)*12;
        
        ctx.save();
        ctx.rotate(this.angle); // face body direction
        
        // Feet
        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.arc(-8, ly, 7, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, ry, 7, 0, Math.PI*2); ctx.fill();

        // Body
        ctx.shadowBlur = 15; ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        
        // Head
        ctx.fillStyle = '#ffccaa';
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
        
        // Eyes (always face the "front" relative to rotation)
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(4, -4, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, 4, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(4.5, -4.5, 1, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(4.5, 3.5, 1, 0, Math.PI*2); ctx.fill();
        ctx.restore();

        // Arms
        ctx.save();
        ctx.rotate(this.armR - this.angle); // wait, translate implies world? 
        // No, we are translated to this.x, this.y already, but not rotated.
        // So armR is world rotation. We simply rotate by armR directly!
        ctx.restore(); 
        
        // Right Arm (Weapon)
        ctx.save();
        ctx.rotate(this.armR);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(15, 0); ctx.stroke();
        
        ctx.translate(15, 0);
        if(this.wepType === 'hammer') {
           ctx.strokeStyle = '#6e451b'; ctx.lineWidth = 5;
           ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(35,0); ctx.stroke();
           ctx.fillStyle = '#555'; ctx.shadowBlur=10; ctx.shadowColor='#FF6B9D';
           ctx.fillRect(25, -15, 20, 30);
        } else { // sword
           ctx.strokeStyle = '#553311'; ctx.lineWidth = 4;
           ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(10,0); ctx.stroke();
           ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10,-8); ctx.lineTo(10,8); ctx.stroke();
           ctx.fillStyle = '#ccc'; ctx.shadowBlur=10; ctx.shadowColor='#00D4AA';
           ctx.beginPath(); ctx.moveTo(10, -4); ctx.lineTo(55, 0); ctx.lineTo(10, 4); ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.restore();

        // Left Arm (Fist)
        ctx.save();
        ctx.rotate(this.armL);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(20, 0); ctx.stroke();
        ctx.fillStyle = '#ffccaa';
        ctx.beginPath(); ctx.arc(20, 0, 7, 0, Math.PI*2); ctx.fill();
        ctx.restore();

        ctx.restore();
      }
    }

    let p1 = new FloppyPuppet(W/2 - 100, H/2, '#00D4AA', true);
    let p2 = new FloppyPuppet(W/2 + 100, H/2, '#FF6B9D', false);
    
    const keys = {};
    let lastP2KeyTime = Date.now();
    let isVersus = false;

    function onKey(e) {
      if(gameOver) return;
      if(['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
         e.preventDefault();
      }
      keys[e.code] = e.type === 'keydown';
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.code) && e.type === 'keydown') {
        lastP2KeyTime = Date.now();
        isVersus = true;
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);

    function spawnDust(x, y) {
      for(let i=0; i<5; i++) {
        particles.push({
          x: x + (Math.random()-0.5)*20, y: y + (Math.random()-0.5)*20,
          vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2,
          life: 15 + Math.random()*10, color: 'rgba(200,200,200,0.3)', size: Math.random()*5 + 2
        });
      }
    }
    function spawnSparks(x, y, color) {
      for(let i=0; i<15; i++) {
        particles.push({
          x: x, y: y,
          vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12,
          life: 15 + Math.random()*15, color: color, size: Math.random()*3 + 1
        });
      }
      screenShake = 12;
    }

    function checkWeaponHit(attacker, defender) {
      if(attacker.dead || defender.dead) return;
      
      let wrad = attacker.wepType === 'hammer' ? 18 : 12;
      let wepLen = attacker.wepType === 'hammer' ? 50 : 70;
      
      let wx = attacker.x + Math.cos(attacker.armR) * wepLen;
      let wy = attacker.y + Math.sin(attacker.armR) * wepLen;
      
      let wSpeed = Math.hypot(wx - attacker.prevWx, wy - attacker.prevWy);
      attacker.prevWx = wx; attacker.prevWy = wy;
      
      if(wSpeed > 5) {
        let dx = defender.x - wx;
        let dy = defender.y - wy;
        let dist = Math.hypot(dx, dy);
        if(dist < 16 + wrad) {
           let dmg = wSpeed * 0.8;
           defender.hp -= dmg;
           let nx = (wx - (attacker.x + Math.cos(attacker.armR)*(wepLen-10))) / wSpeed || (dx/dist);
           let ny = (wy - (attacker.y + Math.sin(attacker.armR)*(wepLen-10))) / wSpeed || (dy/dist);
           
           defender.vx += nx * wSpeed * 0.6;
           defender.vy += ny * wSpeed * 0.6;
           
           attacker.vArmR *= 0.2; // dampen swing
           attacker.vAngle *= 0.5;
           
           spawnSparks(wx, wy, attacker.color);
        }
      }
    }

    function resolveBodyCollision(p1, p2) {
      if(p1.dead || p2.dead) return;
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let dist = Math.hypot(dx, dy);
      if(dist > 0 && dist < 32) { // 16 + 16 radii
        let overlap = 32 - dist;
        let nx = dx / dist; let ny = dy / dist;
        p1.x -= nx * overlap * 0.5; p1.y -= ny * overlap * 0.5;
        p2.x += nx * overlap * 0.5; p2.y += ny * overlap * 0.5;
        
        let dvx = p2.vx - p1.vx; let dvy = p2.vy - p1.vy;
        let dot = dvx*nx + dvy*ny;
        if(dot < 0) {
          p1.vx += nx * dot * 0.8; p1.vy += ny * dot * 0.8;
          p2.vx -= nx * dot * 0.8; p2.vy -= ny * dot * 0.8;
        }
      }
    }

    function getBotInput(bot, target) {
      let ctrl = {x:0, y:0, attack:false};
      if(bot.dead || target.dead) return ctrl;
      
      let dx = target.x - bot.x;
      let dy = target.y - bot.y;
      let dist = Math.hypot(dx, dy);
      
      // Stay away from edge void
      let centerDist = Math.hypot(bot.x - W/2, bot.y - H/2);
      if(centerDist > 180) {
         ctrl.x = Math.sign(W/2 - bot.x);
         ctrl.y = Math.sign(H/2 - bot.y);
         return ctrl;
      }

      // Avoid sawblades
      for(let saw of saws) {
         let sdx = saw.x - bot.x;
         let sdy = saw.y - bot.y;
         if(Math.hypot(sdx, sdy) < 90) {
            ctrl.x = -Math.sign(sdx);
            ctrl.y = -Math.sign(sdy);
            return ctrl;
         }
      }

      // Attack player
      if(dist > 60) {
          ctrl.x = Math.sign(dx);
          ctrl.y = Math.sign(dy);
      } else if (dist < 40) {
          ctrl.x = -Math.sign(dx);
          ctrl.y = -Math.sign(dy);
      }
      
      if(dist < 100 && Math.random() < 0.05 && bot.attackCd <= 0) {
          ctrl.attack = true;
      }
      
      if(bot.vx < 1 && dist > 150 && Math.random() < 0.02) {
          ctrl.attack = true; // occasional lunge if far
      }
      return ctrl;
    }

    function update() {
      if(gameOver) return;

      if(isVersus && Date.now() - lastP2KeyTime > 5000) isVersus = false;

      let c1 = { x: (keys['KeyD']?1:0) - (keys['KeyA']?1:0), y: (keys['KeyS']?1:0) - (keys['KeyW']?1:0), attack: keys['Space'] };
      let c2 = { x: (keys['ArrowRight']?1:0) - (keys['ArrowLeft']?1:0), y: (keys['ArrowDown']?1:0) - (keys['ArrowUp']?1:0), attack: keys['Enter'] };
      
      if(!isVersus) c2 = getBotInput(p2, p1);

      p1.update(c1);
      p2.update(c2);
      
      resolveBodyCollision(p1, p2);
      checkWeaponHit(p1, p2);
      checkWeaponHit(p2, p1);

      // Sawblades logic
      saws.forEach(saw => {
        saw.angle += saw.speed;
        saw.x = W/2 + Math.cos(saw.angle) * saw.rad;
        saw.y = H/2 + Math.sin(saw.angle) * saw.rad;
        saw.spin += 0.3;
        
        [p1, p2].forEach(p => {
            if(p.dead) return;
            let dx = p.x - saw.x;
            let dy = p.y - saw.y;
            let dist = Math.hypot(dx, dy);
            if(dist < 16 + 25) { // bodyR + sawR
                p.hp -= 2; // rapid damage
                p.vx += Math.sign(dx) * 8;
                p.vy += Math.sign(dy) * 8;
                spawnSparks(p.x, p.y, '#ff3333');
            }
        });
      });

      // Particles
      for(let i=particles.length-1; i>=0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life--;
        if(p.life <= 0) particles.splice(i,1);
      }

      if(screenShake > 0) screenShake--;

      // Check Win
      if(p1.hp <= 0 || p2.hp <= 0) {
        gameOver = true;
        if(p1.hp <= 0 && p2.hp <= 0) winnerText = "DURRANG!";
        else if(p1.hp <= 0) winnerText = isVersus ? "QIZIL O'YINCHI G'OLIB!" : "BOT G'OLIB!";
        else winnerText = "KOK O'YINCHI G'OLIB!";
      }
    }

    function draw() {
      ctx.save();
      // Screen shake
      if(screenShake > 0) {
        ctx.translate((Math.random()-0.5)*screenShake*2, (Math.random()-0.5)*screenShake*2);
      }

      // Background Void
      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, W, H);
      
      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      stars.forEach(s => {
          s.x += s.vx; s.y += s.vy;
          if(s.x < 0) s.x += W; if(s.x > W) s.x -= W;
          if(s.y < 0) s.y += H; if(s.y > H) s.y -= H;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI*2); ctx.fill();
      });

      // Arena Platform
      ctx.save();
      ctx.translate(W/2, H/2);
      ctx.shadowBlur = 30; ctx.shadowColor = '#6C63FF';
      ctx.fillStyle = '#111526';
      ctx.beginPath(); ctx.arc(0, 0, 220, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#6C63FF'; ctx.lineWidth = 5; ctx.stroke();
      
      // Arena Grid Pattern
      ctx.clip(); // draw grid only inside ring
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
      for(let x=-220; x<220; x+=40) {
        ctx.beginPath(); ctx.moveTo(x, -220); ctx.lineTo(x, 220); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-220, x); ctx.lineTo(220, x); ctx.stroke();
      }
      ctx.restore();

      // Draw Sawblades
      saws.forEach(saw => {
        ctx.save();
        ctx.translate(saw.x, saw.y);
        ctx.rotate(saw.spin);
        ctx.fillStyle = '#999';
        ctx.beginPath();
        for(let i=0; i<8; i++) {
            let a = i * Math.PI/4;
            ctx.lineTo(Math.cos(a)*28, Math.sin(a)*28);
            ctx.lineTo(Math.cos(a+0.2)*18, Math.sin(a+0.2)*18);
        }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff3333'; ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      if(!isVersus && !gameOver && !p2.dead) {
        ctx.fillStyle = 'rgba(255,107,157,0.5)';
        ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        ctx.fillText('🤖 BOT', p2.x, p2.y - 30);
      }

      // Draw Players
      p1.draw();
      p2.draw();

      // Particles
      particles.forEach(p => {
        ctx.globalAlpha = p.life / 35;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Overlay
      if(gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, W, H);
        ctx.shadowBlur = 15; ctx.shadowColor = '#FFD700';
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 38px "Space Grotesk", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(winnerText, W/2, H/2 - 10);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = '18px monospace';
        ctx.fillText(`Qayta boshlash uchun '🔄 Qayta' tugmasini bosing`, W/2, H/2 + 30);
      }

      ctx.restore();
    }

    function loop() {
      update();
      draw();
      if(!gameOver) animId = requestAnimationFrame(loop);
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
