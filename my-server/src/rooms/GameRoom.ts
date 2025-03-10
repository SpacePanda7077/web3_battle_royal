import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player, Bullet, Gamestate } from "./schema/MyRoomState";
import uniqid from "uniqid";
import SAT from "sat";
import fs from "fs";
import { timeStamp } from "console";
import { setTimeout } from "timers/promises";
//import { Physics } from "phaser";

//console.log(mapData.layers)

export class GameRoom extends Room<Gamestate> {
  player: any;
  playerData: any;
  invalidMovement: boolean;
  tiles: SAT.Box[];
  velocity: number;
  bullet: any;
  tick: number;
  tickToSecond: number;

  onCreate(options: any) {
    this.player = {};
    this.bullet = {};
    this.playerData = {};
    this.setState(new Gamestate());
    this.tiles = this.setupMap();
    this.velocity = 0;
    this.tick = 0;
    this.tickToSecond = 0;
    const fireRate = 30;
    var lasttimeFired = 0;
    var reloadTime = 2000;

    this.onMessage("move", (client, inputs) => {
      let newX;
      let newY;
      const player = this.player[client.sessionId].body;
      this.invalidMovement = false;

      //console.log(newPlayer);
      if (inputs.left) {
        const tempPlayer = new SAT.Box(
          new SAT.Vector(player.pos.x - 2, player.pos.y),
          16,
          16
        ).toPolygon();

        //console.log(tempPlayer);
        tempPlayer.pos.x -= 2;
        //console.log("newX : " + tempPlayer.pos.x);
        for (var i = 0; i < this.tiles.length; i++) {
          var box = this.tiles[i];
          var collided = SAT.testPolygonPolygon(tempPlayer, box.toPolygon());
          if (collided) {
            //console.log(collided);
            this.invalidMovement = collided;
            break;
          }
        }
        if (!this.invalidMovement) {
          player.pos.x -= 2;
        }
      } else if (inputs.right) {
        const tempPlayer = new SAT.Box(
          new SAT.Vector(player.pos.x + 2, player.pos.y),
          16,
          16
        ).toPolygon();

        //console.log(tempPlayer);
        tempPlayer.pos.x -= 2;
        //console.log("newX : " + tempPlayer.pos.x);
        for (var i = 0; i < this.tiles.length; i++) {
          var box = this.tiles[i];
          var collided = SAT.testPolygonPolygon(tempPlayer, box.toPolygon());
          if (collided) {
            //console.log(collided);
            this.invalidMovement = collided;
            break;
          }
        }
        if (!this.invalidMovement) {
          player.pos.x += 2;
        }
      }
      if (inputs.up) {
        const tempPlayer = new SAT.Box(
          new SAT.Vector(player.pos.x, player.pos.y - 2),
          16,
          16
        ).toPolygon();

        //console.log(tempPlayer);
        tempPlayer.pos.x -= 2;
        //console.log("newX : " + tempPlayer.pos.x);
        for (var i = 0; i < this.tiles.length; i++) {
          var box = this.tiles[i];
          var collided = SAT.testPolygonPolygon(tempPlayer, box.toPolygon());
          if (collided) {
            //console.log(collided);
            this.invalidMovement = collided;
            break;
          }
        }
        if (!this.invalidMovement) {
          player.pos.y -= 2;
        }
      }
      if (inputs.down) {
        const tempPlayer = new SAT.Box(
          new SAT.Vector(player.pos.x, player.pos.y + 2),
          16,
          16
        ).toPolygon();

        //console.log(tempPlayer);
        tempPlayer.pos.x -= 2;
        //console.log("newX : " + tempPlayer.pos.x);
        for (var i = 0; i < this.tiles.length; i++) {
          var box = this.tiles[i];
          //console.log(box);
          var collided = SAT.testPolygonPolygon(tempPlayer, box.toPolygon());
          if (collided) {
            // console.log(collided);
            this.invalidMovement = collided;
            break;
          }
        }
        if (!this.invalidMovement) {
          player.pos.y += 2;
        }
      }
    });
    // Move message ...........//

    // pointer move message .......//
    this.onMessage("pointerMove", (client, pointer) => {
      var angle = Math.atan2(
        pointer.y - this.player[client.sessionId].body.pos.y,
        pointer.x - this.player[client.sessionId].body.pos.x
      );
      this.player[client.sessionId].r = angle;
      //this.broadcast("updatePlayer", this.player);
    });
    this.onMessage("shoot", (client, pos) => {
      var shoot = this.state.player.get(client.sessionId).shoot;
      var mag = this.state.player.get(client.sessionId).mag;
      if (mag > 0) {
        shoot = true;
      } else {
        if (this.tickToSecond - lasttimeFired > reloadTime) {
          mag = 30;
        }
      }

      if (shoot && this.tickToSecond - lasttimeFired > fireRate) {
        this.shootBullet(client.sessionId, pos.x, pos.y);
        lasttimeFired = this.tickToSecond;
        mag--;
        console.log(mag);
      }
    });
    this.setSimulationInterval(() => {
      this.tick++;
      this.tickToSecond = (this.tick / 60) * 1000;
      //console.log(this.tickToSecond);
      for (const id in this.player) {
        if (!id) return;
        this.broadcast("updatePlayers", this.player);
        // console.log();
      }

      for (const [id, bullet] of this.state.bullet) {
        if (this.bullet[id]) {
          let prevX = this.bullet[id].body.pos.x;
          let prevY = this.bullet[id].body.pos.y;
          this.bullet[id].body.pos.x += bullet.dirx * 12;
          this.bullet[id].body.pos.y += bullet.diry * 12;
          const d = this.distanceBtw(
            bullet.shootPosX,
            bullet.shootPosY,
            this.bullet[id].body.pos.x,
            this.bullet[id].body.pos.y
          );
          for (var i = 0; i < this.tiles.length; i++) {
            let ray = new SAT.Circle(
              new SAT.Vector(prevX, prevY),
              this.bullet[id].body.radius || 5
            );
            ray.pos.x = (prevX + this.bullet[id].body.pos.x) / 2; // Midpoint for raycast approximation
            ray.pos.y = (prevY + this.bullet[id].body.pos.y) / 2;
            var boxe = this.tiles[i];
            var bulletBox = this.bullet[id].body;
            var collide = SAT.testPolygonCircle(this.tiles[i].toPolygon(), ray);
            if (collide) {
              this.state.bullet.delete(id);
              delete this.bullet[id];
              this.broadcast("deleteBullet", { id: id });
              break;
            }
          }
          if (d > 300) {
            this.state.bullet.delete(id);
            delete this.bullet[id];
            this.broadcast("deleteBullet", { id: id });
          }
          this.broadcast("updateBullet", this.bullet);
        } else {
          return false;
        }
      }
    }, 1000 / 30);
  }

