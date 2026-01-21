import Player from "../objects/Player.js";
import MovingPlatform from "../objects/MovingPlatform.js";

export default class LavaScene extends Phaser.Scene {
  constructor() {
    super({ key: "LavaScene" });
    this.player = null;
    this.worldWidth = 1800;
    this.worldHeight = 1200;
    this.lavaZone = null;
    this.winTriggered = false;
  }

  preload() {
    this.load.image("moving_platform", "assets/tiles/moving_platform.png");
    this.load.image("lava_tile", "assets/tiles/lava_tile.png");
    this.load.image("portal", "assets/tiles/portal.png");
  }

  create() {
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    const groundY = this.worldHeight - 60;

    // Start platform (safe, static).
    const startPlatform = this.physics.add.staticSprite(
      220,
      groundY - 90,
      "moving_platform",
    );
    startPlatform.setScale(1.2, 1);
    startPlatform.refreshBody();

    const horizontalA = new MovingPlatform(
      this,
      340,
      groundY - 130,
      "moving_platform",
      {
        type: "horizontal",
        distance: 140,
        duration: 2200,
      },
    );

    const verticalA = new MovingPlatform(
      this,
      560,
      groundY - 210,
      "moving_platform",
      {
        type: "vertical",
        distance: 120,
        duration: 2100,
      },
    );

    const horizontalB = new MovingPlatform(
      this,
      820,
      groundY - 290,
      "moving_platform",
      {
        type: "horizontal",
        distance: 160,
        duration: 2300,
      },
    );

    const verticalB = new MovingPlatform(
      this,
      1080,
      groundY - 370,
      "moving_platform",
      {
        type: "vertical",
        distance: 140,
        duration: 2200,
      },
    );

    const circular = new MovingPlatform(
      this,
      1320,
      groundY - 450,
      "moving_platform",
      {
        type: "circular",
        radius: 60,
        duration: 2400,
      },
    );

    const finalPlatform = this.physics.add.staticSprite(
      this.worldWidth - 180,
      groundY - 520,
      "moving_platform",
    );
    finalPlatform.setScale(1.2, 1);
    finalPlatform.refreshBody();

    this.player = new Player(this, 220, groundY - 150);
    this.player.setMode("lava");

    this.physics.add.collider(this.player, startPlatform);
    this.physics.add.collider(this.player, horizontalA);
    this.physics.add.collider(this.player, verticalA);
    this.physics.add.collider(this.player, horizontalB);
    this.physics.add.collider(this.player, verticalB);
    this.physics.add.collider(this.player, circular);
    this.physics.add.collider(this.player, finalPlatform);

    const lowestSafeY = startPlatform.y + startPlatform.displayHeight * 0.5;
    this._createLavaFloor(lowestSafeY + 8);

    const goal = this.physics.add.staticSprite(
      this.worldWidth - 180,
      groundY - 590,
      "portal",
    );
    goal.setScale(1.6);

    this.physics.add.overlap(this.player, goal, () => {
      if (this.winTriggered) return;
      this.winTriggered = true;
      this.scene.stop("HUDScene");
      this.scene.start("GameOverScene", { win: true });
    });

    const hud = this._ensureHud();
    hud.setPlayer(this.player);
    hud.setWorldName("Lava");

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  _createLavaFloor(lavaTop) {
    const lavaHeight = this.worldHeight - lavaTop;
    const lavaY = lavaTop + lavaHeight * 0.5;

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
    this.lavaZone.body.setSize(this.worldWidth, lavaHeight, true);

    this.physics.add.overlap(this.player, this.lavaZone, () => {
      this._loseLifeAndRestart();
    });
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

    if (this.player.y > this.worldHeight + 100) {
      this._loseLifeAndRestart();
    }
  }
}
