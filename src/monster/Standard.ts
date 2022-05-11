import MovingMonster from './MovingMonster';

export default class Standard extends MovingMonster {
    update(dt: number) {
        this.handleMovement(dt);

        this.updateSprite(dt);

        this.updateMonsterData();
    }
}