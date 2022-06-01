import Stat from './Stat';
import { NumberFormatter } from '../helpers/helpers';
import StatsPanel from './StatsPanel';

export default class Magic extends Stat {
    readonly TOTAL_DIGITS: number = 3
    readonly SPRITE_COUNT: number = 9
    readonly OFFSET_ROWS: number = 2

    currentSpriteIndex: number = 0
    spriteChangeSpeed: number = 20

    update(dt: number) {
        if (this.game.magic === 0) {
            this.currentSpriteIndex += (dt * this.spriteChangeSpeed);

            if (this.currentSpriteIndex >= this.SPRITE_COUNT) {
                this.currentSpriteIndex = 0;
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
        const value = NumberFormatter.padWithZeroes(this.game.magic, this.TOTAL_DIGITS);
        const spriteIndex = Math.floor(this.currentSpriteIndex);

        let destX = this.x + StatsPanel.MAGIC_STARS_OFFSET;

        for (let char of value) {
            const { x, y, width, height } = this.numbers[char];
            const sy = (this.game.magic === 0) ? this.OFFSET_ROWS * height + spriteIndex * height : y;
            ctx.drawImage(StatsPanel.numbersSprite, x, sy, width, height, destX, StatsPanel.TOP_OFFSET, width, height);

            destX += (width + StatsPanel.DIGIT_OFFSET);
        }
    }
}