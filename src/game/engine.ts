// 2D Platformer Game Engine
import { soundManager } from '../audio/soundManager';
import { SpriteRenderer } from './sprites';

export interface Block {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'ground' | 'brick' | 'question' | 'empty' | 'pipe';
  bumpY: number;
  contents?: 'coin' | 'rubleBonus' | 'cake';
  hasBonus?: boolean;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  facing: 'left' | 'right';
  isAlive: boolean;
  isSquashed: boolean;
  squashTimer: number;
  initialX: number;
  range: number;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  value: number;
  collected: boolean;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public spriteRenderer: SpriteRenderer;

  // Virtual resolution
  public readonly V_WIDTH = 960;
  public readonly V_HEIGHT = 540;
  public readonly LEVEL_WIDTH = 5800;
  public readonly GROUND_Y = 460;

  // Game state
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isWon: boolean = false;
  public isGameOver: boolean = false;
  public onWinCallback: (() => void) | null = null;
  public onLivesChange: ((lives: number) => void) | null = null;

  // Player
  public player = {
    x: 80,
    y: 350,
    w: 36,
    h: 56,
    vx: 0,
    vy: 0,
    speed: 4.2,
    sprintSpeed: 6.8,
    isGrounded: false,
    isJumping: false,
    facing: 'right' as 'left' | 'right',
    animFrame: 0,
    isSuit: false,
    isInvincible: false,
    invincibleTimer: 0,
    isCelebrating: false
  };

  // Stats
  public rubles: number = 0;
  public score: number = 0;
  public lives: number = 3;
  public timer: number = 400;
  public finishX = 5000;

  // Finish Celebrations & Dance Animation
  public flagProgress: number = 0;
  public isDancing: boolean = false;
  public celebrationTimer: number = 0;
  public showCelebrationButton: boolean = false;

  // Camera
  public cameraX: number = 0;

  // Level data
  public blocks: Block[] = [];
  public enemies: Enemy[] = [];
  public coins: Coin[] = [];
  public floatingTexts: FloatingText[] = [];
  public particles: Particle[] = [];

  // Inputs
  public keys = {
    left: false,
    right: false,
    jump: false,
    sprint: false
  };

  private lastTime: number = 0;
  private animId: number | null = null;
  private timerInterval: number | null = null;

  constructor(canvas: HTMLCanvasElement, spriteRenderer: SpriteRenderer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.spriteRenderer = spriteRenderer;
    this.initLevel();
  }

