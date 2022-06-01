import TextSprite from '../sprites/TextSprite';
import sprites from '../../json/textSprites.json';
import Game from '../game/Game';
import numberSprites from '../../json/numberSprites.json';
import { NumberFormatter } from '../helpers/helpers';
import Stat from './Stat';
import Score from './Score';
import Magic from './Magic';
import Stars from './Stars';
import Lives from './Lives';
import Time from './Time';

export interface NumberSprite {
    x: number,
    y: number,
    width: number,
    height: number
}

export interface NumberData {
    [key: string]: NumberSprite
}

const numbers: NumberData = numberSprites;

export default class StatsPanel {
    static readonly TOP_OFFSET = 775
    static readonly DIGIT_OFFSET = 5
    static readonly TIME_OFFSET = 30
    static readonly MAGIC_STARS_OFFSET = 50
    static numbersSprite: HTMLImageElement

    score: Score
    magic: Magic
    stars: Stars
    lives: Lives
    time: Time

    game: Game

    currentSpriteNames: string[] = ['score', 'magic', 'time', '1up']

    constructor(game: Game, score: HTMLImageElement, magic: HTMLImageElement, time: HTMLImageElement, lives: HTMLImageElement, stars: HTMLImageElement, numbers: HTMLImageElement) {
        this.game = game;
        StatsPanel.numbersSprite = numbers;
        this.initStats(score, magic, time, lives, stars);
    }

    initStats(score: HTMLImageElement, magic: HTMLImageElement, time: HTMLImageElement, lives: HTMLImageElement, stars: HTMLImageElement) {
        this.score = new Score(sprites['score'].destX, sprites['score'].destY, sprites['score'].destWidth, sprites['score'].destHeight, score, numbers, this.game);
        this.magic = new Magic(sprites['magic'].destX, sprites['magic'].destY, sprites['magic'].destWidth, sprites['magic'].destHeight, magic, numbers, this.game);
        this.time = new Time(sprites['time'].destX, sprites['time'].destY, sprites['time'].destWidth, sprites['time'].destHeight, time, numbers, this.game);
        this.lives = new Lives(sprites['lives'].destX, sprites['lives'].destY, sprites['lives'].destWidth, sprites['lives'].destHeight, lives, numbers, this.game);
        this.stars = new Stars(sprites['stars'].destX, sprites['stars'].destY, sprites['stars'].destWidth, sprites['stars'].destHeight, stars, numbers, this.game);
    }

    update(dt: number) {
        this.score.update(dt);
        this.magic.update(dt);
        this.time.update(dt);
        this.lives.update(dt);
    }

    reset() {
        this.magic.currentSpriteIndex = 0;
    }

    render() {
        this.score.render();
        this.magic.render();
        this.time.render();
        this.lives.render();
        //this.stars.render();
    }

    // renderValue(textSprite: TextSprite) {
    //     const ctx = this.game.playfield.getContext('2d');
    //     let value: string = NumberFormatter.padWithZeroes(this.game.timeLeft, this.TIME_DIGITS);

    //     if (textSprite.name === 'score') {
    //         value = NumberFormatter.padWithZeroes(this.game.score, this.SCORE_DIGITS);
    //     } else if (textSprite.name === 'stars') {
    //         value = NumberFormatter.padWithZeroes(this.game.stars, this.STARS_DIGITS);
    //     } else if (textSprite.name === 'magic') {
    //         value = NumberFormatter.padWithZeroes(this.game.magic, this.MAGIC_DIGITS);
    //     } else if (textSprite.name === '1up') {
    //         value = NumberFormatter.padWithZeroes(this.game.triesLeft, this.UP_DIGITS);
    //         value = 'x' + value;
    //     }


    //     let destX: number = textSprite.destX;
    //     if (textSprite.name === 'magic' || textSprite.name === 'stars') destX = textSprite.destX + this.MAGIC_STARS_OFFSET;
    //     else if (textSprite.name === 'time') destX = textSprite.destX + this.TIME_OFFSET;

    //     for (let char of value) {
    //         const { x, y, width, height } = numbers[char];
    //         if (textSprite.name === 'magic' && this.game.magic === 0) {
    //             ctx.drawImage(this.numbers, x, height * (Math.floor(textSprite.spriteIndex) + TextSprite.MAGIC_OFFSET), width, height, destX, this.STATS_TOP, width, height);
    //         } else {
    //             ctx.drawImage(this.numbers, x, y, width, height, destX, this.STATS_TOP, width, height);
    //         }

    //         destX += (width + this.DIGIT_OFFSET);
    //     }
    // }
}