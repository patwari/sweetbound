import Player from "../objects/Player.js";
import Checkpoint from "../objects/Checkpoint.js";
import MovingPlatform from "../objects/MovingPlatform.js";

export default class LavaScene extends Phaser.Scene {
  constructor() {
    super({ key: "LavaScene" });
    this.player = null;
    this.checkpoints = [];
    this.worldWidth = 1280;
    this.worldHeight = 1200;
    this.hitCooldown = false;
  }

  preload() {
    this.load.image("moving_platform", "assets/tiles/moving_platform.png");
    this.load.image("checkpoint", "assets/tiles/checkpoint.png");
    this.load.image("lava_tile", "assets/tiles/lava_tile.png");
    this.load.image("kid3", "assets/characters/kid3.png");
  }

  create() {
    const { width, height } = this.scale;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    const centerX = width * 0.5;
    const baseY = this.worldHeight - 200;
    const stepY = 70;
    const offsets = [-120, 40, -80, 60, -40, 40, -20];

    const platforms = [
      new MovingPlatform(this, centerX + offsets[0], baseY, "moving_platform", {
        type: "horizontal",
        distance: 160,
        duration: 2400,
      }),
      new MovingPlatform(this, centerX + offsets[1], baseY - stepY, "moving_platform", {
        type: "vertical",
        distance: 120,
        duration: 2100,
      }),
      new MovingPlatform(this, centerX + offsets[2], baseY - stepY * 2, "moving_platform", {
        type: "horizontal",
        distance: 140,
        duration: 2400,
      }),
      new MovingPlatform(this, centerX + offsets[3], baseY - stepY * 3, "moving_platform", {
        type: "vertical",
        distance: 120,
        duration: 2200,
      }),
      new MovingPlatform(this, centerX + offsets[4], baseY - stepY * 4, "moving_platform", {
        type: "circular",
        radius: 60,
        duration: 2600,
      }),
      new MovingPlatform(this, centerX + offsets[5], baseY - stepY * 5, "moving_platform", {
        type: "horizontal",
        distance: 120,
        duration: 2400,
      }),
      new MovingPlatform(this, centerX + offsets[6], baseY - stepY * 6, "moving_platform", {
        type: "vertical",
        distance: 100,
        duration: 2000,
      }),
    ];

    this.player = new Player(this, centerX + offsets[0], baseY - 80);
    this.player.setMode("lava");

    this._createLavaFloor(width, height);

    platforms.forEach((platform) => {
      this.physics.add.collider(this.player, platform);
    });

    const checkpointA = new Checkpoint(this, centerX + offsets[2], baseY - stepY * 2 - 70);
    const checkpointB = new Checkpoint(this, centerX + offsets[5], baseY - stepY * 5 - 70);
    this.checkpoints = [checkpointA, checkpointB];

    this.checkpoints.forEach((checkpoint) => {
      this.physics.add.overlap(this.player, checkpoint, () => {
        this.player.setCheckpoint(checkpoint.x, checkpoint.y - 40);
        checkpoint.activate();
      });
    });

    const kid = this.physics.add.staticSprite(centerX + offsets[6], baseY - stepY * 6 - 70, "kid3");
    kid.setScale(0.9);

    this.physics.add.overlap(this.player, kid, () => {
      this.scene.stop("HUDScene");
      this.scene.start("GameOverScene", { win: true });
    });

    const hud = this._ensureHud();
    hud.setPlayer(this.player);
    hud.setWorldName("Lava World");

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.player.on("gameover", () => {
      this.scene.stop("HUDScene");
      this.scene.start("GameOverScene");
    });
  }

  _createLavaFloor(width, height) {
    const lavaHeight = 120;
    const lavaY = this.worldHeight - lavaHeight * 0.5;
    const lava = this.add.tileSprite(0, lavaY, width, lavaHeight, "lava_tile");
    lava.setOrigin(0, 0.5);

    const lavaZone = this.add.zone(width * 0.5, lavaY, width, lavaHeight);
    this.physics.add.existing(lavaZone, true);

    this.physics.add.overlap(this.player, lavaZone, () => {
      this._loseLifeAndRespawn();
    });
  }

  _ensureHud() {
    if (!this.scene.isActive("HUDScene")) {
      this.scene.launch("HUDScene");
    }
    this.scene.bringToTop("HUDScene");
    return this.scene.get("HUDScene");
  }

  _loseLifeAndRespawn() {
    if (this.hitCooldown) return;
    this.hitCooldown = true;

    this.player.loseLife();

    if (this.player.getLives() > 0) {
      this.player.respawn();
      this.time.delayedCall(700, () => {
        this.hitCooldown = false;
      });
    }
  }

  update() {
    if (!this.player) return;
    this.player.update();

    if (this.player.y > this.worldHeight + 200) {
      this._loseLifeAndRespawn();
    }
  }
}
