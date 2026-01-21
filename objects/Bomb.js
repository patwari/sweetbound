export default class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "bomb") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.9);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }
}
