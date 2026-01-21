import Player from "../objects/Player.js";
import MovingPlatform from "../objects/MovingPlatform.js";

export default class LavaScene extends Phaser.Scene {
  constructor() {
    super({ key: "LavaScene" });
    this.player = null;
    this.worldWidth = 1800;
    this.worldHeight = 1200;
    this.hitCooldown = false;
    this.lavaZone = null;
  }

  preload() {
    console.log(`LAVA preload called`);
    this.load.image("moving_platform", "assets/tiles/moving_platform.png");
    this.load.image("lava_tile", "assets/tiles/lava_tile.png");
    this.load.image("portal", "assets/tiles/portal.png");
  }

  create() {
    console.log(`LAVA create called`);
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    const groundY = this.worldHeight - 60;

    // Start platform (safe, static).
    const startPlatform = this.physics.add.staticSprite(
      160,
      groundY - 80,
      "moving_platform",
    );
    startPlatform.setScale(1.2, 1);
    startPlatform.refreshBody();

    const horizontalA = new MovingPlatform(
      this,
      520,
      groundY - 140,
      "moving_platform",
      {
        type: "horizontal",
        distance: 220,
        duration: 2600,
      },
    );

    const verticalA = new MovingPlatform(
      this,
      860,
      groundY - 240,
      "moving_platform",
      {
        type: "vertical",
        distance: 180,
        duration: 2300,
      },
    );

    const horizontalB = new MovingPlatform(
      this,
      1180,
      groundY - 360,
      "moving_platform",
      {
        type: "horizontal",
        distance: 220,
        duration: 2600,
      },
    );

    const verticalB = new MovingPlatform(
      this,
      1460,
      groundY - 520,
      "moving_platform",
      {
        type: "vertical",
        distance: 200,
        duration: 2400,
      },
    );

    const circular = new MovingPlatform(
      this,
      1320,
      groundY - 700,
      "moving_platform",
      {
        type: "circular",
        radius: 90,
        duration: 2800,
      },
    );

    const finalPlatform = this.physics.add.staticSprite(
      this.worldWidth - 140,
      groundY - 840,
      "moving_platform",
    );
    finalPlatform.setScale(1.2, 1);
    finalPlatform.refreshBody();

    this.player = new Player(this, 160, groundY - 140);
    this.player.setMode("lava");

    this.physics.add.collider(this.player, startPlatform);
    this.physics.add.collider(this.player, horizontalA);
    this.physics.add.collider(this.player, verticalA);
    this.physics.add.collider(this.player, horizontalB);
    this.physics.add.collider(this.player, verticalB);
    this.physics.add.collider(this.player, circular);
    this.physics.add.collider(this.player, finalPlatform);

    this._createLavaFloor();

    const goal = this.physics.add.staticSprite(
      this.worldWidth - 140,
      groundY - 910,
      "portal",
    );
    goal.setScale(1.6);

    this.physics.add.overlap(this.player, goal, () => {
      this.scene.stop("HUDScene");
      this.scene.start("GameOverScene", { win: true });
    });

    const hud = this._ensureHud();
    hud.setPlayer(this.player);
    hud.setWorldName("Lava");

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  _createLavaFloor() {
    const lavaHeight = 140;
    const lavaY = this.worldHeight - lavaHeight * 0.5;
    const lava = this.add.tileSprite(
      0,
      lavaY,
      this.worldWidth,
      lavaHeight,
      "lava_tile",
    );
    lava.setOrigin(0, 0.5);
    lava.setTint(0xff5c5c);
    lava.setAlpha(0.9);

    this.lavaZone = this.add.zone(
      this.worldWidth * 0.5,
      lavaY,
      this.worldWidth,
      lavaHeight,
    );
    this.physics.add.existing(this.lavaZone, true);

    this.physics.add.overlap(this.player, this.lavaZone, () => {
      this._loseLifeAndRestart();
    });
  }

  _loseLifeAndRestart() {
    if (this.hitCooldown) return;
    this.hitCooldown = true;

    this.player.loseLife();

    if (this.player.getLives() > 0) {
      this.scene.restart();
    } else {
      this.scene.stop("HUDScene");
      this.scene.start("GameOverScene");
    }
  }

  _ensureHud() {
    if (!this.scene.isActive("HUDScene")) {
      this.scene.launch("HUDScene");
    }
    this.scene.bringToTop("HUDScene");
    return this.scene.get("HUDScene");
  }

  update() {
    if (!this.player) return;
    this.player.update();

    if (this.player.y > this.worldHeight + 100) {
      this._loseLifeAndRestart();
    }
  }
}
