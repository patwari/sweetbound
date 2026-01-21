export default class Checkpoint extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "checkpoint") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.activated = false;
    this.setScale(0.9);
    this.setDepth(2);
    // Static bodies are immovable and ignore gravity.
  }

  activate() {
    if (this.activated) return;
    this.activated = true;
    this.setTint(0xffe066);
    this.setScale(1.05);
  }
}
