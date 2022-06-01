import Game from '../game/Game';
import { NumberData, NumberSprite } from './StatsPanel';

export default class Stat {

    x: number
    y: number
    width: number
    height: number
    sprite: HTMLImageElement
    game: Game
    numbers: { [key: string]: NumberSprite }

    constructor(x: number, y: number, width: number, height: number, sprite: HTMLImageElement, numbers: NumberData, game: Game) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sprite = sprite;
        this.numbers = numbers;
        this.game = game;
    }

    update(dt: number) { }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        ctx.drawImage(this.sprite, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    }
}