import { DirectionH } from '../player/PlayerMovementController';
import MovingMonster from './MovingMonster';

export default class Wasp extends MovingMonster {
    readonly SPRITE_SPEED_MULTIPLIER: number = 2

    dropsMagicDust: boolean = false

    update(dt: number) {
        if (this.isAlive) {
            this.handleMovement(dt);
        }

        if (this.isAnimationRunning) {
            this.updateAnimationSprite(dt);
        } else {
            this.updateSprite(dt);
            this.updateMonsterData();
        }
    }

    resetSprite() {
        this.currentSpriteIndex = 0;
    }
}