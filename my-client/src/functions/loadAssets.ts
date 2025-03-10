export function LoadAssets(scene:Phaser.Scene){
   
    scene.load.image("grass", "Texture/TX Tileset Grass.png")
    scene.load.image("props", "Texture/TX Props.png")
    scene.load.image("walls", "Texture/TX Tileset Wall.png")
    scene.load.tilemapTiledJSON("map", "testjson.json")
}
