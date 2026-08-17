// ============================================================
// FACTORY QUEST — motor do jogo (Phaser 3)
// Desenha o chão de fábrica, move o jogador e detecta interações.
// A lógica de missões/pontuação/quiz fica em js/app.js — este
// arquivo só cuida do "mundo" do jogo.
// ============================================================

class FactoryScene extends Phaser.Scene {
  constructor() {
    super('FactoryScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#080c14');
    this.drawFloorGrid();

    this.machineObjs = {}; // machineId -> { box }
    this.noteObjs = {};    // noteId -> circle

    SECTORS.forEach((sector) => this.drawSector(sector));
    NOTES.forEach((note) => {
      if (!window.gameState.pickedNotes.has(note.id)) this.drawNote(note);
    });

    // Player
    this.player = this.add.circle(520, 330, 14, 0xffffff);
    this.player.setStrokeStyle(3, 0xf7941d, 1);
    this.playerSpeed = 230;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

    this.promptText = this.add.text(0, 0, '', {
      fontFamily: 'Arial', fontSize: '12px', color: '#ffffff',
      backgroundColor: '#000000cc', padding: { x: 6, y: 3 }
    }).setVisible(false).setDepth(50);
  }

  drawFloorGrid() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x101828, 1);
    for (let x = 0; x <= GAME_CONFIG.worldWidth; x += 40) {
      g.lineBetween(x, 0, x, GAME_CONFIG.worldHeight);
    }
    for (let y = 0; y <= GAME_CONFIG.worldHeight; y += 40) {
      g.lineBetween(0, y, GAME_CONFIG.worldWidth, y);
    }
  }

  drawSector(sector) {
    const color = Phaser.Display.Color.HexStringToColor(sector.color).color;
    const rect = this.add.rectangle(
      sector.x + sector.w / 2, sector.y + sector.h / 2, sector.w, sector.h, color, 0.05
    );
    rect.setStrokeStyle(2, color, 0.9);

    this.add.text(sector.x + 14, sector.y + 10, sector.name.toUpperCase(), {
      fontFamily: 'Arial', fontSize: '13px', color: sector.color, fontStyle: 'bold'
    });

    sector.machines.forEach((machine) => {
      const box = this.add.rectangle(machine.x, machine.y, 74, 48, color, 0.9);
      box.setStrokeStyle(2, 0xffffff, 0.2);
      this.add.text(machine.x, machine.y - 8, machine.label, {
        fontFamily: 'Arial', fontSize: '13px', color: '#0a0f1a', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(machine.x, machine.y + 9, machine.name, {
        fontFamily: 'Arial', fontSize: '9px', color: '#0a0f1a'
      }).setOrigin(0.5);

      this.machineObjs[machine.id] = { box, sectorId: sector.id, machine };
    });
  }

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

  // Adds a soft pulsing ring around a machine to signal "mission pending here"
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

  update(time, delta) {
    if (window.gameState.paused) {
      this.promptText.setVisible(false);
      return;
    }
    const dt = delta / 1000;
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) dx = -1;
    if (this.cursors.right.isDown || this.keys.D.isDown) dx = 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) dy = -1;
    if (this.cursors.down.isDown || this.keys.S.isDown) dy = 1;
    if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

    this.player.x = Phaser.Math.Clamp(this.player.x + dx * this.playerSpeed * dt, 18, GAME_CONFIG.worldWidth - 18);
    this.player.y = Phaser.Math.Clamp(this.player.y + dy * this.playerSpeed * dt, 18, GAME_CONFIG.worldHeight - 18);

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
        return {
          x: dot.x, y: dot.y, prompt: '[E] Pegar missão',
          onInteract: () => window.onPickUpNote(note)
        };
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
