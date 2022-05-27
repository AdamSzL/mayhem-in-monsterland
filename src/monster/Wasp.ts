import { DirectionH } from '../player/PlayerMovementController';
import MovingMonster from './MovingMonster';

export default class Wasp extends MovingMonster {
    readonly SPRITE_SPEED_MULTIPLIER: number = 2

    dropsMagicDust: boolean = false
    currentAnimation: number = 0

    update(dt: number) {
        if (this.isAlive) {
            if (this.mode === 'special') {
                this.handleSpecialMovement(dt);
            } else {
                this.handleMovement(dt);
            }
        }

        if (this.isAnimationRunning) {
            this.updateAnimationSprite(dt);
        } else {
            this.updateSprite(dt);
            this.updateMonsterData();
        }
    }

    handleSpecialMovement(dt: number) {
        if (this.x >= this.startX + this.range.horizontal && this.currentAnimation === 0) {
            this.currentAnimation = 1;
            this.y = this.startY;
            this.directionH = DirectionH.LEFT;
            this.isStanding = true;
            setTimeout(() => {
                this.isStanding = false;
            }, this.STAND_TIMEOUT);
        } else if (this.x <= this.startX && this.currentAnimation === 1) {
            this.currentAnimation = 0;
            this.x = this.startX;
            this.directionH = DirectionH.RIGHT;
            this.isStanding = true;
            setTimeout(() => {
                this.isStanding = false;
            }, this.STAND_TIMEOUT);
        }

        if (this.currentAnimation === 0) {
            this.x += (dt * this.speed * 2);

            this.y = this.startY + this.calculateYCoordinate();
        } else {
            this.x -= (dt * this.speed);
        }
    }

    calculateYCoordinate(): number {
        const x0 = this.range.horizontal / 2;
        const radius = this.range.vertical;
        const x = this.x - this.startX;
        return Math.sqrt(Math.pow(radius, 2) - Math.pow(x - x0, 2));
    }

    resetSprite() {
        this.currentSpriteIndex = 0;
    }
}