  onJoin(client: Client, options: any) {
    console.log("player with client ID " + client.sessionId + " joined");
    const posX: number = Math.random() * 100;
    const posY: number = Math.random() * 100;
    const vector = new SAT.Vector(500, 60);
    const playerData = this.state.player.set(client.sessionId, new Player());
    this.player[client.sessionId] = {
      body: new SAT.Box(vector, 16, 16).toPolygon(),
      r: 0,
    };
    console.log(this.player);
  }

  onLeave(client: Client, consented: boolean) {
    this.broadcast("playerLeft", { id: client.sessionId });
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  distanceBtw(x1: number, y1: number, x2: number, y2: number) {
    const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    return d;
  }
  setupMap() {
    const collisionGrid: never[][] = [];
    const rawdata = fs.readFileSync("src/rooms/testjson.json", "utf8");
    const mapData = JSON.parse(rawdata);
    mapData.layers.forEach((layer: { data: []; name: string }) => {
      if (layer.name === "colision") {
        for (let i = 0; i < layer.data.length; i += 10) {
          collisionGrid.push(layer.data.slice(i, i + 10));
        }
        //console.log(collisionGrid)
      }
    });
    const collisionPosition: { x: number; y: number }[] = [];
    const tiles: SAT.Box[] = [];
    collisionGrid.forEach((row, rowIndex) => {
      //console.log(rowIndex)
      row.forEach((cell, cellIndex) => {
        if (cell === 45) {
          const pos = {
            x: cellIndex * 32,
            y: rowIndex * 32,
          };
          collisionPosition.push(pos);
        }
      });
    });
    //console.log(collisionPosition)
    collisionPosition.forEach((pos, posIndex) => {
      var v = new SAT.Vector(pos.x, pos.y);
      var box = new SAT.Box(v, 32, 32);
      tiles.push(box);
      //console.log(box);
    });
    return tiles;
  }

  shootBullet(id: string, x: number, y: number) {
    const bulletID = uniqid();
    const playerPos = this.player[id].body.pos;
    this.bullet[bulletID] = {
      body: new SAT.Circle(new SAT.Vector(playerPos.x, playerPos.y), 2),
    };
    const bullet = new Bullet();
    bullet.x = this.bullet[bulletID].body.pos.x;
    bullet.y = this.bullet[bulletID].body.pos.y;
    bullet.shootPosX = this.bullet[bulletID].body.pos.x;
    bullet.shootPosY = this.bullet[bulletID].body.pos.y;
    bullet.dirx = Math.cos(this.player[id].r);
    bullet.diry = Math.sin(this.player[id].r);
    bullet.owner = id;

    this.state.bullet.set(bulletID, bullet);
  }
}
