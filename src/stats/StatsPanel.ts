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
    }
}