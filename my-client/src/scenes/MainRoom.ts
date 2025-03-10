import { Scene } from 'phaser';
import * as Colyseus from "colyseus.js";
export class MainRoom extends Scene
{
    client: Colyseus.Client;
    room: Colyseus.Room<unknown>;

    button:Phaser.GameObjects.Arc
    width: number;
    height: number;
    constructor ()
    {
        super('MainRoom');
        this.width = 1024
        console.log(this.width)
        this.height = 768
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
    }

    create ()
    {
        this.client = new Colyseus.Client('ws://localhost:2567');
        console.log(this.client)
        this.add.image(512, 384, 'background');
        this.add.image(512, 350, 'logo').setDepth(100);
        this.add.text(512, 490, 'This is the main room', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
       this.button = this.add.circle(Number(this.width)/2,Number(this.height)-100, 100, 0xff0000)
       this.button.setInteractive().on("pointerdown",()=>{
        console.log("pointerDown")
        this.joinGame(this.client)
       })
    }
    async joinGame(client:Colyseus.Client){
        this.room= await client.joinOrCreate("lobby_room")
        console.log(this.room)
        this.scene.start("Lobby",{room: this.room})
    }
}
