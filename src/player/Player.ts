import Game from '../game/Game'
import playerSprites from '../../json/playerSprites.json'
import { PlayerMovementController, DirectionH, DirectionV } from './PlayerMovementController';
import { Ramp } from '../sprites/Map';

export interface PlayerSprite {
    x: number,
    y: number
}

export default class Player {
    readonly TOP_OFFSET = Game.PLAYER_WIDTH - Game.PLAYER_HEIGHT

    x: number = 408
    y: number = 9

    vx: number = 20
    jumpSpeed: number = 30

    width: number = 96
    height: number = 84

    sprite: HTMLImageElement
    game: Game

    playfield: HTMLCanvasElement = document.querySelector('canvas')

    currentPosIndex: number = 0

    spriteChangeSpeed: number = 20

    directionH: DirectionH = DirectionH.RIGHT
    directionV: DirectionV = DirectionV.NONE

    isMoving: boolean = false
    isUsingSpecialSkill: boolean = false
    isFlying: boolean = false
    isDucking: boolean = false
    isDuckFalling: boolean = false

    jumpStartY: number
    duckFallStartY: number

    shouldGravityWork: boolean = true

    isBeingBlocked: boolean = false

    movementController: PlayerMovementController

    leftSprites: { [key: string]: PlayerSprite[] } = playerSprites.left
    rightSprites: { [key: string]: PlayerSprite[] } = playerSprites.right

    constructor(game: Game, sprite: HTMLImageElement) {
        this.game = game;
        this.sprite = sprite;
    }

    initController() {
        this.movementController = new PlayerMovementController(this);
    }

    resetSpeed() {
        this.vx = Game.BASE_SPEED;
        this.game.map.vx = Game.BASE_SPEED;
    }

    increaseSpeed(dt: number) {
        if (this.vx < Game.MAX_SPEED) {
            this.vx += Game.SPEED_MULTIPLIER * dt;
            this.game.map.vx += Game.SPEED_MULTIPLIER * dt;
        }
    }

    update(dt: number) {
        const ramp = this.handleRamps();
        if (!this.isFlying && ramp) {
            const xOffset = this.x - ramp.x;
            const width = (ramp.type === 'up' ? xOffset : ramp.width - xOffset);
            const height = width / 2;
            const yOffset = ramp.height - height;
            this.y = ramp.y + yOffset - 3;
        } else {
            if (this.shouldGravityWork) {
                this.handleGravity();
            }

            if (this.movementController.isLeftBeingHolded && !this.isMoving && !this.movementController.checkIfBlocked('left') && !this.isDucking) {
                this.isMoving = true;
            } else if (this.movementController.isRightBeingHolded && !this.isMoving && !this.movementController.checkIfBlocked('right') && !this.isDucking) {
                this.isMoving = true;
            }

            // if (Math.abs(this.x - this.movementController.roundCoord(this.x, 'h')) <= 0.1) {
            if (this.directionH === DirectionH.RIGHT && this.isMoving && this.movementController.checkIfBlocked('right') && !this.checkIfXAtRamp()) {
                this.x = this.movementController.roundCoord(this.x, 'h');
                this.isMoving = false;
            } else if (this.directionH === DirectionH.LEFT && this.isMoving && this.movementController.checkIfBlocked('left') && !this.checkIfXAtRamp()) {
                this.x = this.movementController.roundCoord(this.x, 'h');
                this.isMoving = false;
            }
            // }


            if (this.directionV === DirectionV.UP) {
                if (this.movementController.checkIfBlocked('top')) {
                    if (this.movementController.roundCoord(this.y, 'v') > 0) {
                        this.isBeingBlocked = true;
                        setTimeout(() => {
                            this.isBeingBlocked = false;
                        }, 100);
                    }
                    this.y = this.movementController.roundCoord(this.y, 'v');
                    this.directionV = DirectionV.NONE;
                    this.shouldGravityWork = false;
                    setTimeout(() => {
                        this.directionV = DirectionV.DOWN;
                    }, 100);
                } else if (this.isFlying && ((Math.abs(this.y - this.jumpStartY) >= Game.JUMP_HEIGHT))) {
                    this.directionV = DirectionV.NONE;
                    this.shouldGravityWork = false;
                    setTimeout(() => {
                        this.directionV = DirectionV.DOWN;
                    }, 100);

                } else {
                    this.y -= (dt * this.jumpSpeed);
                }
            } else if (this.directionV === DirectionV.DOWN) {
                if (this.isDuckFalling && Math.abs(this.y - this.duckFallStartY) >= 3) {
                    this.isDuckFalling = false;
                }
                if (this.movementController.checkIfBlocked('bottom')) {
                    this.y = this.movementController.roundCoord(this.y, 'v');
                    this.directionV = DirectionV.NONE;
                    this.isFlying = false;
                    this.isDuckFalling = false;
                    this.shouldGravityWork = true;
                    if (this.isDucking && (!this.movementController.isBottomBeingHolded || this.movementController.isTopBeingHolded)) {
                        this.isDucking = false;
                        this.currentPosIndex = 0;

                        if (this.movementController.isRightBeingHolded && !this.movementController.isLeftBeingHolded && this.directionH === DirectionH.LEFT) {
                            this.directionH = DirectionH.RIGHT;
                        } else if (this.movementController.isLeftBeingHolded && !this.movementController.isRightBeingHolded && this.directionH === DirectionH.RIGHT) {
                            this.directionH = DirectionH.LEFT;
                        }
                    } else if (!this.isDucking && this.movementController.isBottomBeingHolded && !this.movementController.isTopBeingHolded) {
                        this.isMoving = false;
                        this.isDucking = true;
                    }
                } else {
                    this.y += (dt * this.jumpSpeed);
                }
            }
        }





        if (this.directionH === DirectionH.RIGHT && this.isMoving) {
            this.currentPosIndex += (dt * this.spriteChangeSpeed);
        } else if (this.directionH === DirectionH.LEFT && this.isMoving) {
            this.currentPosIndex += (dt * this.spriteChangeSpeed);
        }

        if (this.currentPosIndex >= 8) {
            this.currentPosIndex = 0;
        }
    }

