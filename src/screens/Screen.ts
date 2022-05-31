import Game from '../game/Game';

export default class Screen {
    sprite: HTMLImageElement

    width: number
    height: number

    game: Game

    constructor(width: number, height: number, sprite: HTMLImageElement, game: Game) {
        this.width = width;
        this.height = height;
        this.sprite = sprite;
        this.game = game;
    }

    show() {
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                this.game.resume();
            }
        }
        this.render();
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
    }
}