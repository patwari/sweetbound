export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    console.log("[Sweetbound] BootScene preload");
  }

  create() {
    console.log("[Sweetbound] BootScene create -> MenuScene");
    this.scene.start("MenuScene");
  }
}
