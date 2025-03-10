import { Scene } from 'phaser';
import * as Colyseus from "colyseus.js";
export class Lobby extends Scene
{
    client: Colyseus.Client;
    room: Colyseus.Room<unknown>;

    button:Phaser.GameObjects.Arc
    width: number;
    height: number;
    timer: number;
    timertext: Phaser.GameObjects.Text;
    constructor ()
    {
        super('Lobby');
        this.width = 1024
        console.log(this.width)
        this.height = 768
    }
    init(data: any){
        this.room = data.room
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
    }

    create ()
    {
        this.timer = 10
        this.client = new Colyseus.Client('ws://localhost:2567');
        console.log(this.client)
        this.add.image(512, 384, 'background');
        this.add.image(512, 350, 'logo').setDepth(100);
       this.timertext = this.add.text(512, 490, 'This is the lobby room', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.countDown(this.room)
    }
    startTimer(){
      
    }
    countDown(room:Colyseus.Room){
       room.onMessage("timeRemain",(data)=>{
        this.timertext.setText(data.time)
       })
      room.onMessage("startGame",async (data)=>{
        console.log("game strated")
        const room = await this.client.joinById(data.roomID)
        this.scene.start("Game",{room:room})
        console.log(room)
      })
           // this.scene.start("Game")
        
    }
}
