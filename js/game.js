// ============================================================
// FACTORY QUEST — motor do jogo (Phaser 3)
// Desenha o chão de fábrica, paredes/corredores, o personagem
// (pixel art desenhado em código, sem imagens externas), as
// máquinas com ícones por tipo, e cuida do movimento/colisão.
// A lógica de missões/pontuação/quiz fica em js/app.js.
// ============================================================

class FactoryScene extends Phaser.Scene {
  constructor() {
    super('FactoryScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#080c14');
    this.drawFloorGrid();

    this.machineObjs = {};
    this.noteObjs = {};
    this.walls = [];

    SECTORS.forEach((sector) => {
      this.drawSector(sector);
      this.buildWallsForSector(sector);
    });
    this.drawWalls();

    NOTES.forEach((note) => {
      if (!window.gameState.pickedNotes.has(note.id)) this.drawNote(note);
    });

    this.player = this.createPlayerSprite(520, 330);
    this.playerSpeed = 220;
    this.playerRadius = 13;
    this.walkPhase = 0;
    this.facing = 1; // 1 = direita, -1 = esquerda

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

    this.promptText = this.add.text(0, 0, '', {
      fontFamily: 'Arial', fontSize: '12px', color: '#ffffff',
      backgroundColor: '#000000cc', padding: { x: 6, y: 3 }
    }).setVisible(false).setDepth(50);
  }

