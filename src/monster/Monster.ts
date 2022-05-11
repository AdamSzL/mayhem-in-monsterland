import { DirectionH, DirectionV } from '../player/PlayerMovementController';
import Game from '../game/Game';


interface Range {
    horizontal: number,
    vertical: number
}

interface MonsterSpritesData {
    "moving": {
        "left": MonsterSpriteData[],
        "right": MonsterSpriteData[]
    }
    "standing": MonsterSpriteData
}

interface MonsterSpriteData {
    x: number,
    y: number,
    width: number,
    height: number
}

export default class Monster {
    readonly SPRITE_SPEED_MULTIPLIER: number = 1
    readonly STAND_TIMEOUT: number = 100
    readonly RESPAWN_TIMEOUT: number = 3000
    //kolizje z graczem

    spriteCoords: { x: number, y: number }[]
    width: number = 3
    height: number
    startX: number
    startY: number
    x: number
    y: number

    isShooting: boolean = false
    isStanding: boolean = false
    isAlive: boolean = true

    currentSpriteIndex = 0

    shouldSpriteIndexIncrease: boolean = true

    range: Range
    speed: number
    mode: string

    sprite: HTMLImageElement
    spriteData: MonsterSpritesData

    directionH: DirectionH = DirectionH.RIGHT
    directionV: DirectionV = DirectionV.NONE

    game: Game

    constructor(game: Game, x: number, y: number, range: Range, speed: number, mode: string, sprite: HTMLImageElement, spriteData: MonsterSpritesData) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.range = range;
        this.speed = speed;
        this.mode = mode;
        this.sprite = sprite;
        this.spriteData = spriteData;

        this.width = spriteData.moving.right[this.currentSpriteIndex].width;
        this.height = spriteData.moving.right[this.currentSpriteIndex].height;
    }

    update(dt: number) { }

    updateSprite(dt: number) {
        if (this.shouldSpriteIndexIncrease) {
            this.currentSpriteIndex += (dt * this.speed * this.SPRITE_SPEED_MULTIPLIER);
        } else {
            this.currentSpriteIndex -= (dt * this.speed * 2);
        }

        if (this.currentSpriteIndex <= 0 && !this.shouldSpriteIndexIncrease) {
            this.currentSpriteIndex = 0;
            this.shouldSpriteIndexIncrease = true;
        } else if (this.currentSpriteIndex >= this.spriteData.moving.left.length && this.shouldSpriteIndexIncrease) {
            this.currentSpriteIndex = 2;
            this.shouldSpriteIndexIncrease = false;
        }
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        const x = (this.x - this.game.map.x) * Game.CELL_SIZE;
        const topOffset = Game.CELL_SIZE * 3 - this.height;
        const y = this.y * Game.CELL_SIZE + topOffset;
        const spriteInd = this.shouldSpriteIndexIncrease ? Math.floor(this.currentSpriteIndex) : Math.ceil(this.currentSpriteIndex);
        let spriteX: number = (this.directionH === DirectionH.LEFT ? this.spriteData.moving.left[spriteInd].x : this.spriteData.moving.right[spriteInd].x);
        let spriteY: number = (this.directionH === DirectionH.LEFT ? this.spriteData.moving.left[spriteInd].y : this.spriteData.moving.right[spriteInd].y);
        if (this.isStanding) {
            spriteX = this.spriteData.standing.x;
            spriteY = this.spriteData.standing.y;
        }
        ctx.drawImage(this.sprite, spriteX, spriteY, this.width, this.height, x, y, this.width, this.height);
    }

}