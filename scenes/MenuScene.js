import Player from "../objects/Player.js";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.panel = null;
    this.titleText = null;
    this.subtitleText = null;
    this.button = null;
    this.buttonText = null;
  }

  preload() {
    this.load.image("ui-panel", "assets/ui/panel.png");
    this.load.image("ui-button", "assets/ui/button.png");
  }

  create() {
    const { width, height } = this.scale;

    this.panel = this.add.image(width * 0.5, height * 0.5, "ui-panel");
    this.panel.setOrigin(0.5);

    this.titleText = this.add.text(0, 0, "Sweetbound", {
      fontFamily: "Arial, sans-serif",
      fontSize: "56px",
      color: "#ffffff",
    });
    this.titleText.setOrigin(0.5);

    this.subtitleText = this.add.text(0, 0, "Tap or press Start", {
      fontFamily: "Arial, sans-serif",
      fontSize: "20px",
      color: "#ffffff",
    });
    this.subtitleText.setOrigin(0.5);

    this.button = this.add
      .image(0, 0, "ui-button")
      .setInteractive({ useHandCursor: true });
    this.button.setOrigin(0.5);

    this.buttonText = this.add.text(0, 0, "Start", {
      fontFamily: "Arial, sans-serif",
      fontSize: "22px",
      color: "#1a1a1a",
    });
    this.buttonText.setOrigin(0.5);

    const startGame = () => {
      Player.sharedLives = 5;
      this.scene.stop("HUDScene");
      // this.scene.start("LandScene");
      this.scene.start("LavaScene");
      this.scene.launch("HUDScene");
    };

    this.button.on("pointerdown", startGame);
    this.input.keyboard.once("keydown-SPACE", startGame);
    this.input.keyboard.once("keydown-ENTER", startGame);

    this._layout(this.scale);
    this.scale.on("resize", this._layout, this);
  }

  _layout(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    const scale = Math.min(width / 1280, height / 720);

    this.panel.setDisplaySize(560 * scale, 320 * scale);
    this.panel.setPosition(width * 0.5, height * 0.5);

    this.titleText.setFontSize(Math.round(56 * scale));
    this.titleText.setPosition(width * 0.5, height * 0.5 - 90 * scale);

    this.subtitleText.setFontSize(Math.round(20 * scale));
    this.subtitleText.setPosition(width * 0.5, height * 0.5 - 40 * scale);

    this.button.setDisplaySize(200 * scale, 70 * scale);
    this.button.setPosition(width * 0.5, height * 0.5 + 60 * scale);

    this.buttonText.setFontSize(Math.round(22 * scale));
    this.buttonText.setPosition(width * 0.5, height * 0.5 + 60 * scale);
  }
}
