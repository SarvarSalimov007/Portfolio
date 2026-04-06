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
