import Player from "../objects/Player.js";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
    this.panel = null;
    this.titleText = null;
    this.subtitleText = null;
    this.button = null;
    this.buttonText = null;
    this.kids = [];
  }

  preload() {
    this.load.image("ui-panel", "assets/ui/panel.png");
    this.load.image("ui-button", "assets/ui/button.png");
    this.load.image("kid1", "assets/characters/kid1.png");
    this.load.image("kid2", "assets/characters/kid2.png");
    this.load.image("kid3", "assets/characters/kid3.png");
  }

  create(data) {
    const { width, height } = this.scale;
    const win = data && data.win;

    this.scene.stop("HUDScene");

    this.panel = this.add.image(width * 0.5, height * 0.5, "ui-panel");
    this.panel.setOrigin(0.5);

    this.titleText = this.add.text(0, 0, win ? "Reunited at last" : "Game Over", {
      fontFamily: "Arial, sans-serif",
      fontSize: "48px",
      color: "#ffffff",
    });
    this.titleText.setOrigin(0.5);

    this.subtitleText = this.add.text(0, 0, win ? "Candy family together" : "Try again", {
      fontFamily: "Arial, sans-serif",
      fontSize: "20px",
      color: "#ffffff",
    });
    this.subtitleText.setOrigin(0.5);

    if (win) {
      this.kids = [
        this.add.image(0, 0, "kid1"),
        this.add.image(0, 0, "kid2"),
        this.add.image(0, 0, "kid3"),
      ];
      this.kids.forEach((kid) => kid.setOrigin(0.5));
    }

    this.button = this.add.image(0, 0, "ui-button").setInteractive({ useHandCursor: true });
    this.button.setOrigin(0.5);

    this.buttonText = this.add.text(0, 0, "Restart", {
      fontFamily: "Arial, sans-serif",
      fontSize: "22px",
      color: "#1a1a1a",
    });
    this.buttonText.setOrigin(0.5);

    const restart = () => {
      Player.sharedLives = 5;
      this.scene.start("MenuScene");
    };

    this.button.on("pointerdown", restart);
    this.input.keyboard.once("keydown-SPACE", restart);
    this.input.keyboard.once("keydown-ENTER", restart);

    this._layout(this.scale, win);
    this.scale.on("resize", () => this._layout(this.scale, win));
  }

  _layout(gameSize, win) {
    const width = gameSize.width;
    const height = gameSize.height;
    const scale = Math.min(width / 1280, height / 720);

    this.panel.setDisplaySize(600 * scale, 360 * scale);
    this.panel.setPosition(width * 0.5, height * 0.5);

    this.titleText.setFontSize(Math.round(48 * scale));
    this.titleText.setPosition(width * 0.5, height * 0.5 - 110 * scale);

    this.subtitleText.setFontSize(Math.round(20 * scale));
    this.subtitleText.setPosition(width * 0.5, height * 0.5 - 70 * scale);

    if (win && this.kids.length) {
      const spacing = 70 * scale;
      const y = height * 0.5 - 10 * scale;
      this.kids[0].setPosition(width * 0.5 - spacing, y).setScale(0.9 * scale);
      this.kids[1].setPosition(width * 0.5, y).setScale(0.9 * scale);
      this.kids[2].setPosition(width * 0.5 + spacing, y).setScale(0.9 * scale);
    }

    this.button.setDisplaySize(220 * scale, 70 * scale);
    this.button.setPosition(width * 0.5, height * 0.5 + 90 * scale);

    this.buttonText.setFontSize(Math.round(22 * scale));
    this.buttonText.setPosition(width * 0.5, height * 0.5 + 90 * scale);
  }
}
