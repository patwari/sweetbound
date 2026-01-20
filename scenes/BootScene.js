export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // No assets yet.
  }

  create() {
    this.scene.start("MenuScene");
  }
}
