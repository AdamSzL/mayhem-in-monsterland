import Game from './Game';

export default class MagicDust {
    static sprite: HTMLImageElement

    static readonly DROP_DELAY: number = 200

    readonly SPRITE_COUNT: number = 9
    readonly POINTS: number = 200

    x: number
    y: number
    width: number = 96
    height: number = 96

    currentSpriteIndex: number = 0
    spriteChangeSpeed: number = 8

    game: Game

    constructor(x: number, y: number, game: Game) {
        this.x = x;
        this.y = y;
        this.game = game;
    }

    update(dt: number) {
        this.currentSpriteIndex += (dt * this.spriteChangeSpeed);

        if (this.currentSpriteIndex >= this.SPRITE_COUNT) {
            this.currentSpriteIndex = 0;
        }
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        const spriteInd = Math.floor(this.currentSpriteIndex);
        const x = (this.x - this.game.map.x) * Game.CELL_SIZE;
        const y = this.y * Game.CELL_SIZE;
        ctx.drawImage(MagicDust.sprite, spriteInd * this.width, 0, this.width, this.height, x, y, this.width, this.height);
    }
}