import { Room, Client } from "@colyseus/core";
import { matchMaker } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";

export class LobbyRoom extends Room<MyRoomState> {
  maxClients = 3;
  timer: number;

  onCreate(options: any) {
    this.setState(new MyRoomState());
    this.timer = 5;
    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    setInterval(() => {
      this.timer--;
      this.broadcast("timeRemain", { time: this.timer });
      if (this.timer == 0) {
        this.enterGameRoom(matchMaker, client);
      }
    }, 1000);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  async enterGameRoom(matchMaker: any, client: Client) {
    const gameroom = await matchMaker.createRoom("my_room");
    const roomID = gameroom.roomId;
    this.broadcast("startGame", { roomID });
    this.disconnect();
  }
}
