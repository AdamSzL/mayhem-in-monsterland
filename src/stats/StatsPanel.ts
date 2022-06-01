import TextSprite from '../sprites/TextSprite';
import sprites from '../../json/textSprites.json';
import Game from '../game/Game';
import numberSprites from '../../json/numberSprites.json';
import { NumberFormatter } from '../helpers/helpers';

export interface NumberSprite {
    x: number,
    y: number,
    width: number,
    height: number
}

const numbers: { [key: string]: NumberSprite } = numberSprites;

export default class StatsPanel {
    readonly STATS_TOP = 775
    readonly DIGIT_OFFSET = 5
    readonly TIME_OFFSET = 30
    readonly MAGIC_STARS_OFFSET = 50

    readonly SCORE_DIGITS = 8
    readonly STARS_DIGITS = 3
    readonly MAGIC_DIGITS = 3
    readonly TIME_DIGITS = 3
    readonly UP_DIGITS = 2

    game: Game

    currentSpriteNames: string[] = ['score', 'magic', 'time', '1up']
    textSprites: TextSprite[] = []

    images: HTMLImageElement[]

    numbers: HTMLImageElement

    constructor(game: Game, images: HTMLImageElement[]) {
        this.game = game;
        this.images = images;
        this.numbers = images[images.length - 1];
        this.initSprites();
    }

    initSprites() {
        for (let i = 0; i < sprites.length; i++) {
            this.textSprites.push(new TextSprite(sprites[i].name, sprites[i].destX, sprites[i].destY, sprites[i].destWidth, sprites[i].destHeight, this.images[i]));
        }
    }

    render() {
        this.currentSpriteNames.forEach(currentSprite => {
            const textSprite = this.textSprites.find(textSprite => textSprite.name === currentSprite);
            textSprite.render();

            this.renderValue(textSprite);
        });
    }

    renderValue(textSprite: TextSprite) {
        const ctx = this.game.playfield.getContext('2d');
        let value: string = NumberFormatter.padWithZeroes(this.game.timeLeft, this.TIME_DIGITS);

        if (textSprite.name === 'score') {
            value = NumberFormatter.padWithZeroes(this.game.score, this.SCORE_DIGITS);
        } else if (textSprite.name === 'stars') {
            value = NumberFormatter.padWithZeroes(this.game.stars, this.STARS_DIGITS);
        } else if (textSprite.name === 'magic') {
            value = NumberFormatter.padWithZeroes(this.game.magic, this.MAGIC_DIGITS);
        } else if (textSprite.name === '1up') {
            value = NumberFormatter.padWithZeroes(this.game.triesLeft, this.UP_DIGITS);
            value = 'x' + value;
        }


        let destX: number = textSprite.destX;
        if (textSprite.name === 'magic' || textSprite.name === 'stars') destX = textSprite.destX + this.MAGIC_STARS_OFFSET;
        else if (textSprite.name === 'time') destX = textSprite.destX + this.TIME_OFFSET;

        for (let char of value) {
            const { x, y, width, height } = numbers[char];
            if (textSprite.name === 'magic' && this.game.magic === 0) {
                ctx.drawImage(this.numbers, x, height * (Math.floor(textSprite.spriteIndex) + TextSprite.MAGIC_OFFSET), width, height, destX, this.STATS_TOP, width, height);
            } else {
                ctx.drawImage(this.numbers, x, y, width, height, destX, this.STATS_TOP, width, height);
            }

            destX += (width + this.DIGIT_OFFSET);
        }
    }
}