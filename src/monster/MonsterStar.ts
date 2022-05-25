import { DirectionH } from '../player/PlayerMovementController';
import Game from '../game/Game';
import Monster, { Range } from './Monster';

export default class MonsterStar {

    static readonly SPAWN_TIMEOUT: number = 500

    readonly width: number = 48
    readonly height: number = 44
    readonly SPRITE_COUNT: number = 4
    readonly TOP_OFFSET: number = 30
    readonly PEAK_SPRITE_COUNT: number = 6
    readonly PEAK_SPRITE_WIDTH: number = 80
    readonly PEAK_SPRITE_HEIGHT: number = 76
    readonly PEAK_ANIMATION_SPEED_MULTIPLIER: number = 2

    static sprite: HTMLImageElement
    static peakAnimationSprite: HTMLImageElement

    baseX: number
    baseY: number
    x: number
    y: number
    ratio: number
    direction: DirectionH
    speed: number
    spriteChangeSpeed: number = 8
    range: Range

    currentSpriteIndex: number = 0
    peakAnimationSpriteIndex: number = 0

    isAtPeak: boolean = false
    isPresent: boolean = true
    shouldRespawn: boolean = true

    baseMonster: Monster
    game: Game

    constructor(x: number, y: number, range: Range, speed: number, direction: DirectionH, game: Game) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.range = range;
        this.speed = speed;
        this.direction = direction;
        this.game = game;

        if (this.range.vertical !== 0) {
            this.ratio = this.range.vertical / this.range.horizontal;
        }
    }

    update(dt: number) {
        if (this.direction === DirectionH.LEFT && !this.isAtPeak && this.isPresent) {
            if (this.x <= this.baseX - this.range.horizontal) {
                this.isAtPeak = true;
                this.currentSpriteIndex = 0;
            }
            this.x -= dt * this.speed;
        } else if (this.direction === DirectionH.RIGHT && !this.isAtPeak && this.isPresent) {
            if (this.x >= this.baseX + this.range.horizontal) {
                this.isAtPeak = true;
                this.currentSpriteIndex = 0;
            }
            this.x += dt * this.speed;
        }

        if (this.range.vertical !== 0) {
            const xOffset = Math.abs(this.x - this.baseX);
            const yOffset = xOffset * this.ratio;
            this.y = this.baseY + yOffset;
        }

        if (this.isPresent) {
            this.updateSprite(dt);
        }
    }

    updateSprite(dt: number) {
        this.currentSpriteIndex += (dt * this.spriteChangeSpeed);

        if (this.currentSpriteIndex >= this.SPRITE_COUNT) {
            this.currentSpriteIndex = 0;
        }

        if (this.isAtPeak) {
            this.peakAnimationSpriteIndex += (dt * this.spriteChangeSpeed * this.PEAK_ANIMATION_SPEED_MULTIPLIER);

            if (this.peakAnimationSpriteIndex >= this.PEAK_SPRITE_COUNT) {
                this.isPresent = false;
                setTimeout(() => {
                    const monster = this.game.monsters.find(monster => monster.x === this.baseX && monster.y === this.baseY);
                    if (monster.directionH === DirectionH.RIGHT) {
                        this.direction = DirectionH.RIGHT;
                        this.x = this.baseX + Monster.BASE_WIDTH;
                    } else if (monster.directionH === DirectionH.LEFT) {
                        this.direction = DirectionH.LEFT;
                        this.x = this.baseX - Monster.BASE_WIDTH;
                    }
                    this.peakAnimationSpriteIndex = 0;
                    this.currentSpriteIndex = 0;
                    if (this.shouldRespawn) {
                        this.isPresent = true;
                    }
                    this.isAtPeak = false;
                }, MonsterStar.SPAWN_TIMEOUT);
            }
        }
    }

    render() {
        if (this.isPresent) {
            const ctx = this.game.playfield.getContext('2d');
            const normalSpriteIndex = Math.floor(this.currentSpriteIndex);
            const peakSpriteIndex = Math.floor(this.peakAnimationSpriteIndex);
            const x = (this.x - this.game.map.x) * Game.CELL_SIZE;
            let y = this.y * Game.CELL_SIZE + this.TOP_OFFSET;
            if (this.isAtPeak) {
                y -= this.TOP_OFFSET / 2;
                const width = this.PEAK_SPRITE_WIDTH;
                const height = this.PEAK_SPRITE_HEIGHT;
                ctx.drawImage(MonsterStar.peakAnimationSprite, peakSpriteIndex * width, normalSpriteIndex * height, width, height, x, y, width, height);
            } else {
                ctx.drawImage(MonsterStar.sprite, normalSpriteIndex * this.width, 0, this.width, this.height, x, y, this.width, this.height);
            }
        }
    }
}