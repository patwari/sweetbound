import { gameConfig } from "./gameConfig.js";
import BootScene from "./scenes/BootScene.js";
import MenuScene from "./scenes/MenuScene.js";
import HUDScene from "./scenes/HUDScene.js";
import LandScene from "./scenes/LandScene.js";
import WaterScene from "./scenes/WaterScene.js";
import LavaScene from "./scenes/LavaScene.js";
import GameOverScene from "./scenes/GameOverScene.js";

gameConfig.scene = [
  BootScene,
  MenuScene,
  HUDScene,
  LandScene,
  WaterScene,
  LavaScene,
  GameOverScene,
];

new Phaser.Game(gameConfig);
