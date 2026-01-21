import Player from "../objects/Player.js";
import MovingPlatform from "../objects/MovingPlatform.js";
import Bomb from "../objects/Bomb.js";

export default class WaterScene extends Phaser.Scene {
  constructor() {
    super({ key: "WaterScene" });
    this.player = null;
    this.platforms = null;
    this.worldWidth = 1900;
    this.worldHeight = 1200;
    this.hitCooldown = false;
  }

  preload() {
    this.load.image("water_platform", "assets/tiles/water_platform.png");
    this.load.image("moving_platform", "assets/tiles/moving_platform.png");
    this.load.image("bomb", "assets/tiles/bomb.png");
    this.load.image("portal", "assets/tiles/portal.png");
  }

  create() {
    const { width } = this.scale;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.platforms = this.physics.add.staticGroup();

    const tile = this.textures.get("water_platform").getSourceImage();
    const tileWidth = tile.width;
    const groundY = this.worldHeight - 40;

    for (let x = 0; x < this.worldWidth; x += tileWidth) {
      this.platforms.create(x + tileWidth * 0.5, groundY, "water_platform");
    }

    const anchors = [
      { x: 300, y: groundY - 90 },
      { x: 480, y: groundY - 160 },
      { x: 660, y: groundY - 230 },
      { x: 1040, y: groundY - 320 },
      { x: 1340, y: groundY - 520 },
      { x: 1680, y: groundY - 720 },
      { x: this.worldWidth - 140, y: 240 },
    ];

    anchors.forEach((point) => {
      const platform = this.platforms.create(
        point.x,
        point.y,
        "water_platform",
      );
      platform.setScale(1);
      platform.refreshBody();
    });

    const horizontalA = new MovingPlatform(
      this,
      820,
      groundY - 260,
      "moving_platform",
      {
        type: "horizontal",
        distance: 200,
        duration: 2600,
      },
    );

    const verticalA = new MovingPlatform(
      this,
      1180,
      groundY - 380,
      "moving_platform",
      {
        type: "vertical",
        distance: 160,
        duration: 2400,
      },
    );

    const horizontalB = new MovingPlatform(
      this,
      1460,
      groundY - 560,
      "moving_platform",
      {
        type: "horizontal",
        distance: 200,
        duration: 2600,
      },
    );

    const verticalB = new MovingPlatform(
      this,
      1660,
      groundY - 650,
      "moving_platform",
      {
        type: "vertical",
        distance: 180,
        duration: 2400,
      },
    );

    const circular = new MovingPlatform(
      this,
      1500,
      groundY - 720,
      "moving_platform",
      {
        type: "circular",
        radius: 70,
        duration: 2800,
      },
    );

    this.player = new Player(this, 140, groundY - 80);
    this.player.setMode("water");

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, horizontalA);
    this.physics.add.collider(this.player, verticalA);
    this.physics.add.collider(this.player, horizontalB);
    this.physics.add.collider(this.player, verticalB);
    this.physics.add.collider(this.player, circular);

    const bombs = this.physics.add.group();
    bombs.add(new Bomb(this, 420, groundY - 140));
    bombs.add(new Bomb(this, 760, groundY - 200));
    bombs.add(new Bomb(this, 1120, groundY - 400));
    bombs.add(new Bomb(this, 1500, groundY - 620));
    bombs.add(new Bomb(this, 1600, groundY - 840));

    this.physics.add.overlap(this.player, bombs, () => {
      this._loseLifeAndRestart();
    });

    const goalPlatform = this.platforms.create(
      this.worldWidth - 140,
      240,
      "water_platform",
    );
    goalPlatform.setScale(1);
    goalPlatform.refreshBody();

    const portal = this.physics.add.staticSprite(
      this.worldWidth - 140,
      170,
      "portal",
    );
    portal.setScale(1.4);

    this.physics.add.overlap(this.player, portal, () => {
      this.scene.start("LavaScene");
    });

    const hud = this._ensureHud();
    hud.setPlayer(this.player);
    hud.setWorldName("Water");

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
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
  }
}
