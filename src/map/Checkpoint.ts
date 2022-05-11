import Game from '../game/Game';

export default class Checkpoint {
    x: number
    y: number
    width: number
    height: number
    image: HTMLImageElement
    activeImage: HTMLImageElement

    isActive: boolean = false

    playfield: HTMLCanvasElement

    game: Game

    constructor(game: Game, x: number, y: number, width: number, height: number, image: HTMLImageElement, activeImage: HTMLImageElement) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.activeImage = activeImage;
        this.game = game;
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        const x = (this.x - this.game.map.x) * Game.CELL_SIZE;
        const topOffset = Game.CELL_SIZE * 3 - this.height;
        const y = this.y * Game.CELL_SIZE + topOffset;
        if (this.isActive) {
            ctx.drawImage(this.activeImage, 0, 0, this.width, this.height, x, y, this.width, this.height);
        } else {
            ctx.drawImage(this.image, 0, 0, this.width, this.height, x, y, this.width, this.height);
        }
    }
}