import Game from '../game/Game';
import { DirectionH, DirectionV } from '../player/PlayerMovementController';
import IRenderable from '../sprites/IRenderable';
import ramps from '../../json/ramps.json';

export interface Ramp {
    x: number,
    y: number,
    width: number,
    height: number,
    type: string
}

export default class Map implements IRenderable {
    x: number = 571
    y: number = 0
    destX: number = 0
    destY: number = 0
    sprite: HTMLImageElement
    vx: number = 5

    source: string

    destWidth: number = 1200
    destHeight: number = 768

    playfield: HTMLCanvasElement = document.querySelector('canvas')

    ramps: Ramp[] = ramps

    game: Game

    constructor(game: Game, sprite: HTMLImageElement) {
        this.game = game;
        this.sprite = sprite;
    }

    update(dt: number) {
        if (this.game.player.isMoving) {
            if (this.game.player.directionH === DirectionH.LEFT) {
                this.x -= this.vx * dt;
                this.game.player.x -= this.vx * dt;

                this.game.player.increaseSpeed(dt);
            } else if (this.game.player.directionH === DirectionH.RIGHT) {
                this.x += this.vx * dt;
                this.game.player.x += this.vx * dt;

                this.game.player.increaseSpeed(dt);
            }
        }
    }

    render() {
        const ctx = this.playfield.getContext('2d');
        const x = this.x * Game.CELL_SIZE;
        ctx.drawImage(this.sprite, x, this.y, this.destWidth, this.destHeight, this.destX, this.destY, this.destWidth, this.destHeight);
    }
}