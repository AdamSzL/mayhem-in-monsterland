import Screen from './Screen';
import Game from '../game/Game';

export default class ContinueScreen extends Screen {
    readonly DIGIT_POS_X: number = 824
    readonly DIGIT_POS_Y: number = 506
    readonly SPRITE_COUNT: number = 10
    readonly SPRITE_CHANGE_INTERVAL: number = 50
    readonly DIGIT_WIDTH: number = 50
    readonly DIGIT_HEIGHT: number = 56

    continues: number = 3
    numbersSprite: HTMLImageElement

    animation: number
    spriteIndex: number = 0

    shouldContinue: boolean = true

    constructor(width: number, height: number, sprite: HTMLImageElement, game: Game, numbers: HTMLImageElement) {
        super(width, height, sprite, game);
        this.numbersSprite = numbers;
    }

    show() {
        this.render();
        this.animation = window.setInterval(() => {
            this.spriteIndex += 1;
            if (this.spriteIndex > this.SPRITE_COUNT) {
                this.spriteIndex = 0;
            }
            this.render();
        }, this.SPRITE_CHANGE_INTERVAL);
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'a' || e.key === 'ArrowLeft' || (e.location === 3 && e.key === '4')) {
                this.shouldContinue = false;
            } else if (e.key == 'd' || e.key === 'ArrowRight' || (e.location === 3 && e.key === '6')) {
                this.shouldContinue = true;
            } else if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                clearInterval(this.animation);
                this.game.shouldRenderContinueScreen = false;
                if (this.shouldContinue) {
                    this.game.continuesLeft--;
                    this.game.triesLeft = 3;
                    this.game.resume();
                    this.game.shouldRenderLevelScreen = true;
                } else {
                    this.game.restart();
                    this.game.shouldRenderGameScreen = true;
                }
            }
        }
    }

    render() {
        console.log('continues: ' + this.continues);
        const ctx = this.game.playfield.getContext('2d');
        ctx.drawImage(this.sprite, Game.PLAYFIELD_WIDTH * this.spriteIndex, (this.shouldContinue ? 0 : Game.PLAYFIELD_HEIGHT), Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT, 0, 0, Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT);
        ctx.drawImage(this.numbersSprite, (this.continues - 1) * this.DIGIT_WIDTH, 0, this.DIGIT_WIDTH, this.DIGIT_HEIGHT, this.DIGIT_POS_X, this.DIGIT_POS_Y, this.DIGIT_WIDTH, this.DIGIT_HEIGHT);
    }
}