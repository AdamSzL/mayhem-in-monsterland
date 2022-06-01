import Screen from './Screen';
import Game from '../game/Game';
import numbers from '../../json/numberSprites.json';
import { NumberFormatter } from '../helpers/helpers';
import { NumberSprite } from '../stats/StatsPanel';

const numbersData: { [key: string]: NumberSprite } = numbers;

export default class GameScreen extends Screen {

    readonly AUDIO: HTMLAudioElement = new Audio('audio/game-screen.wav');

    readonly SCORE_BASE_X: number = 370
    readonly SCORE_BASE_Y: number = 665
    readonly SCORE_TOTAL_DIGITS: number = 9
    readonly SIZE_MULTIPLIER: number = 1.5
    readonly DIGIT_GAP: number = 10
    readonly SPRITE_COUNT: number = 5
    readonly ANIM_INTERVAL: number = 800
    readonly NUMBERS_SY: number = 24

    readonly dx: number = 0
    readonly dy: number = 0
    sx: number = 0
    readonly sy: number = 0

    spriteAnimation: number
    animSpriteIndex: number = 0

    score: number
    numbersSprite: HTMLImageElement

    constructor(width: number, height: number, sprite: HTMLImageElement, game: Game, numbers: HTMLImageElement) {
        super(width, height, sprite, game);
        this.numbersSprite = numbers;
    }

    getHighestScore() {
        const score = localStorage.getItem('score');
        if (score) {
            this.score = parseInt(score);
        } else {
            this.score = 0;
        }
    }

    showScreen(mode: string) {
        this.animSpriteIndex = 0;
        this.AUDIO.play();
        this.game.clearCanvas();
        this.getHighestScore();
        this.spriteAnimation = window.setInterval(() => {
            this.animSpriteIndex++;
            this.render();
            if (this.animSpriteIndex === this.SPRITE_COUNT - 1) {
                this.renderScore();
                clearInterval(this.spriteAnimation);
                document.onkeydown = (e: KeyboardEvent) => {
                    if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                        this.hideScreen(mode);
                    }
                }
            }
        }, this.ANIM_INTERVAL);
        this.render();
    }

    hideScreen(mode: string) {
        this.AUDIO.pause();
        this.AUDIO.currentTime = 0;
        if (mode === 'start') {
            this.game.shouldRenderLevelScreen = true;
            this.game.start();
        } else if (mode === 'restart') {
            this.game.shouldRenderGameScreen = false;
            this.game.shouldRenderLevelScreen = true;
            this.game.restart();
        }
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        this.sx = this.animSpriteIndex * this.width;
        ctx.drawImage(this.sprite, this.sx, this.sy, this.width, this.height, this.dx, this.dy, this.width, this.height);
    }

    renderScore() {
        const ctx = this.game.playfield.getContext('2d');
        const formattedScore = NumberFormatter.padWithZeroes(this.score, this.SCORE_TOTAL_DIGITS);
        let dx = this.SCORE_BASE_X;
        let dy = this.SCORE_BASE_Y;
        for (let i = 0; i < this.SCORE_TOTAL_DIGITS; i++) {
            const numberData = numbersData[formattedScore[i]];
            const { x, y, width, height } = numberData;
            ctx.drawImage(this.numbersSprite, x, this.NUMBERS_SY, width, height, dx, dy, width * this.SIZE_MULTIPLIER, height * this.SIZE_MULTIPLIER);
            dx += (width * this.SIZE_MULTIPLIER + this.DIGIT_GAP);
        }
    }
}