import { Scene } from "phaser";
import * as Colyseus from "colyseus.js";
import { LoadAssets } from "../functions/loadAssets";
import { LoadMap } from "../functions/loadMap";
export class Game extends Scene {
  client: Colyseus.Client;
  room: Colyseus.Room<unknown>;

  button: Phaser.GameObjects.Arc;
  width: number;
  height: number;
  player: any;
  gun: any;
  move: boolean;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  pointer: Phaser.Input.Pointer;
  inputs: { up: boolean; left: boolean; right: boolean; down: boolean };
  shoot: boolean;
  bullets: any;

  constructor() {
    super("Game");
    this.width = 1024;
    console.log(this.width);
    this.height = 768;
  }
  init(data: any) {
    this.room = data.room;
    console.log(this.room);
  }

  preload() {
    this.load.setPath("assets");

    this.load.image("background", "bg.png");
    this.load.image("logo", "logo.png");
    LoadAssets(this);
  }

  create() {
    this.player = {};
    this.bullets = {};
    this.gun = {};
    this.client = new Colyseus.Client("ws://localhost:2567");
    this.move = false;
    this.shoot = false;
    // console.log(this.client)
    this.add.image(512, 384, "background");
    //this.add.image(100, 100, "grass")
    LoadMap(this);
    //this.cursor = this.input.keyboard?.createCursorKeys(
    this.room.onMessage("updatePlayers", (data) => {
      for (const id in data) {
        //console.log(data);
        const backendPlayer = data[id];
        if (!this.player[id]) {
          this.player[id] = this.add.rectangle(
            backendPlayer.body.pos.x + 8,
            backendPlayer.body.pos.y + 8,
            16,
            16,
            0xffff00
          );
          //this.player[id].setOrigin(0, 0);
          this.gun[id] = this.add.rectangle(
            this.player[id].x + Math.cos(backendPlayer.r) * 20,
            this.player[id].y + Math.sin(backendPlayer.r) * 20,
            20,
            5,
            0x000fff
          );
          //this.gun[id].setOrigin(0, 0);
        } else {
          this.player[id].x = backendPlayer.body.pos.x + 8;
          this.player[id].y = backendPlayer.body.pos.y + 8;
          this.gun[id].x = this.player[id].x + Math.cos(backendPlayer.r) * 20;
          this.gun[id].y = this.player[id].y + Math.sin(backendPlayer.r) * 20;
          this.gun[id].rotation = backendPlayer.r;
          if (this.input.activePointer.isDown) {
            if (this.input.activePointer.button === 0) {
              this.room.send("shoot", { x: this.gun[id].x, y: this.gun[id].y });
            }
          }
        }
      }
      const inputs = {
        left: false,
        right: false,
        up: false,
        down: false,
      };
      const left = this.input.keyboard?.addKey("a");
      const right = this.input.keyboard?.addKey("d");
      const up = this.input.keyboard?.addKey("w");
      const down = this.input.keyboard?.addKey("s");
      if (left?.isDown) inputs.left = true;
      if (right?.isDown) inputs.right = true;
      if (up?.isDown) inputs.up = true;
      if (down?.isDown) inputs.down = true;

      this.room.send("move", inputs);

      // const pointer = this.input.activePointer;
      // this.room.send("pointerMove", pointer.angle);
    });
    this.room.onMessage("updateBullet", (data) => {
      for (const id in data) {
        //console.log(data);
        const backendBullets = data[id];
        if (!this.bullets[id]) {
          this.bullets[id] = this.add.rectangle(
            backendBullets.body.pos.x + 2,
            backendBullets.body.pos.y + 2,
            4,
            4,
            0xffff00
          );
          //this.bullets[id].setOrigin(0, 0);
        } else {
          this.bullets[id].x = backendBullets.body.pos.x + 2;
          this.bullets[id].y = backendBullets.body.pos.y + 2;
        }
      }
    });
    this.room.onMessage("playerLeft", (data) => {
      for (const id in this.player) {
        this.player[data.id].destroy();
        console.log(this.player[id]);
      }
    });
    this.input.on("pointermove", (pointer: { worldX: any; worldY: any }) => {
      this.room.send("pointerMove", { x: pointer.worldX, y: pointer.worldY });
    });
  }
  update(time: number, delta: number): void {
    //console.log(this.shoot)
  }
}
