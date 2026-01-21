import Player from "../objects/Player.js";
import Checkpoint from "../objects/Checkpoint.js";
import MovingPlatform from "../objects/MovingPlatform.js";
import Bomb from "../objects/Bomb.js";

export default class WaterScene extends Phaser.Scene {
  constructor() {
    super({ key: "WaterScene" });
    this.player = null;
    this.platforms = null;
    this.bombs = null;
    this.checkpoints = [];
    this.worldWidth = 1800;
    this.worldHeight = 900;
    this.hitCooldown = false;
  }

  preload() {
    this.load.image("water_platform", "assets/tiles/water_platform.png");
    this.load.image("moving_platform", "assets/tiles/moving_platform.png");
    this.load.image("checkpoint", "assets/tiles/checkpoint.png");
    this.load.image("bomb", "assets/tiles/bomb.png");
    this.load.image("kid2", "assets/characters/kid2.png");
  }

  create() {
    const { width, height } = this.scale;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.platforms = this.physics.add.staticGroup();

    this._addStaticPlatform(200, height * 0.5);
    this._addStaticPlatform(600, height * 0.35);
    this._addStaticPlatform(1000, height * 0.6);
    this._addStaticPlatform(1400, height * 0.4);

    const horizontal = new MovingPlatform(this, 350, height * 0.75, "moving_platform", {
      type: "horizontal",
      distance: 220,
      duration: 2600,
    });

    const vertical = new MovingPlatform(this, 900, height * 0.2, "moving_platform", {
      type: "vertical",
      distance: 180,
      duration: 2200,
    });

    const circular = new MovingPlatform(this, 1300, height * 0.75, "moving_platform", {
      type: "circular",
      radius: 90,
      duration: 2600,
    });

    this.player = new Player(this, 120, height * 0.6);
    this.player.setMode("water");

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, horizontal);
    this.physics.add.collider(this.player, vertical);
    this.physics.add.collider(this.player, circular);

    const checkpointA = new Checkpoint(this, 680, height * 0.3);
    const checkpointB = new Checkpoint(this, 1400, height * 0.35);
    this.checkpoints = [checkpointA, checkpointB];

    this.checkpoints.forEach((checkpoint) => {
      this.physics.add.overlap(this.player, checkpoint, () => {
        this.player.setCheckpoint(checkpoint.x, checkpoint.y);
        checkpoint.activate();
      });
    });

    this.bombs = this.physics.add.group();
    const bomb1 = new Bomb(this, 520, height * 0.55);
    const bomb2 = new Bomb(this, 980, height * 0.4);
    const bomb3 = new Bomb(this, 1500, height * 0.65);
    this.bombs.addMultiple([bomb1, bomb2, bomb3]);

    this.physics.add.overlap(this.player, this.bombs, () => {
      this._loseLifeAndRespawn();
    });

    const kid = this.physics.add.staticSprite(this.worldWidth - 120, height * 0.5, "kid2");
    kid.setScale(0.9);

    this.physics.add.overlap(this.player, kid, () => {
      this.scene.stop("HUDScene");
      this.scene.start("LavaScene");
    });

    const hud = this._ensureHud();
    hud.setPlayer(this.player);
    hud.setWorldName("Water World");

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.player.on("gameover", () => {
      this.scene.stop("HUDScene");
      this.scene.start("GameOverScene");
    });
  }

  _addStaticPlatform(x, y) {
    const platform = this.platforms.create(x, y, "water_platform");
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
      this.time.delayedCall(700, () => {
        this.hitCooldown = false;
      });
    }
  }

  update() {
    if (!this.player) return;
    this.player.update();
  }
}
