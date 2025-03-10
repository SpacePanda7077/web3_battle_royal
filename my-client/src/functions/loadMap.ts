export function LoadMap(scene: Phaser.Scene) {
  const map = scene.make.tilemap({ key: "map" });
  const ground = map.addTilesetImage("TX Tileset Grass", "grass");
  //const path = map.addTilesetImage("path","grass")

  const groundLayer = map.createLayer("ground", ground);
  const collision = map.createLayer("colision", ground);
  //groundLayer?.setOrigin(0.5, 0.5);
  //collision?.setOrigin(0.5, 0.5);
}
