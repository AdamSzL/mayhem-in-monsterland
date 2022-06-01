import Stat from './Stat';
import { NumberFormatter } from '../helpers/helpers';
import StatsPanel from './StatsPanel';

export default class Stars extends Stat {
    readonly TOTAL_DIGITS: number = 3

    render() {
        const ctx = this.game.playfield.getContext('2d');
        ctx.drawImage(this.sprite, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        this.renderValue();
    }

    renderValue() {
        const ctx = this.game.playfield.getContext('2d');
        const value = NumberFormatter.padWithZeroes(this.game.stars, this.TOTAL_DIGITS);

        let destX = this.x + StatsPanel.MAGIC_STARS_OFFSET;

        for (let char of value) {
            const { x, y, width, height } = this.numbers[char];
            ctx.drawImage(StatsPanel.numbersSprite, x, y, width, height, destX, StatsPanel.TOP_OFFSET, width, height);

            destX += (width + StatsPanel.DIGIT_OFFSET);
        }
    }
}