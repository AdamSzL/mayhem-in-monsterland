import Game from '../game/Game'
import playerSprites from '../../json/playerSprites.json'
import { PlayerMovementController, DirectionH, DirectionV } from './PlayerMovementController';
import { Ramp } from '../map/Map';
import Checkpoint from '../map/Checkpoint';
import Monster from '../monster/Monster';
import MagicDust from '../game/MagicDust';

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

    shouldRender: boolean = true

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
        this.checkForMonsterCollisions();
        this.checkForMagicDustsCollisions();
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

            if (this.directionH === DirectionH.RIGHT && this.isMoving && this.movementController.checkIfBlocked('right') && !this.checkIfXAtRamp()) {
                this.x = this.movementController.roundCoord(this.x, 'h');
                this.isMoving = false;
            } else if (this.directionH === DirectionH.LEFT && this.isMoving && this.movementController.checkIfBlocked('left') && !this.checkIfXAtRamp()) {
                this.x = this.movementController.roundCoord(this.x, 'h');
                this.isMoving = false;
            }

            if (this.directionV === DirectionV.UP) {
                if (this.movementController.checkIfBlocked('top')) {
                    if (this.movementController.roundCoord(this.y, 'v') > 0) {
                        this.isBeingBlocked = true;
                        setTimeout(() => {
                            this.isBeingBlocked = false;
                        }, 100);
                    }
                    this.game.jumpHeight = Game.BASE_JUMP_HEIGHT;
                    this.y = this.movementController.roundCoord(this.y, 'v');
                    this.directionV = DirectionV.NONE;
                    this.shouldGravityWork = false;
                    setTimeout(() => {
                        this.directionV = DirectionV.DOWN;
                    }, 200);
                } else if (this.isFlying && ((Math.abs(this.y - this.jumpStartY) >= this.game.jumpHeight))) {
                    this.game.jumpHeight = Game.BASE_JUMP_HEIGHT;
                    this.directionV = DirectionV.NONE;
                    this.shouldGravityWork = false;
                    setTimeout(() => {
                        this.directionV = DirectionV.DOWN;
                    }, 200);

                } else {
                    this.y -= (dt * this.jumpSpeed);
                }
            } else if (this.directionV === DirectionV.DOWN) {
                if (this.y >= this.game.maps[this.game.currentLevel].length - (Game.PLAYER_WIDTH / Game.CELL_SIZE) && this.y < this.game.maps[this.game.currentLevel].length) {
                    this.isMoving = false;
                    document.onkeydown = () => false;
                    document.onkeyup = () => false;
                    this.y += dt * this.jumpSpeed;
                } else if (this.y >= this.game.maps[this.game.currentLevel].length) {
                    this.shouldRender = false;
                } else if (this.isDuckFalling && Math.abs(this.y - this.duckFallStartY) >= 3) {
                    this.isDuckFalling = false;
                } else if (this.movementController.checkIfBlocked('bottom')) {
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

        this.updateSprite(dt);
    }

    updateSprite(dt: number) {
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
            if (y < this.game.maps[this.game.currentLevel].length - 1) {
                const blocksUnder = [this.game.maps[this.game.currentLevel][y][x], this.game.maps[this.game.currentLevel][y][x + 1], this.game.maps[this.game.currentLevel][y][x + 2]];

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

    handleRamps(): (Ramp | null) {
        if (this.x >= 548 && this.x <= 554 && this.y === 17) {
            return null;
        }
        const ramps = this.game.map.ramps;
        const ramp = ramps.find(ramp => (this.x >= ramp.x && this.x < ramp.x + ramp.width && this.y >= ramp.y - 3 && this.y < ramp.y + ramp.height));
        return ramp || null;
    }

    checkIfXAtRamp(): boolean {
        const ramps = this.game.map.ramps;
        const ramp = ramps.find(ramp => (this.x >= ramp.x && this.x < ramp.x + ramp.width));
        return (ramp ? true : false);
    }

    checkForMonsterCollisions() {
        this.game.monsters.forEach(monster => {
            if (Math.abs(this.x - monster.x) <= 5 && monster.isAlive) {
                if (this.checkIfCollides(monster)) {
                    if (this.directionV === DirectionV.DOWN && (monster.y - this.y >= 2)) {
                        this.jumpStartY = this.y;
                        this.isFlying = true;
                        this.directionV = DirectionV.UP;
                        this.game.jumpHeight = Game.MONSTER_KILLED_JUMP_HEIGHT;
                        monster.isAlive = false;
                        this.game.score += monster.points;
                        monster.isAnimationRunning = true;
                        monster.currentSpriteIndex = 0;
                        // setTimeout(() => {
                        //     monster.isAlive = true;
                        // }, monster.RESPAWN_TIMEOUT);
                    } else {
                        console.log('tracisz hp');
                    }
                }
            }
        });
    }

    checkForMagicDustsCollisions() {
        this.game.magicDusts.forEach(magicDust => {
            if (this.checkIfCollides(magicDust)) {
                this.game.score += magicDust.POINTS;
                this.game.magic--;
                if (this.game.magic === 0) {
                    console.log('magic 0');
                }
                this.game.magicDusts = this.game.magicDusts.filter(magicD => !(magicD.x === magicDust.x && magicD.y === magicDust.y));
            }
        });
    }

    checkIfCollides(entity: (Monster | MagicDust | Checkpoint)) {
        const width = this.width / Game.CELL_SIZE;
        const height = this.height / Game.CELL_SIZE;
        const entityWidth = entity.width / Game.CELL_SIZE;
        const entityHeight = entity.height / Game.CELL_SIZE;

        return (this.x < entity.x + entityWidth && this.x + width > entity.x && this.y < entity.y + entityHeight && height + this.y > entity.y);
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
        if (this.shouldRender) {
            ctx.drawImage(this.sprite, x, y, this.width, this.height, destX, destY, this.width, this.height);
        }
    }
}