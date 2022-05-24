import Standard from './Standard';
import { DirectionH } from '../player/PlayerMovementController';

export default class StandardShooting extends Standard {
    width: number = 80
    height: number = 80
    currentSpriteIndex: number = 1

    update(dt: number) {
        //Star.update()
        if (this.game.player.x <= this.x && this.directionH === DirectionH.RIGHT) {
            this.isStanding = true;
            setTimeout(() => {
                this.isStanding = false;
                this.directionH = DirectionH.LEFT;
            }, this.STAND_TIMEOUT);
        } else if (this.game.player.x > this.x && this.directionH === DirectionH.LEFT) {
            this.isStanding = true;
            setTimeout(() => {
                this.isStanding = false;
                this.directionH = DirectionH.RIGHT;
            }, this.STAND_TIMEOUT);
        }

        if (this.isAnimationRunning) {
            this.updateAnimationSprite(dt);
        }
    }

    resetSprite() {
        this.currentSpriteIndex = 1;
    }
}