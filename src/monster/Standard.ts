import MovingMonster from './MovingMonster';

export default class Standard extends MovingMonster {
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