    handleGravity() {
        if (this.directionV === DirectionV.NONE) {
            let permeableBlocks: (string | number)[] = [0];
            if (this.movementController.isFireBeingHolded && this.isDucking) {
                this.isDuckFalling = true;
                this.duckFallStartY = this.y;
            }
            if (this.isDuckFalling) {
                permeableBlocks = [0, 2, 3];
            }
            const diffFloor = Math.abs(this.y - Math.floor(this.y));
            const diffCeil = Math.abs(this.y - Math.ceil(this.y));
            const x = this.movementController.roundCoord(this.x, 'h');
            const y = (diffFloor <= diffCeil ? Math.floor(this.y) : Math.ceil(this.y)) + 3;
            if (y < this.game.maps['1'].length - 1) {
                const blocksUnder = [this.game.maps['1'][y][x], this.game.maps['1'][y][x + 1], this.game.maps['1'][y][x + 2]];

                if (permeableBlocks.includes(blocksUnder[0]) && permeableBlocks.includes(blocksUnder[1]) && permeableBlocks.includes(blocksUnder[2])) {
                    this.isFlying = true;
                    this.directionV = DirectionV.DOWN;
                } else {
                    this.isDuckFalling = false;
                    this.y = this.movementController.roundCoord(this.y, 'v');
                }
            }
        }
    }

    checkOffset(mode: string) {
        if (mode === 'v') {
            return Math.abs(this.y - this.movementController.roundCoord(this.y, 'v')) <= 0.2;
        } else {
            return Math.abs(this.x - this.movementController.roundCoord(this.y, 'h')) <= 0.2;
        }
    }

    handleRamps(): (Ramp | null) {
        const ramps = this.game.map.ramps;
        const ramp = ramps.find(ramp => (this.x >= ramp.x && this.x < ramp.x + ramp.width && this.y >= ramp.y - 3 && this.y < ramp.y + ramp.height));
        return ramp || null;
    }

    checkIfXAtRamp(): boolean {
        const ramps = this.game.map.ramps;
        const ramp = ramps.find(ramp => (this.x >= ramp.x && this.x < ramp.x + ramp.width));
        return (ramp ? true : false);
    }

    render() {
        const ctx = this.playfield.getContext('2d');
        const destX = (this.x - this.game.map.x) * Game.CELL_SIZE;
        const destY = this.y * Game.CELL_SIZE + this.TOP_OFFSET;
        let x: number, y: number

        if (this.isBeingBlocked || this.isDucking) {
            if (this.directionH === DirectionH.LEFT) {
                ({ x, y } = this.leftSprites['blocked'][0]);
            } else if (this.directionH === DirectionH.RIGHT) {
                ({ x, y } = this.rightSprites['blocked'][0]);
            }
        } else if (this.isFlying) {
            ({ x, y } = this.directionH === DirectionH.LEFT ? this.leftSprites['flying'][0] : this.rightSprites['flying'][0]);
        } else if (this.directionH === DirectionH.RIGHT) {
            ({ x, y } = this.rightSprites['normal'][Math.floor(this.currentPosIndex)]);
        } else if (this.directionH === DirectionH.LEFT) {
            ({ x, y } = this.leftSprites['normal'][Math.floor(this.currentPosIndex)]);
        }
        ctx.drawImage(this.sprite, x, y, this.width, this.height, destX, destY, this.width, this.height);
    }
}