import Screen from './Screen';
import Game from '../game/Game';
import numbers from '../../json/numberSprites.json';
import { NumberFormatter } from '../helpers/helpers';
import { NumberSprite } from '../game/StatsPanel';

const numbersData: { [key: string]: NumberSprite } = numbers;

export default class GameScreen extends Screen {

    audio: HTMLAudioElement

    readonly SCORE_BASE_X: number = 370
    readonly SCORE_BASE_Y: number = 665
    readonly SCORE_TOTAL_DIGITS: number = 9
    readonly SIZE_MULTIPLIER: number = 1.5
    readonly DIGIT_GAP: number = 10

    score: number
    numbersSprite: HTMLImageElement

    constructor(width: number, height: number, sprite: HTMLImageElement, game: Game, numbers: HTMLImageElement) {
        super(width, height, sprite, game);
        this.numbersSprite = numbers;
        this.audio = new Audio('audio/game-screen.wav');
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
        this.audio.play();
        this.getHighestScore();
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                this.hideScreen(mode);
            }
        }
        this.audio.addEventListener('ended', () => {
            this.hideScreen(mode);
        });
        this.render();
    }

    hideScreen(mode: string) {
        this.audio.pause();
        this.audio.currentTime = 0;
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
        ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
        this.renderScore();
    }

    renderScore() {
        const ctx = this.game.playfield.getContext('2d');
        const formattedScore = NumberFormatter.padWithZeroes(this.score, this.SCORE_TOTAL_DIGITS);
        let dx = this.SCORE_BASE_X;
        let dy = this.SCORE_BASE_Y;
        for (let i = 0; i < this.SCORE_TOTAL_DIGITS; i++) {
            const numberData = numbersData[formattedScore[i]];
            const { x, y, width, height } = numberData;
            ctx.drawImage(this.numbersSprite, x, y, width, height, dx, dy, width * this.SIZE_MULTIPLIER, height * this.SIZE_MULTIPLIER);
            dx += (width * this.SIZE_MULTIPLIER + this.DIGIT_GAP);
        }
    }
}