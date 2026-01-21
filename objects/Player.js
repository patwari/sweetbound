export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    const textureKey = "player-candy";
    if (!scene.textures.exists(textureKey)) {
      const g = scene.add.graphics();
      g.fillStyle(0xff6fa8, 1);
      g.fillCircle(16, 16, 16);
      g.lineStyle(2, 0xffffff, 1);
      g.strokeCircle(16, 16, 16);
      g.generateTexture(textureKey, 32, 32);
      g.destroy();
    }
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(true);

    this.spawnPoint = new Phaser.Math.Vector2(x, y);
    this.checkpoint = null;

    if (Player.sharedLives === undefined) {
      Player.sharedLives = 5;
    }

    this.mode = "land";

    this.moveSpeed = 220;
    this.swimSpeed = 200;
    this.accel = 1200;
    this.drag = 900;
    this.jumpVelocity = 420;
    this.gravityY = 900;

    this.body.setMaxVelocity(260, 520);

    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.touchState = {
      left: false,
      right: false,
      jump: false,
      jumpPressed: false,
    };

    this._createTouchControls(scene);
    this.setMode("land");
  }

  _createTouchControls(scene) {
    const { width, height } = scene.scale;
    const leftZone = scene.add.zone(0, height * 0.5, width * 0.4, height);
    leftZone.setOrigin(0, 0.5).setInteractive();

    const rightZone = scene.add.zone(width * 0.4, height * 0.5, width * 0.3, height);
    rightZone.setOrigin(0, 0.5).setInteractive();

    const jumpZone = scene.add.zone(width * 0.7, height * 0.5, width * 0.3, height);
    jumpZone.setOrigin(0, 0.5).setInteractive();

    leftZone.on("pointerdown", () => {
      this.touchState.left = true;
    });
    leftZone.on("pointerup", () => {
      this.touchState.left = false;
    });
    leftZone.on("pointerout", () => {
      this.touchState.left = false;
    });

    rightZone.on("pointerdown", () => {
      this.touchState.right = true;
    });
    rightZone.on("pointerup", () => {
      this.touchState.right = false;
    });
    rightZone.on("pointerout", () => {
      this.touchState.right = false;
    });

    jumpZone.on("pointerdown", () => {
      this.touchState.jump = true;
      this.touchState.jumpPressed = true;
    });
    jumpZone.on("pointerup", () => {
      this.touchState.jump = false;
    });
    jumpZone.on("pointerout", () => {
      this.touchState.jump = false;
    });

    scene.scale.on("resize", (gameSize) => {
      const w = gameSize.width;
      const h = gameSize.height;
      leftZone.setSize(w * 0.4, h);
      rightZone.setSize(w * 0.3, h);
      rightZone.setPosition(w * 0.4, h * 0.5);
      jumpZone.setSize(w * 0.3, h);
      jumpZone.setPosition(w * 0.7, h * 0.5);
    });
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === "water") {
      this.body.setAllowGravity(false);
      this.body.setGravityY(0);
      this.body.setDrag(this.drag, this.drag);
      this.body.setMaxVelocity(this.swimSpeed, this.swimSpeed);
    } else {
      this.body.setAllowGravity(true);
      this.body.setGravityY(this.gravityY);
      this.body.setDrag(this.drag, 0);
      this.body.setMaxVelocity(this.moveSpeed, 420);
    }
  }

  update() {
    const leftInput = this.keys.left.isDown || this.keys.a.isDown || this.touchState.left;
    const rightInput = this.keys.right.isDown || this.keys.d.isDown || this.touchState.right;
    const upInput = this.keys.up.isDown || this.keys.w.isDown;
    const downInput = this.keys.down.isDown || this.keys.s.isDown;

    if (this.mode === "water") {
      let ax = 0;
      let ay = 0;
      if (leftInput) ax = -this.accel;
      if (rightInput) ax = this.accel;
      if (upInput) ay = -this.accel;
      if (downInput) ay = this.accel;

      this.body.setAcceleration(ax, ay);
    } else {
      if (leftInput) {
        this.body.setAccelerationX(-this.accel);
      } else if (rightInput) {
        this.body.setAccelerationX(this.accel);
      } else {
        this.body.setAccelerationX(0);
      }

      const jumpPressed =
        Phaser.Input.Keyboard.JustDown(this.keys.space) ||
        Phaser.Input.Keyboard.JustDown(this.keys.up) ||
        Phaser.Input.Keyboard.JustDown(this.keys.w) ||
        this.touchState.jumpPressed;

      if (jumpPressed && this.body.blocked.down) {
        this.body.setVelocityY(-this.jumpVelocity);
      }
    }

    this.touchState.jumpPressed = false;
  }

  loseLife() {
    Player.sharedLives = Math.max(0, Player.sharedLives - 1);
    this.emit("lives-changed", Player.sharedLives);
    if (Player.sharedLives === 0) {
      this.emit("gameover");
    }
  }

  respawn() {
    const point = this.checkpoint || this.spawnPoint;
    this.setPosition(point.x, point.y);
    this.body.setVelocity(0, 0);
  }

  setCheckpoint(x, y) {
    this.checkpoint = new Phaser.Math.Vector2(x, y);
  }

  getLives() {
    return Player.sharedLives;
  }
}
