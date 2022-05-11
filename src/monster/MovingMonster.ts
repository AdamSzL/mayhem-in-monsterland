import Monster from './Monster';
import { DirectionH } from '../player/PlayerMovementController';
import { Ramp } from '../map/Map';
import Game from '../game/Game';

export default class MovingMonster extends Monster {
    handleMovement(dt: number) {
        if (!this.isStanding) {
            if (this.directionH === DirectionH.RIGHT) {
                this.x += this.speed * dt;

                this.handleRamps();

                if (this.x + 3 >= this.startX + this.range.horizontal) {
                    this.isStanding = true;
                    setTimeout(() => {
                        this.isStanding = false;
                    }, this.STAND_TIMEOUT);
                    this.x = Math.floor(this.x);
                    this.directionH = DirectionH.LEFT;
                }
            } else if (this.directionH === DirectionH.LEFT) {
                this.x -= this.speed * dt;

                this.handleRamps();

                if (this.x <= this.startX) {
                    this.isStanding = true;
                    setTimeout(() => {
                        this.isStanding = false;
                    }, this.STAND_TIMEOUT);
                    this.x = Math.ceil(this.x);
                    this.directionH = DirectionH.RIGHT;
                }
            }
        }
    }
    handleRamps() {
        const ramp = this.checkIfAtRamp();
        if (ramp) {
            const xOffset = this.x - ramp.x;
            const width = (ramp.type === 'up' ? xOffset : ramp.width - xOffset);
            const height = width / 2;
            const yOffset = ramp.height - height;
            this.y = ramp.y + yOffset - 3;
        }
    }
    checkIfAtRamp(): (Ramp | null) {
        const ramps = this.game.map.ramps;
        const ramp = ramps.find(ramp => (this.x >= ramp.x && this.x < ramp.x + ramp.width && this.y >= ramp.y - 3 && this.y < ramp.y + ramp.height));
        return ramp || null;
    }
    updateMonsterData() {
        const spriteIndex = this.shouldSpriteIndexIncrease ? Math.floor(this.currentSpriteIndex) : Math.ceil(this.currentSpriteIndex);
        if (this.directionH === DirectionH.LEFT) {
            this.width = this.spriteData.moving.left[spriteIndex].width;
            this.height = this.spriteData.moving.left[spriteIndex].height;
        } else {
            const widthOffset = this.spriteData.moving.left[spriteIndex].width - this.width;
            this.x -= (widthOffset / Game.CELL_SIZE);
            this.width = this.spriteData.moving.right[spriteIndex].width;
            this.height = this.spriteData.moving.right[spriteIndex].height;
        }
    }
}