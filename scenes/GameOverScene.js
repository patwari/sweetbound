import Player from "../objects/Player.js";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  preload() {
    // No assets yet.
  }

  create(data) {
    const { width, height } = this.scale;

    const win = data && data.win;
    const title = win ? "You Reunited!" : "Game Over";
    const subtitle = win ? "Tap or press space to play again" : "Tap or press space to restart";

    this.add
      .text(width * 0.5, height * 0.4, title, {
        fontFamily: "Arial, sans-serif",
        fontSize: "56px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, height * 0.55, subtitle, {
        fontFamily: "Arial, sans-serif",
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this._resetState();

    this.input.once("pointerdown", () => {
      this.scene.start("LandScene");
    });

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("LandScene");
    });

    this.input.keyboard.once("keydown-ENTER", () => {
      this.scene.start("LandScene");
    });
  }

  _resetState() {
    Player.sharedLives = 5;
    if (this.scene.isActive("HUDScene")) {
      this.scene.stop("HUDScene");
    }
  }
}
