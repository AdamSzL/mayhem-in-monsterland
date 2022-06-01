import Stat from './Stat';
import { NumberFormatter } from '../helpers/helpers';
import StatsPanel from './StatsPanel';

export default class Time extends Stat {
    readonly TOTAL_DIGITS: number = 3
    readonly FIRST_ANIM_MAX: number = 60
    readonly SECOND_ANIM_MAX: number = 30
    readonly FIRST_ANIM_SPRITE_COUNT: number = 6
    readonly SECOND_ANIM_SPRITE_COUNT: number = 3

    readonly firstAnimSpriteIndexes: number[] = [0, 11, 12, 13, 0, 14]
    readonly secondAnimSpriteIndexes: number[] = [0, 11, 2]

    secondAnimSpriteIndex: number = 0
    firstAnimSpriteIndex: number = 0

    spriteAnimSpeed: number = 20

    update(dt: number) {
        if (this.game.timeLeft < this.SECOND_ANIM_MAX) {
            this.secondAnimSpriteIndex += (dt * this.spriteAnimSpeed);

            if (this.secondAnimSpriteIndex >= this.SECOND_ANIM_SPRITE_COUNT) {
                this.secondAnimSpriteIndex = 0;
            }
        } else if (this.game.timeLeft < this.FIRST_ANIM_MAX) {
            this.firstAnimSpriteIndex += (dt * this.spriteAnimSpeed);

            if (this.firstAnimSpriteIndex >= this.FIRST_ANIM_SPRITE_COUNT) {
                this.firstAnimSpriteIndex = 0;
            }
        }
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        ctx.drawImage(this.sprite, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        this.renderValue();
    }

    renderValue() {
        const ctx = this.game.playfield.getContext('2d');
        const value = NumberFormatter.padWithZeroes(this.game.timeLeft, this.TOTAL_DIGITS);

        let destX = this.x + StatsPanel.TIME_OFFSET;

        for (let char of value) {
            const { x, y, width, height } = this.numbers[char];
            const firstAnimInd = Math.floor(this.firstAnimSpriteIndex);
            const secAnimInd = Math.floor(this.secondAnimSpriteIndex);
            const sy = this.game.timeLeft < this.SECOND_ANIM_MAX ? height * this.secondAnimSpriteIndexes[secAnimInd] : (this.game.timeLeft < this.FIRST_ANIM_MAX ? height * this.firstAnimSpriteIndexes[firstAnimInd] : y);
            ctx.drawImage(StatsPanel.numbersSprite, x, sy, width, height, destX, StatsPanel.TOP_OFFSET, width, height);

            destX += (width + StatsPanel.DIGIT_OFFSET);
        }
    }
}