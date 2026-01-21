export default class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: "HUDScene" });
    this.currentLives = 5;
    this.player = null;
    this.heartIcons = [];
    this.worldText = null;
    this.pendingWorldName = "";
    this.baseWidth = 1280;
    this.baseHeight = 720;
    this.livesListener = null;
  }

  preload() {
    console.log(`HUD preload called`);
    this.load.image("hud-heart", "assets/ui/heart.png");
  }

  create() {
    console.log(`HUD create called`);
    this.worldText = this.add.text(0, 0, "", {
      fontFamily: "Arial, sans-serif",
      fontSize: "24px",
      color: "#ffffff",
    });
    this.worldText.setScrollFactor(0);

    this._buildHearts();

    if (this.pendingWorldName) {
      this.worldText.setText(this.pendingWorldName);
    }

    this._layout(this.scale);
    this.scale.on("resize", this._layout, this);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this._onShutdown, this);
  }

  _buildHearts() {
    this.heartIcons.forEach((icon) => icon.destroy());
    this.heartIcons = [];

    for (let i = 0; i < 5; i += 1) {
      const icon = this.add.image(0, 0, "hud-heart");
      icon.setOrigin(0, 0.5);
      icon.setScrollFactor(0);
      this.heartIcons.push(icon);
    }

    this._updateHeartVisibility();
  }

  _layout(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    const scale = Math.min(width / this.baseWidth, height / this.baseHeight);
    const marginX = 18 * scale;
    const marginY = 12 * scale;
    const heartScale = 0.35 * scale;
    const heartSpacing = 30 * scale;

    this.worldText.setFontSize(Math.round(24 * scale));
    this.worldText.setPosition(marginX, marginY);

    const heartsY = marginY + 42 * scale;
    this.heartIcons.forEach((icon, index) => {
      icon.setScale(heartScale);
      icon.setPosition(marginX + index * heartSpacing, heartsY);
    });
  }

  _updateHeartVisibility() {
    this.heartIcons.forEach((icon, index) => {
      icon.setAlpha(index < this.currentLives ? 1 : 0.25);
    });
  }

  setPlayer(player) {
    if (this.player && this.livesListener) {
      this.player.off("lives-changed", this.livesListener);
    }

    this.player = player || null;
    this.currentLives = this.player ? this.player.getLives() : 5;
    this._updateHeartVisibility();

    if (!this.player) return;

    this.livesListener = (lives) => {
      this.currentLives = lives;
      this._updateHeartVisibility();
    };

    this.player.on("lives-changed", this.livesListener);
  }

  setWorldName(name) {
    this.pendingWorldName = name;
    if (!this.worldText) return;
    this.worldText.setText(name);
  }

  _onShutdown() {
    if (this.player && this.livesListener) {
      this.player.off("lives-changed", this.livesListener);
    }
    this.player = null;
    this.livesListener = null;
  }
}
