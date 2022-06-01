import Stat from './Stat';
import { NumberFormatter } from '../helpers/helpers';
import StatsPanel from './StatsPanel';

export default class Lives extends Stat {
    readonly TOTAL_DIGITS: number = 2
    readonly CHECKPOINT_REACH_SPRITE_COUNT: number = 2
    readonly ONE_LIFE_ANIM_SPRITE_COUNT: number = 5

    readonly spriteChangeSpeed: number = 20

    readonly spriteIndexes: number[] = [0, 8, 10, 8, 0]

    textSpriteIndex: number = 0
    valueSpriteIndex: number = 0

    update(dt: number) {
        if (this.game.didReachCheckpoint) {
            this.textSpriteIndex += (dt * this.spriteChangeSpeed);

            if (this.textSpriteIndex >= this.CHECKPOINT_REACH_SPRITE_COUNT) {
                this.textSpriteIndex = 0;
            }
        }

        if (this.game.player.lives === 1) {
            this.valueSpriteIndex += (dt * this.spriteChangeSpeed);

            if (this.valueSpriteIndex >= this.ONE_LIFE_ANIM_SPRITE_COUNT) {
                this.valueSpriteIndex = 0;
            }
        }
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        const spriteInd = Math.floor(this.textSpriteIndex);
        ctx.drawImage(this.sprite, 0, this.height * spriteInd, this.width, this.height, this.x, this.y, this.width, this.height);
        this.renderValue();
    }

    renderValue() {
        const ctx = this.game.playfield.getContext('2d');
        const value = `x${NumberFormatter.padWithZeroes(this.game.triesLeft, this.TOTAL_DIGITS)}`;

        let destX = this.x;

        for (let char of value) {
            const { x, y, width, height } = this.numbers[char];
            const spriteInd = this.spriteIndexes[Math.floor(this.valueSpriteIndex)];
            const sy = this.game.player.lives === 1 ? spriteInd * height : y;
            ctx.drawImage(StatsPanel.numbersSprite, x, sy, width, height, destX, StatsPanel.TOP_OFFSET, width, height);

            destX += (width + StatsPanel.DIGIT_OFFSET);
        }
    }
}