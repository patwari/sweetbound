import Player from "../objects/Player.js";
export default class LandScene extends Phaser.Scene {
  constructor() {
    super({ key: "LandScene" });
    this.player = null;
    this.platforms = null;
    this.worldHeight = 720;
  }

  preload() {
    this.load.image("land_platform", "assets/tiles/land_platform.png");
    this.load.image("portal", "assets/tiles/portal.png");
  }

  create() {
    const { width, height } = this.scale;

    this.physics.world.setBounds(0, 0, width, this.worldHeight);
    this.cameras.main.setBounds(0, 0, width, this.worldHeight);

    this.platforms = this.physics.add.staticGroup();

    const tile = this.textures.get("land_platform").getSourceImage();
    const tileWidth = tile.width;
    const groundY = height - 40;

    for (let x = 0; x < width; x += tileWidth) {
      this.platforms.create(x + tileWidth * 0.5, groundY, "land_platform");
    }

    const platformSteps = [
      { x: width * 0.3, y: groundY - 90 },
      { x: width * 0.5, y: groundY - 150 },
      { x: width * 0.7, y: groundY - 210 },
      { x: width * 0.85, y: groundY - 260 },
    ];

    platformSteps.forEach((step) => {
      const platform = this.platforms.create(step.x, step.y, "land_platform");
      platform.setScale(1);
      platform.refreshBody();
    });

    this.player = new Player(this, 140, groundY - 80);
    this.player.setMode("land");

    this.physics.add.collider(this.player, this.platforms);

    const portal = this.physics.add.staticSprite(
      width * 0.85,
      groundY - 320,
      "portal"
    );
    portal.setScale(0.9);

    this.physics.add.overlap(this.player, portal, () => {
      this.scene.start("WaterScene");
    });

    const hud = this._ensureHud();
    hud.setPlayer(this.player);
    hud.setWorldName("Land");

    this._setupDebugLifeLoss();
  }

  _setupDebugLifeLoss() {
    const handler = () => {
      this._loseLifeAndRestart();
    };

    this.input.keyboard.off("keydown-L");
    this.input.keyboard.on("keydown-L", handler);
  }

  _loseLifeAndRestart() {
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
