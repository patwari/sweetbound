import { gameConfig } from "./gameConfig.js";
import BootScene from "./scenes/BootScene.js";
import MenuScene from "./scenes/MenuScene.js";
import HUDScene from "./scenes/HUDScene.js";
import LandScene from "./scenes/LandScene.js";
import WaterScene from "./scenes/WaterScene.js";
import LavaScene from "./scenes/LavaScene.js";
import GameOverScene from "./scenes/GameOverScene.js";

console.log("[Sweetbound] main.js loaded");

gameConfig.scene = [
  BootScene,
  MenuScene,
  HUDScene,
  LandScene,
  WaterScene,
  LavaScene,
  GameOverScene,
];

try {
  const game = new Phaser.Game(gameConfig);
  console.log("[Sweetbound] Phaser.Game initialized", game);
} catch (error) {
  console.error("[Sweetbound] Phaser.Game failed", error);
}
