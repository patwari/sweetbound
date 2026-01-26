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

    this.jumpBufferMs = 150;
    this.coyoteMs = 100;
    this.jumpQueuedTime = 0;
    this.lastGroundedTime = 0;

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

    this.touchPointers = {
      left: null,
      right: null,
      jump: null,
    };

    this._createTouchControls(scene);
    this.setMode("land");
  }

  _createTouchControls(scene) {
    const leftZone = scene.add.zone(0, 0, 1, 1).setOrigin(0, 0).setInteractive();
    const rightZone = scene.add.zone(0, 0, 1, 1).setOrigin(0, 0).setInteractive();
    const jumpZone = scene.add.zone(0, 0, 1, 1).setOrigin(0, 0).setInteractive();

    leftZone.setScrollFactor(0);
    rightZone.setScrollFactor(0);
    jumpZone.setScrollFactor(0);

    const showTouchUI = scene.sys.game.device.input.touch;
    let leftGuide = null;
    let rightGuide = null;
    let jumpGuide = null;

    if (showTouchUI) {
      leftGuide = scene.add.rectangle(0, 0, 1, 1, 0xffffff, 0.08).setOrigin(0, 0);
      rightGuide = scene.add.rectangle(0, 0, 1, 1, 0xffffff, 0.08).setOrigin(0, 0);
      jumpGuide = scene.add.rectangle(0, 0, 1, 1, 0xffffff, 0.1).setOrigin(0, 0);

      leftGuide.setScrollFactor(0);
      rightGuide.setScrollFactor(0);
      jumpGuide.setScrollFactor(0);
    }

    const assignPointer = (zoneName, pointer) => {
      if (this.touchPointers[zoneName] !== null) return;
      this.touchPointers[zoneName] = pointer.id;

      if (zoneName === "left") {
        this.touchState.left = true;
      } else if (zoneName === "right") {
        this.touchState.right = true;
      } else if (zoneName === "jump") {
        this.touchState.jump = true;
        this.touchState.jumpPressed = true;
      }
    };

    const releasePointer = (zoneName, pointer) => {
      if (this.touchPointers[zoneName] !== pointer.id) return;
      this.touchPointers[zoneName] = null;

      if (zoneName === "left") {
        this.touchState.left = false;
      } else if (zoneName === "right") {
        this.touchState.right = false;
      } else if (zoneName === "jump") {
        this.touchState.jump = false;
      }
    };

    leftZone.on("pointerdown", (pointer) => assignPointer("left", pointer));
    leftZone.on("pointerup", (pointer) => releasePointer("left", pointer));
    leftZone.on("pointerout", (pointer) => releasePointer("left", pointer));

    rightZone.on("pointerdown", (pointer) => assignPointer("right", pointer));
    rightZone.on("pointerup", (pointer) => releasePointer("right", pointer));
    rightZone.on("pointerout", (pointer) => releasePointer("right", pointer));

    jumpZone.on("pointerdown", (pointer) => assignPointer("jump", pointer));
    jumpZone.on("pointerup", (pointer) => releasePointer("jump", pointer));
    jumpZone.on("pointerout", (pointer) => releasePointer("jump", pointer));

    const layoutZones = (gameSize) => {
      const w = gameSize.width;
      const h = gameSize.height;

      leftZone.setPosition(0, 0);
      leftZone.setSize(w * 0.4, h);

      rightZone.setPosition(w * 0.6, 0);
      rightZone.setSize(w * 0.4, h);

      jumpZone.setPosition(w * 0.4, h * 0.6);
      jumpZone.setSize(w * 0.2, h * 0.4);

      if (showTouchUI) {
        leftGuide.setPosition(0, 0);
        leftGuide.setSize(w * 0.4, h);

        rightGuide.setPosition(w * 0.6, 0);
        rightGuide.setSize(w * 0.4, h);

        jumpGuide.setPosition(w * 0.4, h * 0.6);
        jumpGuide.setSize(w * 0.2, h * 0.4);
      }
    };

    layoutZones(scene.scale);
    scene.scale.on("resize", layoutZones, this);
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
      this.body.setMaxVelocity(this.moveSpeed, 520);
    }
  }

  _isKeyboardActive() {
    return (
      this.keys.left.isDown ||
      this.keys.right.isDown ||
      this.keys.up.isDown ||
      this.keys.down.isDown ||
      this.keys.w.isDown ||
      this.keys.a.isDown ||
      this.keys.s.isDown ||
      this.keys.d.isDown ||
      this.keys.space.isDown
    );
  }

  update() {
    const now = this.scene.time.now;
    const grounded = this.body.blocked.down || this.body.touching.down;

    if (grounded) {
      this.lastGroundedTime = now;
    }

    const leftKey = this.keys.left.isDown || this.keys.a.isDown;
    const rightKey = this.keys.right.isDown || this.keys.d.isDown;
    const upKey = this.keys.up.isDown || this.keys.w.isDown;
    const downKey = this.keys.down.isDown || this.keys.s.isDown;

    const keyboardActive = this._isKeyboardActive();
    const useTouch = !keyboardActive;

    const leftInput = leftKey || (useTouch && this.touchState.left);
    const rightInput = rightKey || (useTouch && this.touchState.right);
    const upInput = upKey;
    const downInput = downKey;

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
        (useTouch && this.touchState.jumpPressed);

      if (jumpPressed) {
        this.jumpQueuedTime = now;
      }

      const withinBuffer = now - this.jumpQueuedTime <= this.jumpBufferMs;
      const withinCoyote = now - this.lastGroundedTime <= this.coyoteMs;

      if (withinBuffer && withinCoyote) {
        this.body.setVelocityY(-this.jumpVelocity);
        this.jumpQueuedTime = 0;
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
    // Respawn always returns to the world start.
    this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.body.setVelocity(0, 0);
  }

  setCheckpoint(x, y) {
    // Checkpoint system removed; keep method for compatibility.
  }

  getLives() {
    return Player.sharedLives;
  }
}
