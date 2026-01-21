export default class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: "HUDScene" });
    this.currentLives = 0;
    this.player = null;
    this.hearts = [];
    this.worldText = null;
    this.pendingWorldName = "";
  }

  preload() {
    this.load.image("heart", "assets/ui/heart.png");
  }

  create() {
    this.worldText = this.add.text(24, 16, "", {
      fontFamily: "Arial, sans-serif",
      fontSize: "24px",
      color: "#ffffff",
    });
    this.worldText.setScrollFactor(0);

    this._buildHearts();
    if (this.pendingWorldName) {
      this.worldText.setText(this.pendingWorldName);
    }
  }

  _buildHearts() {
    this.hearts.forEach((heart) => heart.destroy());
    this.hearts = [];

    for (let i = 0; i < 5; i += 1) {
      const heart = this.add.image(24 + i * 34, 60, "heart");
      heart.setScale(0.8);
      heart.setScrollFactor(0);
      this.hearts.push(heart);
    }

    this._updateHeartVisibility();
  }

  _updateHeartVisibility() {
    this.hearts.forEach((heart, index) => {
      heart.setAlpha(index < this.currentLives ? 1 : 0.25);
    });
  }

  setPlayer(player) {
    if (!player) return;
    this.player = player;
    this.currentLives = player.getLives();
    this._updateHeartVisibility();

    player.on("lives-changed", (lives) => {
      this.currentLives = lives;
      this._updateHeartVisibility();
    });
  }

  setWorldName(name) {
    this.pendingWorldName = name;
    if (!this.worldText) return;
    this.worldText.setText(name);
  }
}
