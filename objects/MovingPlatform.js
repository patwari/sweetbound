export default class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "moving_platform", options = {}) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setImmovable(true);
    this.body.setAllowGravity(false);
    this.setDepth(1);

    const {
      type = "horizontal",
      distance = 200,
      duration = 2400,
      radius = 80,
    } = options;

    this.startX = x;
    this.startY = y;
    this.movementType = type;

    if (type === "vertical") {
      scene.tweens.add({
        targets: this,
        y: y - distance,
        duration,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    } else if (type === "circular") {
      const counter = scene.tweens.addCounter({
        from: 0,
        to: 360,
        duration,
        repeat: -1,
        ease: "Linear",
      });

      counter.on("update", () => {
        const angle = Phaser.Math.DegToRad(counter.getValue());
        this.x = this.startX + Math.cos(angle) * radius;
        this.y = this.startY + Math.sin(angle) * radius;
      });
    } else {
      scene.tweens.add({
        targets: this,
        x: x + distance,
        duration,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }
  }
}
