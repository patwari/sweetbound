export default class Checkpoint extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, id) {
    super(scene, x, y, "checkpoint");

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.id = id;
    this.worldKey = scene.sys.settings.key;
    this.activeState = false;

    this.setOrigin(0.5, 0.5);
    this.setDepth(2);
    this._applyActiveState(false);
    this.syncFromRegistry();
  }

  activate(player) {
    if (this.activeState) return;

    const respawnX = this.x;
    const respawnY = this.y - 50;

    this.scene.registry.set(this._registryKey(), {
      id: this.id,
      respawnX,
      respawnY,
    });

    if (player) {
      player.setCheckpoint(respawnX, respawnY);
    }

    this._applyActiveState(true);
  }

  syncFromRegistry() {
    const data = this.scene.registry.get(this._registryKey());
    const isActive = data && data.id === this.id;
    this._applyActiveState(isActive);
  }

  _applyActiveState(isActive) {
    this.activeState = isActive;
    if (isActive) {
      this.setTint(0xffe066);
      this.setScale(1.05);
      this.setAlpha(1);
    } else {
      this.clearTint();
      this.setScale(0.9);
      this.setAlpha(0.7);
    }
  }

  _registryKey() {
    return `checkpoint:${this.worldKey}`;
  }
}
