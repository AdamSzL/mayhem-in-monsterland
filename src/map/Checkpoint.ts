import Game from '../game/Game';

export default class Checkpoint {
    static audio: HTMLAudioElement = new Audio('audio/checkpoint.wav')
    static activeSprite: HTMLImageElement
    static inactiveSprite: HTMLImageElement

    readonly ACTIVE_SPRITE_COUNT: number = 15

    x: number
    y: number
    width: number
    height: number
    image: HTMLImageElement
    activeImage: HTMLImageElement

    isActive: boolean = false

    playfield: HTMLCanvasElement

    game: Game

    currentSpriteIndex: number = 0
    spriteChangeSpeed: number = 15

    constructor(game: Game, x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.game = game;
    }

    update(dt: number) {
        if (this.isActive) {
            this.currentSpriteIndex += (dt * this.spriteChangeSpeed);

            if (this.currentSpriteIndex >= this.ACTIVE_SPRITE_COUNT) {
                this.currentSpriteIndex = 0;
            }
        }
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        const spriteInd = Math.floor(this.currentSpriteIndex);
        const x = (this.x - this.game.map.x) * Game.CELL_SIZE;
        const topOffset = Game.CELL_SIZE * 3 - this.height;
        const y = this.y * Game.CELL_SIZE + topOffset;
        if (this.isActive) {
            ctx.drawImage(Checkpoint.activeSprite, spriteInd * this.width, 0, this.width, this.height, x, y, this.width, this.height);
        } else {
            ctx.drawImage(Checkpoint.inactiveSprite, 0, 0, this.width, this.height, x, y, this.width, this.height);
        }
    }
}