import { DirectionH } from '../player/PlayerMovementController';
import MovingMonster from './MovingMonster';

export default class Wasp extends MovingMonster {
    readonly SPRITE_SPEED_MULTIPLIER: number = 2

    update(dt: number) {
        this.handleMovement(dt);

        this.updateSprite(dt);

        this.updateMonsterData();
    }
}