import Player from "../objects/Player.js";
export default class WaterScene extends Phaser.Scene {
  constructor() {
    super({ key: "WaterScene" });
    this.player = null;
    this.platforms = null;
    this.worldHeight = 720;
  }

  preload() {
    this.load.image("water_platform", "assets/tiles/water_platform.png");
  }

  create() {
    const { width, height } = this.scale;

    this.physics.world.setBounds(0, 0, width, this.worldHeight);
    this.cameras.main.setBounds(0, 0, width, this.worldHeight);

    this.platforms = this.physics.add.staticGroup();

    const tile = this.textures.get("water_platform").getSourceImage();
    const tileWidth = tile.width;
    const groundY = height - 40;

    for (let x = 0; x < width; x += tileWidth) {
      this.platforms.create(x + tileWidth * 0.5, groundY, "water_platform");
    }

    this.player = new Player(this, 140, groundY - 80);
    this.player.setMode("water");

    this.physics.add.collider(this.player, this.platforms);

    const hud = this._ensureHud();
    hud.setPlayer(this.player);
    hud.setWorldName("Water");

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