  public initLevel() {
    this.isWon = false;
    this.isGameOver = false;
    this.rubles = 0;
    this.score = 0;
    this.lives = 3;
    if (this.onLivesChange) {
      this.onLivesChange(3);
    }
    this.timer = 400;
    this.cameraX = 0;
    this.finishX = 5000;
    this.flagProgress = 0;
    this.isDancing = false;
    this.celebrationTimer = 0;
    this.showCelebrationButton = false;

    this.player.x = 80;
    this.player.y = this.GROUND_Y - 56;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.isSuit = false;
    this.player.isInvincible = false;
    this.player.invincibleTimer = 0;
    this.player.isCelebrating = false;

    this.blocks = [];
    this.enemies = [];
    this.coins = [];
    this.floatingTexts = [];
    this.particles = [];

    // --- 1. CONTINUOUS GROUND SECTORS ---
    // Sector 1: Start to Gap 1 (0 to 1100)
    this.blocks.push({ id: 1, x: 0, y: this.GROUND_Y, w: 1100, h: 80, type: 'ground', bumpY: 0 });
    // Sector 2: Завод Лакокраска (1240 to 2320)
    this.blocks.push({ id: 2, x: 1240, y: this.GROUND_Y, w: 1080, h: 80, type: 'ground', bumpY: 0 });
    // Sector 3: Ярославский политехнический институт (2460 to 3580)
    this.blocks.push({ id: 3, x: 2460, y: this.GROUND_Y, w: 1120, h: 80, type: 'ground', bumpY: 0 });
    // Sector 4: Ресторан Subway -> Ресторан МАМУКА (3720 to 5520)
    this.blocks.push({ id: 4, x: 3720, y: this.GROUND_Y, w: 1800, h: 80, type: 'ground', bumpY: 0 });

    let blockId = 10;

    // --- SECTOR 1 PLATFORMS (0..1100) ---
    this.blocks.push({ id: blockId++, x: 280, y: 340, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'rubleBonus', hasBonus: true });
    this.blocks.push({ id: blockId++, x: 360, y: 340, w: 40, h: 40, type: 'brick', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 400, y: 340, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'rubleBonus', hasBonus: true });
    this.blocks.push({ id: blockId++, x: 440, y: 340, w: 40, h: 40, type: 'brick', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 480, y: 340, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'coin', hasBonus: true });
    this.blocks.push({ id: blockId++, x: 400, y: 220, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'cake', hasBonus: true });

    // Pipes
    this.blocks.push({ id: blockId++, x: 620, y: this.GROUND_Y - 60, w: 56, h: 60, type: 'pipe', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 880, y: this.GROUND_Y - 80, w: 56, h: 80, type: 'pipe', bumpY: 0 });

    // Stepping stones across Gap 1 (1100..1240) in front of Завод Лакокраска
    this.blocks.push({ id: blockId++, x: 1040, y: 380, w: 40, h: 40, type: 'brick', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 1110, y: 340, w: 50, h: 36, type: 'brick', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 1180, y: 360, w: 50, h: 36, type: 'brick', bumpY: 0 });

    // --- SECTOR 2: ЗАВОД ЛАКОКРАСКА (1240..2320) ---
    this.blocks.push({ id: blockId++, x: 1400, y: this.GROUND_Y - 70, w: 56, h: 70, type: 'pipe', bumpY: 0 });
    // Ruble mystery cluster
    for (let i = 0; i < 5; i++) {
      this.blocks.push({
        id: blockId++,
        x: 1540 + i * 40,
        y: 330,
        w: 40,
        h: 40,
        type: i % 2 === 0 ? 'question' : 'brick',
        bumpY: 0,
        contents: 'rubleBonus',
        hasBonus: true
      });
    }
    this.blocks.push({ id: blockId++, x: 1740, y: this.GROUND_Y - 95, w: 56, h: 95, type: 'pipe', bumpY: 0 });
    // High sky platform with cake
    this.blocks.push({ id: blockId++, x: 1900, y: 260, w: 120, h: 30, type: 'brick', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 1940, y: 160, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'cake', hasBonus: true });
    this.blocks.push({ id: blockId++, x: 2100, y: this.GROUND_Y - 80, w: 56, h: 80, type: 'pipe', bumpY: 0 });

    // Stepping stones across Gap 2 (2320..2460) near Политехнический институт
    this.blocks.push({ id: blockId++, x: 2340, y: 370, w: 45, h: 36, type: 'brick', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 2400, y: 320, w: 45, h: 36, type: 'brick', bumpY: 0 });

    // --- SECTOR 3: ЯРОСЛАВСКИЙ ПОЛИТЕХНИЧЕСКИЙ ИНСТИТУТ (2460..3580) ---
    this.blocks.push({ id: blockId++, x: 2620, y: this.GROUND_Y - 75, w: 56, h: 75, type: 'pipe', bumpY: 0 });
    // Colonnade stepped blocks
    this.blocks.push({ id: blockId++, x: 2740, y: 340, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'rubleBonus', hasBonus: true });
    this.blocks.push({ id: blockId++, x: 2780, y: 340, w: 40, h: 40, type: 'brick', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 2820, y: 340, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'rubleBonus', hasBonus: true });
    this.blocks.push({ id: blockId++, x: 2980, y: this.GROUND_Y - 100, w: 56, h: 100, type: 'pipe', bumpY: 0 });

    // High university bridge
    for (let i = 0; i < 4; i++) {
      this.blocks.push({
        id: blockId++,
        x: 3120 + i * 40,
        y: 280,
        w: 40,
        h: 40,
        type: i === 1 ? 'question' : 'brick',
        bumpY: 0,
        contents: 'rubleBonus',
        hasBonus: true
      });
    }
    this.blocks.push({ id: blockId++, x: 3380, y: this.GROUND_Y - 80, w: 56, h: 80, type: 'pipe', bumpY: 0 });

    // Stepping stones across Gap 3 (3580..3720) near ресторан Subway
    this.blocks.push({ id: blockId++, x: 3600, y: 360, w: 50, h: 36, type: 'brick', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 3660, y: 320, w: 50, h: 36, type: 'brick', bumpY: 0 });

    // --- SECTOR 4: РЕСТОРАН SUBWAY -> РЕСТОРАН МАМУКА (3720..5520) ---
    this.blocks.push({ id: blockId++, x: 3880, y: this.GROUND_Y - 75, w: 56, h: 75, type: 'pipe', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 4000, y: 330, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'rubleBonus', hasBonus: true });
    this.blocks.push({ id: blockId++, x: 4040, y: 330, w: 40, h: 40, type: 'brick', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 4080, y: 330, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'rubleBonus', hasBonus: true });
    this.blocks.push({ id: blockId++, x: 4200, y: this.GROUND_Y - 90, w: 56, h: 90, type: 'pipe', bumpY: 0 });

    // Grand Triumphal Pyramid Staircase (4340..4720)
    // 5 Steps ascending
    for (let s = 0; s < 5; s++) {
      for (let h = 0; h <= s; h++) {
        this.blocks.push({
          id: blockId++,
          x: 4340 + s * 36,
          y: this.GROUND_Y - (h + 1) * 36,
          w: 36,
          h: 36,
          type: 'brick',
          bumpY: 0
        });
      }
    }
    // High apex platform with cake
    this.blocks.push({ id: blockId++, x: 4520, y: this.GROUND_Y - 5 * 36, w: 80, h: 36, type: 'brick', bumpY: 0 });
    this.blocks.push({ id: blockId++, x: 4540, y: this.GROUND_Y - 8 * 36, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'cake', hasBonus: true });
    // 5 Steps descending
    for (let s = 0; s < 5; s++) {
      for (let h = 0; h <= (4 - s); h++) {
        this.blocks.push({
          id: blockId++,
          x: 4600 + s * 36,
          y: this.GROUND_Y - (h + 1) * 36,
          w: 36,
          h: 36,
          type: 'brick',
          bumpY: 0
        });
      }
    }

    // Final celebration question blocks before Mamuka
    this.blocks.push({ id: blockId++, x: 4860, y: 340, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'rubleBonus', hasBonus: true });
    this.blocks.push({ id: blockId++, x: 4900, y: 340, w: 40, h: 40, type: 'question', bumpY: 0, contents: 'rubleBonus', hasBonus: true });

    // --- 3. CHALLENGING ENEMIES (13 Patrols) ---
    let enemyId = 1;
    const enemyConfigs = [
      { x: 480, range: 100, vx: -1.3 },
      { x: 780, range: 110, vx: -1.4 },
      { x: 1340, range: 80, vx: -1.5 },
      { x: 1620, range: 120, vx: -1.6 },
      { x: 1960, range: 90, vx: -1.5 },
      { x: 2220, range: 95, vx: -1.6 },
      { x: 2560, range: 90, vx: -1.6 },
      { x: 2880, range: 110, vx: -1.7 },
      { x: 3260, range: 95, vx: -1.7 },
      { x: 3500, range: 80, vx: -1.8 },
      { x: 3820, range: 90, vx: -1.8 },
      { x: 4120, range: 110, vx: -1.9 },
      { x: 4760, range: 90, vx: -1.6 }
    ];

    enemyConfigs.forEach(cfg => {
      this.enemies.push({
        id: enemyId++,
        x: cfg.x,
        y: this.GROUND_Y - 50,
        w: 34,
        h: 50,
        vx: cfg.vx,
        facing: 'left',
        isAlive: true,
        isSquashed: false,
        squashTimer: 0,
        initialX: cfg.x,
        range: cfg.range
      });
    });

    // --- 4. COINS & RUBLES SPAWNS ---
    let coinId = 1;
    const coinSpawns = [
      { x: 320, y: 340, val: 500 },
      { x: 440, y: 170, val: 1000 },
      { x: 635, y: this.GROUND_Y - 95, val: 500 },
      { x: 700, y: 400, val: 500 },
      { x: 895, y: this.GROUND_Y - 115, val: 1000 },
      { x: 1125, y: 290, val: 1500 },
      { x: 1195, y: 310, val: 1500 },
      { x: 1415, y: this.GROUND_Y - 105, val: 1000 },
      { x: 1680, y: 330, val: 500 },
      { x: 1755, y: this.GROUND_Y - 130, val: 1500 },
      { x: 1940, y: 220, val: 2000 },
      { x: 2115, y: this.GROUND_Y - 115, val: 1000 },
      { x: 2355, y: 320, val: 1500 },
      { x: 2415, y: 270, val: 2000 },
      { x: 2635, y: this.GROUND_Y - 110, val: 1000 },
      { x: 2800, y: 290, val: 1500 },
      { x: 2995, y: this.GROUND_Y - 135, val: 1500 },
      { x: 3180, y: 230, val: 2000 },
      { x: 3615, y: 310, val: 1500 },
      { x: 3675, y: 270, val: 2000 },
      { x: 3895, y: this.GROUND_Y - 110, val: 1000 },
      { x: 4060, y: 280, val: 1500 },
      { x: 4215, y: this.GROUND_Y - 125, val: 1500 },
      { x: 4540, y: this.GROUND_Y - 240, val: 3000 },
      { x: 4880, y: 290, val: 2500 }
    ];

    coinSpawns.forEach(c => {
      this.coins.push({
        id: coinId++,
        x: c.x,
        y: c.y,
        w: 24,
        h: 24,
        value: c.val,
        collected: false
      });
    });
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = window.setInterval(() => {
      if (this.isRunning && !this.isPaused && !this.isWon && this.timer > 0) {
        this.timer--;
        if (this.timer <= 0) {
          this.gameOver();
        }
      }
    }, 1000);

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      if (!this.isPaused) {
        this.update(dt);
      }
      this.render();

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  public update(dt: number) {
    if (this.isWon) {
      this.celebrationTimer += dt;
      this.player.animFrame += dt * 8;

      // 1. Walk hero smoothly in business suit to friends in front of Mamuka restaurant
      const targetHeroX = this.finishX + 160;
      if (this.player.x < targetHeroX) {
        this.player.vx = 2.4;
        this.player.x += this.player.vx;
        this.player.facing = 'right';
      } else {
        this.player.vx = 0;
        this.player.facing = 'left'; // Turns to friends and smiles!
      }

      // 2. Smoothly raise the flag up the flagpole
      if (this.flagProgress < 1.0) {
        this.flagProgress = Math.min(1.0, this.flagProgress + dt * 0.7); // Rises in ~1.4 seconds!
        if (this.flagProgress >= 1.0) {
          this.isDancing = true; // Flag reached top -> start all dancing!
          this.addFloatingText('🎂 ТАНЦУЮТ ВСЕ! ТЕБЕ 30 ЛЕТ! 💃', this.finishX + 110, this.GROUND_Y - 170, '#ec4899');
        }
      } else {
        this.isDancing = true;
      }

      // 3. Keep camera centered on the finish celebration & dancing characters
      const targetCamX = this.finishX - this.V_WIDTH * 0.22;
      this.cameraX += (targetCamX - this.cameraX) * 0.08;

      // 4. Continuous celebratory fireworks and confetti
      if (Math.random() < 0.24) {
        this.spawnConfettiParticles(
          this.finishX + 60 + Math.random() * 200,
          this.GROUND_Y - 140 - Math.random() * 80,
          Math.random() < 0.5 ? '#ec4899' : '#f59e0b'
        );
      }

      this.updateParticles(dt);
      this.updateFloatingTexts(dt);

      // 5. After dancing for 4 seconds, mark showCelebrationButton = true and notify
      if (this.celebrationTimer >= 3.8 && !this.showCelebrationButton) {
        this.showCelebrationButton = true;
        if (this.onWinCallback) {
          this.onWinCallback();
        }
      }
      return;
    }

    if (this.isGameOver) return;

    // Reduce invulnerability timer
    if (this.player.isInvincible) {
      this.player.invincibleTimer -= dt;
      if (this.player.invincibleTimer <= 0) {
        this.player.isInvincible = false;
      }
    }

    // --- PLAYER MOVEMENT ---
    const speed = this.keys.sprint ? this.player.sprintSpeed : this.player.speed;

    if (this.keys.left) {
      this.player.vx = -speed;
      this.player.facing = 'left';
      this.player.animFrame += dt * 12;
    } else if (this.keys.right) {
      this.player.vx = speed;
      this.player.facing = 'right';
      this.player.animFrame += dt * 12;
    } else {
      this.player.vx *= 0.75;
      if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
    }

    // Jump
    if (this.keys.jump && this.player.isGrounded) {
      this.player.vy = -13.5;
      this.player.isGrounded = false;
      this.player.isJumping = true;
      soundManager.playJump();
    }

    // Gravity
    this.player.vy += 0.65;
    if (this.player.vy > 14) this.player.vy = 14;

    // Move player horizontally
    this.player.x += this.player.vx;
    this.checkHorizontalCollisions();

    // Move player vertically
    this.player.y += this.player.vy;
    this.player.isGrounded = false;
    this.checkVerticalCollisions();

    // Check bottom fall death
    if (this.player.y > this.V_HEIGHT + 100) {
      this.playerDied();
    }

    // --- CHECK FINISH LINE (x >= finishX) ---
    if (this.player.x >= this.finishX && !this.isWon) {
      this.triggerWin();
    }

    // --- UPDATE ENEMIES ---
    this.enemies.forEach(enemy => {
      if (!enemy.isAlive) {
        if (enemy.isSquashed) {
          enemy.squashTimer += dt;
        }
        return;
      }

      enemy.x += enemy.vx;
      // Patrol within range
      if (enemy.x < enemy.initialX - enemy.range) {
        enemy.vx = Math.abs(enemy.vx);
        enemy.facing = 'right';
      } else if (enemy.x > enemy.initialX + enemy.range) {
        enemy.vx = -Math.abs(enemy.vx);
        enemy.facing = 'left';
      }

      // Check collision with player
      this.checkEnemyCollision(enemy);
    });

    // --- CHECK COIN PICKUPS ---
    this.coins.forEach(coin => {
      if (!coin.collected && this.checkOverlap(this.player, coin)) {
        coin.collected = true;
        this.rubles += coin.value;
        this.score += coin.value;
        soundManager.playCoin();
        this.addFloatingText(`+${coin.value} ₽`, coin.x, coin.y - 10, '#facc15');
      }
    });

    // --- UPDATE BLOCK BUMP ANIMATION ---
    this.blocks.forEach(b => {
      if (b.bumpY < 0) {
        b.bumpY += 2;
        if (b.bumpY > 0) b.bumpY = 0;
      }
    });

    // --- UPDATE FLOATING TEXTS & PARTICLES ---
    this.updateFloatingTexts(dt);
    this.updateParticles(dt);

    // --- CAMERA SCROLL ---
    // Keep player roughly centered in virtual canvas
    const targetCamX = this.player.x - this.V_WIDTH * 0.38;
    this.cameraX += (targetCamX - this.cameraX) * 0.15;
    if (this.cameraX < 0) this.cameraX = 0;
    if (this.cameraX > this.LEVEL_WIDTH - this.V_WIDTH) {
      this.cameraX = this.LEVEL_WIDTH - this.V_WIDTH;
    }
  }

  private checkHorizontalCollisions() {
    this.blocks.forEach(block => {
      if (this.checkOverlap(this.player, block)) {
        if (this.player.vx > 0) {
          this.player.x = block.x - this.player.w;
          this.player.vx = 0;
        } else if (this.player.vx < 0) {
          this.player.x = block.x + block.w;
          this.player.vx = 0;
        }
      }
    });
  }

  private checkVerticalCollisions() {
    this.blocks.forEach(block => {
      if (this.checkOverlap(this.player, block)) {
        if (this.player.vy > 0) {
          // Landing on top of block
          this.player.y = block.y - this.player.h;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.isJumping = false;
        } else if (this.player.vy < 0) {
          // Hitting block from below
          this.player.y = block.y + block.h;
          this.player.vy = 0;
          this.hitBlock(block);
        }
      }
    });
  }

  private hitBlock(block: Block) {
    block.bumpY = -12;
    soundManager.playBlockBump();

    if (block.type === 'question' && block.hasBonus) {
      block.hasBonus = false;
      block.type = 'empty';

      if (block.contents === 'rubleBonus') {
        const bonus = 2500;
        this.rubles += bonus;
        this.score += bonus;
        soundManager.playCoin();
        this.addFloatingText(`+${bonus} ₽! 💰`, block.x, block.y - 20, '#fbbf24');
        this.spawnConfettiParticles(block.x + 20, block.y, '#f59e0b');
      } else if (block.contents === 'cake') {
        this.rubles += 3000;
        this.score += 3000;
        soundManager.playPowerUp();
        this.addFloatingText('+3000 ₽ ТОРТ 30 ЛЕТ! 🎂', block.x - 30, block.y - 25, '#ec4899');
        this.spawnConfettiParticles(block.x + 20, block.y, '#ec4899');
      } else {
        this.rubles += 1000;
        this.score += 1000;
        soundManager.playCoin();
        this.addFloatingText('+1000 ₽', block.x, block.y - 20, '#facc15');
      }
    } else if (block.type === 'brick') {
      this.spawnConfettiParticles(block.x + 20, block.y, '#ca8a04');
    }
  }

  private checkEnemyCollision(enemy: Enemy) {
    if (!this.checkOverlap(this.player, enemy)) return;

    // Check stomp from above
    const playerBottom = this.player.y + this.player.h;
    const enemyTop = enemy.y + 14;

    if (this.player.vy > 0 && playerBottom <= enemyTop + 14) {
      // SQUASH ENEMY!
      enemy.isAlive = false;
      enemy.isSquashed = true;
      enemy.squashTimer = 0;
      this.player.vy = -9.5; // Bounce up
      this.rubles += 1500;
      this.score += 1500;
      soundManager.playStomp();
      this.addFloatingText('+1500 ₽! ХЛОП!', enemy.x, enemy.y - 15, '#22c55e');
      this.spawnConfettiParticles(enemy.x + 17, enemy.y, '#3b82f6');
    } else {
      // Side hit - lose life
      if (!this.player.isInvincible) {
        this.playerDied();
      }
    }
  }

  private playerDied() {
    this.lives--;
    soundManager.playHurt();
    if (this.onLivesChange) {
      this.onLivesChange(this.lives);
    }

    if (this.lives <= 0) {
      this.addFloatingText('💔 ВСЕ ЖИЗНИ ПОТРАЧЕНЫ!', this.player.x, this.player.y - 20, '#ef4444');
      this.gameOver();
    } else {
      // Find safe ground position to respawn
      let safeX = Math.max(80, this.player.x - 180);
      const ground = this.blocks.find(b => b.type === 'ground' && safeX >= b.x && safeX <= b.x + b.w - 50);
      if (!ground) {
        const nearestGround = this.blocks
          .filter(b => b.type === 'ground' && b.x <= this.player.x)
          .sort((a, b) => b.x - a.x)[0];
        safeX = nearestGround ? nearestGround.x + 50 : 80;
      }

      this.player.x = safeX;
      this.player.y = this.GROUND_Y - 56;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.isInvincible = true;
      this.player.invincibleTimer = 2.4;
      this.addFloatingText(`💔 -1 ЖИЗНЬ! (Осталось: ${this.lives})`, this.player.x, this.player.y - 25, '#ef4444');
    }
  }

  public triggerWin() {
    this.isWon = true;
    this.celebrationTimer = 0;
    this.flagProgress = 0;
    this.isDancing = false;
    this.showCelebrationButton = false;
    this.player.isCelebrating = true;
    this.player.isSuit = true; // Transform to strict business suit!
    this.score += 5000;

    // Spawn massive celebration confetti
    for (let i = 0; i < 60; i++) {
      this.spawnConfettiParticles(this.finishX + 80 + Math.random() * 200, this.GROUND_Y - 100 - Math.random() * 150, '#f59e0b');
    }

    // Play Sektor Gaza "Мне сегодня 30 лет"
    soundManager.playSectorGaza30();

    this.addFloatingText('🎉 ФЛАГ ПОДНИМАЕТСЯ! ТЕБЕ 30 ЛЕТ! 🎂', this.finishX + 60, this.GROUND_Y - 120, '#fbbf24');
  }

  public gameOver() {
    this.isGameOver = true;
    this.isRunning = false;
  }

  private checkOverlap(
    r1: { x: number; y: number; w: number; h: number },
    r2: { x: number; y: number; w: number; h: number }
  ): boolean {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#facc15') {
    this.floatingTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      vy: -1.2,
      alpha: 1.0,
      color
    });
  }

  private updateFloatingTexts(dt: number) {
    this.floatingTexts.forEach(ft => {
      ft.y += ft.vy;
      ft.alpha -= dt * 0.9;
    });
    this.floatingTexts = this.floatingTexts.filter(ft => ft.alpha > 0);
  }

  public spawnConfettiParticles(x: number, y: number, baseColor: string) {
    const colors = [baseColor, '#f43f5e', '#3b82f6', '#10b981', '#facc15', '#a855f7'];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.6
      });
    }
  }

  private updateParticles(dt: number) {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      p.life += dt;
    });
    this.particles = this.particles.filter(p => p.life < p.maxLife);
  }

  // --- RENDERING PIPELINE ---
  public render() {
    const { ctx, V_WIDTH, V_HEIGHT, cameraX } = this;

    // Clear Screen
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    // 1. SKY GRADIENT (Bright Retro Mario Sky)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
    skyGrad.addColorStop(0, '#5c94fc'); // Classic NES Mario sky
    skyGrad.addColorStop(0.7, '#88b5fe');
    skyGrad.addColorStop(1, '#c0d9fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // 2. PARALLAX CLOUDS & DISTANT HILLS
    this.drawParallaxBackground(cameraX);

    // 3. WORLD ENTITIES (Translated by Camera)
    ctx.save();
    ctx.translate(-cameraX, 0);

    // BACKGROUND LANDMARKS OF YAROSLAVL:
    this.spriteRenderer.drawLacockraska(ctx, 1100, this.GROUND_Y);
    this.spriteRenderer.drawPolitekh(ctx, 2350, this.GROUND_Y);
    this.spriteRenderer.drawSubway(ctx, 3600, this.GROUND_Y);

    // Render Blocks
    this.blocks.forEach(b => this.drawBlock(b));

    // Render Coins
    this.coins.forEach(c => {
      if (!c.collected) {
        this.drawCoin(c.x, c.y, c.value);
      }
    });

    // Render Enemies (Guy in Blue Suit)
    this.enemies.forEach(e => {
      if (e.isAlive || (e.isSquashed && e.squashTimer < 0.6)) {
        this.spriteRenderer.drawEnemy(
          ctx,
          e.x,
          e.y,
          e.w,
          e.h,
          e.facing,
          this.player.animFrame,
          e.isSquashed
        );
      }
    });

    // Render Castle & Finish Area (Photo 3 with friends, Rising Flag, Dancing)
    this.spriteRenderer.drawFinishCelebration(
      ctx,
      this.finishX,
      this.GROUND_Y,
      this.flagProgress,
      this.isDancing,
      this.player.animFrame
    );

    // Render Player (Girl in Blue Dress / Dancing in Strict Suit)
    this.spriteRenderer.drawHero(
      ctx,
      this.player.x,
      this.player.y,
      this.player.w,
      this.player.h,
      this.player.facing,
      this.player.animFrame,
      this.player.isJumping,
      this.player.isSuit,
      this.isDancing,
      this.player.isInvincible
    );

    // Render Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.size, p.size);
      ctx.fill();
    });

    // Render Floating Text Popups
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 15px "Rubik", sans-serif';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();

    // 4. RETRO HUD (Top Bar)
    this.drawHUD();
  }

  private drawParallaxBackground(camX: number) {
    const { ctx, V_WIDTH } = this;

    // Distant layered green hills (slow parallax 0.15)
    ctx.fillStyle = '#4ade80';
    for (let i = -1; i < 8; i++) {
      const hillX = i * 400 - (camX * 0.15) % 400;
      ctx.beginPath();
      ctx.arc(hillX + 200, 480, 180, Math.PI, 0);
      ctx.fill();
    }

    // Closer stylized bushes (parallax 0.35)
    ctx.fillStyle = '#22c55e';
    for (let i = -1; i < 12; i++) {
      const bushX = i * 300 - (camX * 0.35) % 300;
      ctx.beginPath();
      ctx.arc(bushX + 80, 470, 40, Math.PI, 0);
      ctx.arc(bushX + 110, 460, 50, Math.PI, 0);
      ctx.arc(bushX + 140, 470, 40, Math.PI, 0);
      ctx.fill();
    }

    // Clouds (parallax 0.08)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) {
      const cloudX = i * 450 - (camX * 0.08) % 450;
      const cloudY = 70 + (i % 3) * 35;
      ctx.beginPath();
      ctx.arc(cloudX + 40, cloudY, 24, 0, Math.PI * 2);
      ctx.arc(cloudX + 70, cloudY - 10, 30, 0, Math.PI * 2);
      ctx.arc(cloudX + 100, cloudY, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawBlock(block: Block) {
    const { ctx } = this;
    const y = block.y + block.bumpY;

    if (block.type === 'ground') {
      // Grass top layer
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(block.x, y, block.w, 14);
      // Dark grass line
      ctx.fillStyle = '#15803d';
      ctx.fillRect(block.x, y + 10, block.w, 4);
      // Earth dirt body
      ctx.fillStyle = '#d97706';
      ctx.fillRect(block.x, y + 14, block.w, block.h - 14);
      // Dirt texture bricks
      ctx.fillStyle = '#b45309';
      for (let tx = block.x; tx < block.x + block.w; tx += 40) {
        ctx.fillRect(tx + 4, y + 22, 14, 8);
        ctx.fillRect(tx + 22, y + 36, 14, 8);
      }
    } else if (block.type === 'brick') {
      // Brown Brick Block
      ctx.fillStyle = '#b45309';
      ctx.fillRect(block.x, y, block.w, block.h);
      ctx.fillStyle = '#78350f';
      ctx.strokeRect(block.x, y, block.w, block.h);
      // Brick mortar lines
      ctx.fillStyle = '#451a03';
      ctx.fillRect(block.x, y + 19, block.w, 3);
      ctx.fillRect(block.x + 19, y, 3, 19);
      ctx.fillRect(block.x + 10, y + 21, 3, 19);
      ctx.fillRect(block.x + 30, y + 21, 3, 19);
    } else if (block.type === 'question') {
      // Golden [?] Mystery Block
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(block.x, y, block.w, block.h);
      ctx.fillStyle = '#d97706';
      ctx.strokeRect(block.x, y, block.w, block.h);

      // Corner rivets
      ctx.fillStyle = '#78350f';
      ctx.fillRect(block.x + 3, y + 3, 3, 3);
      ctx.fillRect(block.x + block.w - 6, y + 3, 3, 3);
      ctx.fillRect(block.x + 3, y + block.h - 6, 3, 3);
      ctx.fillRect(block.x + block.w - 6, y + block.h - 6, 3, 3);

      // Question mark or "30"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Press Start 2P", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', block.x + block.w / 2, y + 28);
    } else if (block.type === 'empty') {
      // Empty used block
      ctx.fillStyle = '#78716c';
      ctx.fillRect(block.x, y, block.w, block.h);
      ctx.strokeStyle = '#44403c';
      ctx.strokeRect(block.x, y, block.w, block.h);
    } else if (block.type === 'pipe') {
      // Green Mario Pipe
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(block.x, y, block.w, block.h);
      // Pipe top rim
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(block.x - 4, y, block.w + 8, 22);
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.strokeRect(block.x - 4, y, block.w + 8, 22);
      ctx.strokeRect(block.x, y + 22, block.w, block.h - 22);
      // Pipe highlight
      ctx.fillStyle = '#86efac';
      ctx.fillRect(block.x + 6, y + 24, 6, block.h - 24);
      ctx.fillRect(block.x + 4, y + 2, 8, 18);
    }
  }

  private drawCoin(x: number, y: number, value: number) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x + 12, y + 12);

    // Glowing Russian Ruble Coin
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₽', 0, 0);

    ctx.restore();
  }

  private drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, filled: boolean) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    const size = 9;
    ctx.moveTo(0, size * 0.4);
    ctx.bezierCurveTo(-size * 0.8, -size * 0.4, -size * 1.3, size * 0.5, 0, size * 1.3);
    ctx.bezierCurveTo(size * 1.3, size * 0.5, size * 0.8, -size * 0.4, 0, size * 0.4);
    ctx.closePath();
    if (filled) {
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#334155';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawHUD() {
    const { ctx, V_WIDTH } = this;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, V_WIDTH, 48);

    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';

    // HERO NAME
    ctx.fillText('ПОДРУГА', 18, 30);

    // LIVES (3 Hearts)
    ctx.fillStyle = '#fb7185';
    ctx.fillText('ЖИЗНИ:', 135, 30);
    for (let i = 0; i < 3; i++) {
      this.drawHeart(ctx, 225 + i * 22, 21, i < this.lives);
    }

    // RUBLES COIN COUNTER
    ctx.fillStyle = '#facc15';
    ctx.fillText(`МОНЕТЫ: ${this.rubles.toLocaleString('ru-RU')} ₽`, 310, 30);

    // WORLD / AGE
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('30 ЛЕТ', 680, 30);

    // TIME
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`ВРЕМЯ: ${this.timer}`, 810, 30);

    // CELEBRATION DANCE BANNER
    if (this.isDancing) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(V_WIDTH / 2 - 270, 56, 540, 44, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 14px "Rubik", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎂 С ДНЁМ РОЖДЕНИЯ, ПОДРУГА! ТЕБЕ 30 ЛЕТ! 🎂', V_WIDTH / 2, 75);
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 11px "Rubik", sans-serif';
      ctx.fillText('💃 Именинница в строгом костюме и друзья танцуют под Сектор Газа! 🎵', V_WIDTH / 2, 92);
    }

    ctx.restore();
  }
}
