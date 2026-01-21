import Player from "../objects/Player.js";
import Checkpoint from "../objects/Checkpoint.js";

export default class LandScene extends Phaser.Scene {
  constructor() {
    super({ key: "LandScene" });
    this.player = null;
    this.platforms = null;
    this.checkpoints = [];
    this.worldHeight = 1400;
    this.hitCooldown = false;
  }

  preload() {
    this.load.image("land_platform", "assets/tiles/land_platform.png");
    this.load.image("checkpoint", "assets/tiles/checkpoint.png");
    this.load.image("kid1", "assets/characters/kid1.png");
  }

  create() {
    const { width } = this.scale;

    this.physics.world.setBounds(0, 0, width, this.worldHeight);
    this.cameras.main.setBounds(0, 0, width, this.worldHeight);

    this.platforms = this.physics.add.staticGroup();

    const tile = this.textures.get("land_platform").getSourceImage();
    const tileWidth = tile.width;

    for (let x = 0; x < width; x += tileWidth) {
      this.platforms.create(x + tileWidth * 0.5, this.worldHeight - 40, "land_platform");
    }

    const centerX = width * 0.5;
    const startY = this.worldHeight - 100;
    const stepY = 70;
    const offsets = [0, -60, 70, -80, 60, -50, 80, -70, 60, -60, 70, -80, 60, -50, 0];
    const platformPositions = [];

    offsets.forEach((offset, index) => {
      const x = centerX + offset;
      const y = startY - index * stepY;
      this._addPlatform(x, y);
      platformPositions.push({ x, y });
    });

    this.player = new Player(this, centerX, this.worldHeight - 160);
    this.player.setMode("land");

    this.physics.add.collider(this.player, this.platforms);

    const checkpointA = new Checkpoint(this, platformPositions[5].x, platformPositions[5].y - 70);
    const checkpointB = new Checkpoint(this, platformPositions[10].x, platformPositions[10].y - 70);
    this.checkpoints = [checkpointA, checkpointB];

    this.checkpoints.forEach((checkpoint) => {
      this.physics.add.overlap(this.player, checkpoint, () => {
        this.player.setCheckpoint(checkpoint.x, checkpoint.y - 40);
        checkpoint.activate();
      });
    });

    const topPlatform = platformPositions[platformPositions.length - 1];
    const kid = this.physics.add.staticSprite(topPlatform.x, topPlatform.y - 70, "kid1");
    kid.setScale(0.9);

    this.physics.add.overlap(this.player, kid, () => {
      this.scene.stop("HUDScene");
      this.scene.start("WaterScene");
    });

    const hud = this._ensureHud();
    hud.setPlayer(this.player);
    hud.setWorldName("Land World");

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.player.on("gameover", () => {
      this.scene.stop("HUDScene");
      this.scene.start("GameOverScene");
    });
  }

  _addPlatform(x, y) {
    const platform = this.platforms.create(x, y, "land_platform");
    platform.setScale(1);
    platform.refreshBody();
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
      this.time.delayedCall(500, () => {
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
