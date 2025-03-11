import { Schema, Context, type, MapSchema } from "@colyseus/schema";
import SAT from "sat";

export class MyRoomState extends Schema {
  @type("string") mySynchronizedProperty: string = "Hello world";
}

export class Player extends Schema {
  @type("number") rotation: number = 0;
  @type("number") velocityX: number = 0;
  @type("number") velocityY: number = 0;
  @type("number") speed: number = 10;
  @type("number") mag: number = 30;
  @type("boolean") move: boolean = false;
  @type("boolean") shoot: boolean = false;
}
export class Bullet extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") shootPosX: number = 0;
  @type("number") shootPosY: number = 0;
  @type("number") dirx: number = 0;
  @type("number") diry: number = 0;
  @type("string") owner: string = "";
  shoot: any;
}
export class Gamestate extends Schema {
  @type({ map: Player }) player = new MapSchema<Player>();
  @type({ map: Bullet }) bullet = new MapSchema<Bullet>();
}
