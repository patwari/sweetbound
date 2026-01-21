export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  preload() {
    console.log("[Sweetbound] MenuScene preload");
  }

  create() {
    console.log("[Sweetbound] MenuScene create");
    const { width, height } = this.scale;
    this.add
      .text(width * 0.5, height * 0.5, "Sweetbound", {
        fontFamily: "Arial, sans-serif",
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, height * 0.62, "Tap or press space to start", {
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const startGame = () => {
      this.scene.start("LandScene");
    };

    this.input.once("pointerdown", startGame);
    this.input.keyboard.once("keydown-SPACE", startGame);
  }
}