  // ---------- Cenário ----------
  drawFloorGrid() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x101828, 1);
    for (let x = 0; x <= GAME_CONFIG.worldWidth; x += 40) g.lineBetween(x, 0, x, GAME_CONFIG.worldHeight);
    for (let y = 0; y <= GAME_CONFIG.worldHeight; y += 40) g.lineBetween(0, y, GAME_CONFIG.worldWidth, y);
  }

  drawSector(sector) {
    const color = Phaser.Display.Color.HexStringToColor(sector.color).color;
    const rect = this.add.rectangle(sector.x + sector.w / 2, sector.y + sector.h / 2, sector.w, sector.h, color, 0.05);
    rect.setStrokeStyle(1, color, 0.3);

    this.add.text(sector.x + 14, sector.y + 10, sector.name.toUpperCase(), {
      fontFamily: 'Arial', fontSize: '13px', color: sector.color, fontStyle: 'bold'
    });

    sector.machines.forEach((machine) => {
      const box = this.add.rectangle(machine.x, machine.y, 74, 48, color, 0.9);
      box.setStrokeStyle(2, 0xffffff, 0.2);
      this.drawMachineIcon(machine.x, machine.y - 6, machine.icon, sector.color);
      this.add.text(machine.x, machine.y + 15, machine.label, {
        fontFamily: 'Arial', fontSize: '11px', color: '#0a0f1a', fontStyle: 'bold'
      }).setOrigin(0.5);

      this.machineObjs[machine.id] = { box, sectorId: sector.id, machine };
    });
  }

  // Ícones simples desenhados em código (sem imagens externas) por tipo de máquina
  drawMachineIcon(x, y, type) {
    const dark = 0x0a0f1a;
    const g = this.add.graphics();
    g.lineStyle(2, dark, 1);
    switch (type) {
      case 'gear': {
        g.strokeCircle(x, y, 9);
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          g.lineBetween(x + Math.cos(a) * 9, y + Math.sin(a) * 9, x + Math.cos(a) * 13, y + Math.sin(a) * 13);
        }
        break;
      }
      case 'spark': {
        g.beginPath();
        g.moveTo(x - 6, y - 10);
        g.lineTo(x + 2, y - 2);
        g.lineTo(x - 3, y);
        g.lineTo(x + 6, y + 10);
        g.lineTo(x - 1, y + 1);
        g.lineTo(x + 4, y - 1);
        g.closePath();
        g.strokePath();
        break;
      }
      case 'bolt': {
        g.beginPath();
        g.moveTo(x + 3, y - 11);
        g.lineTo(x - 6, y + 2);
        g.lineTo(x, y + 2);
        g.lineTo(x - 3, y + 11);
        g.lineTo(x + 7, y - 2);
        g.lineTo(x + 1, y - 2);
        g.closePath();
        g.strokePath();
        break;
      }
      case 'arm': {
        g.lineBetween(x - 8, y + 9, x - 2, y - 4);
        g.lineBetween(x - 2, y - 4, x + 7, y - 8);
        g.strokeCircle(x - 8, y + 9, 2.5);
        g.strokeCircle(x - 2, y - 4, 2.5);
        g.strokeCircle(x + 7, y - 8, 3);
        break;
      }
      case 'monitor': {
        g.strokeRect(x - 10, y - 8, 20, 13);
        g.lineBetween(x - 4, y + 8, x + 4, y + 8);
        g.lineBetween(x, y + 5, x, y + 8);
        break;
      }
      case 'conveyor': {
        g.strokeRect(x - 11, y - 3, 22, 8);
        g.strokeCircle(x - 8, y + 5, 3);
        g.strokeCircle(x + 8, y + 5, 3);
        break;
      }
      default:
        g.strokeCircle(x, y, 8);
    }
    g.setDepth(5);
  }

  // ---------- Paredes / corredores ----------
  buildWallsForSector(sector) {
    const t = GAME_CONFIG.wallThickness;
    const gap = GAME_CONFIG.doorGap;
    const { x, y, w, h, doorSide } = sector;

    const addH = (wx, wy, ww) => this.walls.push({ x: wx, y: wy, w: ww, h: t });
    const addV = (wx, wy, wh) => this.walls.push({ x: wx, y: wy, w: t, h: wh });

    // Topo
    if (doorSide === 'top') {
      addH(x, y, (w - gap) / 2);
      addH(x + (w + gap) / 2, y, (w - gap) / 2);
    } else {
      addH(x, y, w);
    }
    // Base
    if (doorSide === 'bottom') {
      addH(x, y + h, (w - gap) / 2);
      addH(x + (w + gap) / 2, y + h, (w - gap) / 2);
    } else {
      addH(x, y + h, w);
    }
    // Esquerda
    addV(x, y, h);
    // Direita
    addV(x + w, y, h);
  }

  drawWalls() {
    const g = this.add.graphics();
    g.fillStyle(0x1c2740, 1);
    this.walls.forEach((wall) => g.fillRect(wall.x, wall.y, wall.w, wall.h));
    g.setDepth(3);
  }

  // Colisão círculo (jogador) x retângulo (parede)
  circleHitsWall(cx, cy, r, wall) {
    const closestX = Phaser.Math.Clamp(cx, wall.x, wall.x + wall.w);
    const closestY = Phaser.Math.Clamp(cy, wall.y, wall.y + wall.h);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (r * r);
  }

  // ---------- Jogador (pixel art via código) ----------
  createPlayerSprite(x, y) {
    const container = this.add.container(x, y);

    const legL = this.add.rectangle(-4, 10, 5, 9, 0x2c3550);
    const legR = this.add.rectangle(4, 10, 5, 9, 0x2c3550);
    const body = this.add.rectangle(0, 2, 18, 14, 0xf7941d);
    const belt = this.add.rectangle(0, 7, 18, 3, 0x1a1206);
    const armL = this.add.rectangle(-11, 2, 4, 10, 0xf7941d);
    const armR = this.add.rectangle(11, 2, 4, 10, 0xf7941d);
    const head = this.add.circle(0, -10, 7, 0xe8c39e);
    const helmet = this.add.rectangle(0, -15, 16, 6, 0xffcc33);
    const helmetTop = this.add.arc(0, -15, 8, 180, 360, false, 0xffcc33).setOrigin(0.5, 1);

    container.add([legL, legR, armL, armR, body, belt, head, helmet, helmetTop]);
    container.legL = legL;
    container.legR = legR;
    container.armL = armL;
    container.armR = armR;
    container.setSize(22, 30);
    container.setDepth(20);
    return container;
  }

  animateWalk(container, moving, dt, facing) {
    container.setScale(facing >= 0 ? 1 : -1, 1);
    if (moving) {
      this.walkPhase += dt * 10;
      const swing = Math.sin(this.walkPhase) * 3;
      container.legL.y = 10 - swing;
      container.legR.y = 10 + swing;
      container.armL.y = 2 + swing * 0.6;
      container.armR.y = 2 - swing * 0.6;
    } else {
      container.legL.y = 10;
      container.legR.y = 10;
      container.armL.y = 2;
      container.armR.y = 2;
    }
  }

  // ---------- Notas / missões ----------
  drawNote(note) {
    const dot = this.add.circle(note.x, note.y, 8, 0xffcc33);
    dot.setStrokeStyle(2, 0xffffff, 0.7);
    dot.setDepth(10);
    this.tweens.add({ targets: dot, y: note.y - 6, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.noteObjs[note.id] = dot;
  }

  removeNoteVisual(noteId) {
    const dot = this.noteObjs[noteId];
    if (dot) { dot.destroy(); delete this.noteObjs[noteId]; }
  }

  markMachinePending(machineId, on) {
    const entry = this.machineObjs[machineId];
    if (!entry) return;
    if (entry.ring) { entry.ring.destroy(); entry.ring = null; }
    if (on) {
      const ring = this.add.circle(entry.machine.x, entry.machine.y, 46, 0xffcc33, 0);
      ring.setStrokeStyle(2, 0xffcc33, 0.9);
      this.tweens.add({ targets: ring, radius: 58, alpha: 0, duration: 900, repeat: -1 });
      entry.ring = ring;
    }
  }

  // ---------- Loop principal ----------
  update(time, delta) {
    if (window.gameState.paused) {
      this.promptText.setVisible(false);
      this.animateWalk(this.player, false, 0, this.facing);
      return;
    }
    const dt = delta / 1000;
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) dx = -1;
    if (this.cursors.right.isDown || this.keys.D.isDown) dx = 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) dy = -1;
    if (this.cursors.down.isDown || this.keys.S.isDown) dy = 1;
    if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

    const r = this.playerRadius;
    let nx = Phaser.Math.Clamp(this.player.x + dx * this.playerSpeed * dt, r, GAME_CONFIG.worldWidth - r);
    if (!this.walls.some((w) => this.circleHitsWall(nx, this.player.y, r, w))) {
      this.player.x = nx;
    }
    let ny = Phaser.Math.Clamp(this.player.y + dy * this.playerSpeed * dt, r, GAME_CONFIG.worldHeight - r);
    if (!this.walls.some((w) => this.circleHitsWall(this.player.x, ny, r, w))) {
      this.player.y = ny;
    }

    if (dx !== 0) this.facing = dx;
    this.animateWalk(this.player, dx !== 0 || dy !== 0, dt, this.facing);

    const target = this.findNearestInteractable();
    if (target) {
      this.promptText.setText(target.prompt).setPosition(target.x - 42, target.y - 44).setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.E) && target) {
      target.onInteract();
    }
  }

  findNearestInteractable() {
    for (const note of NOTES) {
      if (window.gameState.pickedNotes.has(note.id)) continue;
      const dot = this.noteObjs[note.id];
      if (!dot) continue;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, dot.x, dot.y) < 46) {
        return { x: dot.x, y: dot.y, prompt: '[E] Pegar missão', onInteract: () => window.onPickUpNote(note) };
      }
    }
    for (const machineId in this.machineObjs) {
      const m = this.machineObjs[machineId].machine;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, m.x, m.y) < 56) {
        return {
          x: m.x, y: m.y, prompt: '[E] Interagir',
          onInteract: () => window.onInteractMachine(this.machineObjs[machineId].sectorId, m)
        };
      }
    }
    return null;
  }
}

function startFactoryGame() {
  const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.worldWidth,
    height: GAME_CONFIG.worldHeight,
    parent: 'game-container',
    backgroundColor: '#080c14',
    scene: [FactoryScene]
  };
  window.phaserGame = new Phaser.Game(config);
}

function destroyFactoryGame() {
  if (window.phaserGame) {
    window.phaserGame.destroy(true);
    window.phaserGame = null;
  }
}
