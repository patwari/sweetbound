export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  preload() {
    // No assets yet.
  }

  create() {
    const { width, height } = this.scale;
    this.add
      .text(width * 0.5, height * 0.5, "Sweetbound", {
        fontFamily: "Arial, sans-serif",
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
