import Player from './Player';
import Game from '../game/Game';
import { Ramp } from '../map/Map';
import Monster from '../monster/Monster';
import MagicDust from '../game/MagicDust';
import Checkpoint from '../map/Checkpoint';
import MonsterStar from '../monster/MonsterStar';

export enum DirectionH {
    LEFT,
    RIGHT
}

export enum DirectionV {
    UP,
    DOWN,
    NONE
}

export class PlayerMovementController {
    player: Player


    isLeftBeingHolded: boolean = false
    isRightBeingHolded: boolean = false
    isTopBeingHolded: boolean = false
    isBottomBeingHolded: boolean = false
    isFireBeingHolded: boolean = false

    constructor(player: Player) {
        this.player = player;

        document.onkeydown = (e) => this.keyPressed(e);
        document.onkeyup = (e) => this.keyReleased(e);
    }

    resetHoldedKeys() {
        this.isLeftBeingHolded = false;
        this.isRightBeingHolded = false;
        this.isTopBeingHolded = false;
        this.isBottomBeingHolded = false;
    }

    removeListeners() {
        document.onkeydown = () => false;
        document.onkeyup = () => false;
    }

    restoreListeners() {
        document.onkeydown = (e) => this.keyPressed(e);
        document.onkeyup = (e) => this.keyReleased(e);
    }

    keyPressed(e: KeyboardEvent) {
        let { left, right, top, bottom, fire } = this.recognizeKeys(e);
        if (fire) {
            this.isFireBeingHolded = true;
        }
        if (fire && this.player.isDucking) {
            this.player.isDuckFalling = true;
            this.player.isDucking = false;
            this.player.duckFallStartY = this.player.y;
        }
        if (top && this.player.directionV === DirectionV.NONE && !this.isTopBeingHolded && !this.player.isFlying) {
            this.player.JUMP_START_SOUND.play();
            this.player.directionV = DirectionV.UP;
            this.player.jumpStartY = this.player.y;
            this.player.isFlying = true;
        }
        if (bottom && !this.player.isFlying && !this.player.isDuckFalling) {
            this.player.isDucking = true;
            this.player.isMoving = false;
        }
        if (bottom) {
            this.isBottomBeingHolded = true;
        }
        if (top) {
            this.isTopBeingHolded = true;
        }
        if (left) {
            this.isLeftBeingHolded = true;
        } else if (right) {
            this.isRightBeingHolded = true;
        }
        if (!this.player.isMoving && !this.player.isDucking && !this.player.shouldRunFallAnimation) {
            if (left) {
                this.player.directionH = DirectionH.LEFT;
                this.player.isMoving = true;
                this.player.currentPosIndex = 0;
                this.player.resetSpeed();
            } else if (right) {
                this.player.directionH = DirectionH.RIGHT;
                this.player.isMoving = true;
                this.player.currentPosIndex = 0;
                this.player.resetSpeed();
            }
        }
    }

    keyReleased(e: KeyboardEvent) {
        let { left, right, top, bottom, fire } = this.recognizeKeys(e);
        if (fire) {
            this.isFireBeingHolded = false;
        }
        if (top) {
            this.isTopBeingHolded = false;
        }
        if (bottom) {
            this.isBottomBeingHolded = false;
        }
        if (bottom && !this.player.isFlying) {
            this.player.isDucking = false;

            if (this.isRightBeingHolded && !this.isLeftBeingHolded && this.player.directionH === DirectionH.LEFT) {
                this.player.directionH = DirectionH.RIGHT;
            } else if (this.isLeftBeingHolded && !this.isRightBeingHolded && this.player.directionH === DirectionH.RIGHT) {
                this.player.directionH = DirectionH.LEFT;
            }
        }
        if (top && this.player.directionV === DirectionV.UP) {
            this.player.shouldGravityWork = false;
            this.player.directionV = DirectionV.NONE;
            setTimeout(() => {
                this.player.directionV = DirectionV.DOWN;
            }, 100);
        }
        if (left) {
            this.isLeftBeingHolded = false;
        } else if (right) {
            this.isRightBeingHolded = false;
        }
        if (this.player.isMoving && !this.player.isDucking && !this.player.shouldRunFallAnimation) {
            if (left && this.player.directionH === DirectionH.LEFT) {
                this.player.isMoving = false;
                this.player.currentPosIndex = 0;

                if (this.isRightBeingHolded) {
                    this.player.isMoving = true;
                    this.player.directionH = DirectionH.RIGHT;
                    this.player.resetSpeed();
                }
            } else if (right && this.player.directionH === DirectionH.RIGHT) {
                this.player.isMoving = false;
                this.player.currentPosIndex = 0;

                if (this.isLeftBeingHolded) {
                    this.player.isMoving = true;
                    this.player.directionH = DirectionH.LEFT;
                    this.player.resetSpeed();
                }
            }
        }
    }

    recognizeKeys(e: KeyboardEvent) {
        return {
            left: (e.key === 'a' || e.key === 'ArrowLeft' || (e.location === 3 && e.key === '4')),
            right: (e.key === 'd' || e.key === 'ArrowRight' || (e.location === 3 && e.key === '6')),
            top: (e.key === 'w' || e.key === 'ArrowUp' || (e.location === 3 && e.key === '8')),
            bottom: (e.key === 's' || e.key === 'ArrowDown' || (e.location === 3 && e.key === '2')),
            fire: (e.key === 'Enter' || (e.location === 3 && e.key === '0'))
        }
    }

    handleUpDirection(dt: number) {
        if (this.checkIfBlocked('top')) {
            if (this.roundCoord(this.player.y, 'v') > 0) {
                this.player.isBeingBlocked = true;
                setTimeout(() => {
                    this.player.isBeingBlocked = false;
                }, 100);
            }
            this.player.game.jumpHeight = Game.BASE_JUMP_HEIGHT;
            this.player.y = this.roundCoord(this.player.y, 'v');
            this.player.directionV = DirectionV.NONE;
            this.player.shouldGravityWork = false;
            setTimeout(() => {
                this.player.directionV = DirectionV.DOWN;
            }, 200);
        } else if (this.player.isFlying && ((Math.abs(this.player.y - this.player.jumpStartY) >= this.player.game.jumpHeight))) {
            this.player.game.jumpHeight = Game.BASE_JUMP_HEIGHT;
            this.player.directionV = DirectionV.NONE;
            this.player.shouldGravityWork = false;
            setTimeout(() => {
                this.player.directionV = DirectionV.DOWN;
            }, 200);

        } else {
            this.player.y -= (dt * this.player.jumpSpeed);
        }
    }

    handleDownDirection(dt: number) {
        if (this.player.y >= this.player.game.maps[this.player.game.currentLevel].length - (Game.PLAYER_WIDTH / Game.CELL_SIZE) && this.player.y < this.player.game.maps[this.player.game.currentLevel].length) {
            this.player.isMoving = false;
            document.onkeydown = () => false;
            document.onkeyup = () => false;
            this.player.y += dt * this.player.jumpSpeed;
        } else if (this.player.y >= this.player.game.maps[this.player.game.currentLevel].length) {
            this.removeListeners();
            this.resetHoldedKeys();
            this.player.shouldUpdate = false;
            this.player.shouldRender = false;
            this.player.isFlying = false;
            this.player.isMoving = false;
            let shouldBeDead: boolean = true;
            if (this.player.x >= Game.FINISH_BLOCK_START_X - Game.FINISH_BLOCK_OFFSET && this.player.x < Game.FINISH_BLOCK_END_X + Game.FINISH_BLOCK_OFFSET) {
                if (this.player.game.magic === 0) {
                    shouldBeDead = false;
                }
            }

            this.player.game.mainAudio.pause();
            if (shouldBeDead) {
                this.player.handleDeath();
            } else {
                this.player.game.saveScore();
                this.player.game.shouldRenderFinishScreen = true;
            }
        } else if (this.player.isDuckFalling && Math.abs(this.player.y - this.player.duckFallStartY) >= 3) {
            this.player.isDuckFalling = false;
        } else if (this.checkIfBlocked('bottom')) {
            this.player.JUMP_END_SOUND.play();
            this.player.y = this.roundCoord(this.player.y, 'v');
            this.player.directionV = DirectionV.NONE;
            this.player.isFlying = false;
            this.player.isDuckFalling = false;
            this.player.shouldGravityWork = true;
            if (this.player.isDucking && (!this.isBottomBeingHolded || this.isTopBeingHolded)) {
                this.player.isDucking = false;
                this.player.currentPosIndex = 0;

                if (this.isRightBeingHolded && !this.isLeftBeingHolded && this.player.directionH === DirectionH.LEFT) {
                    this.player.directionH = DirectionH.RIGHT;
                } else if (this.isLeftBeingHolded && !this.isRightBeingHolded && this.player.directionH === DirectionH.RIGHT) {
                    this.player.directionH = DirectionH.LEFT;
                }
            } else if (!this.player.isDucking && this.isBottomBeingHolded && !this.isTopBeingHolded) {
                this.player.isMoving = false;
                this.player.isDucking = true;
            }
        } else {
            this.player.y += (dt * this.player.jumpSpeed);
        }
    }

    checkIfBlocked(mode: string): boolean {
        const map = this.player.game.maps[this.player.game.currentLevel];
        let x = this.roundCoord(this.player.x, 'h');
        let y = (this.roundCoord(this.player.y, 'v') < 0 ? 0 : this.roundCoord(this.player.y, 'v'));
        let blockingBlocks: (string | number)[] = [1, 2];
        if (mode === 'top') {
            y--;
            if (y < 0) {
                return true;
            }
            const blocks = [map[y][x], map[y][x + 1], map[y][x + 2]];
            return blocks[0] === 1 || blocks[1] === 1 || blocks[2] === 1;
        } else if (mode === 'bottom') {
            y += 3;
            if (y > map.length - 1) {
                this.player.game.shouldRunNextFrame = false;
                return true;
            }
            if (this.player.isDuckFalling) {
                blockingBlocks = [1];
            }
            const blocks = [map[y][x], map[y][x + 1], map[y][x + 2]];
            return (blockingBlocks.includes(blocks[0]) || blockingBlocks.includes(blocks[1]) || blockingBlocks.includes(blocks[2]));
        } else if (mode === 'left') {
            x--;
            if (y + 2 > map.length - 1) {
                return true;
            }
            const blocks = [map[y][x], map[y + 1][x], map[y + 2][x]];

            return blocks[0] === 1 || blocks[1] === 1 || blocks[2] === 1;
        } else if (mode === 'right') {
            x += 3;
            if (y + 2 > map.length - 1) {
                return true;
            }
            const blocks = [map[y][x], map[y + 1][x], map[y + 2][x]];
            if ((y === 9 && (x === 469 || x === 470)) || (y === 17 && (x === 377 || x === 378))) {
                return false;
            }
            return blocks[0] === 1 || blocks[1] === 1 || blocks[2] === 1;
        }
    }

    roundCoord(coord: number, mode: string): number {
        if (mode === 'v') {
            if (this.player.directionV === DirectionV.UP) {
                return Math.ceil(coord);
            } else if (this.player.directionV === DirectionV.DOWN) {
                return Math.floor(coord);
            } else {
                return Math.round(coord);
            }
        } else {
            if (this.player.directionH === DirectionH.LEFT) {
                return Math.ceil(coord);
            } else {
                return Math.floor(coord);
            }
        }
    }

    handleGravity() {
        if (this.player.directionV === DirectionV.NONE) {
            let permeableBlocks: (string | number)[] = [0, 'M'];
            if (this.isFireBeingHolded && this.player.isDucking) {
                this.player.isDuckFalling = true;
                this.player.duckFallStartY = this.player.y;
            }
            if (this.player.isDuckFalling) {
                permeableBlocks = [0, 2, 3, 'M'];
            }
            const diffFloor = Math.abs(this.player.y - Math.floor(this.player.y));
            const diffCeil = Math.abs(this.player.y - Math.ceil(this.player.y));
            const x = this.player.movementController.roundCoord(this.player.x, 'h');
            const y = (diffFloor <= diffCeil ? Math.floor(this.player.y) : Math.ceil(this.player.y)) + 3;
            if (y < this.player.game.maps[this.player.game.currentLevel].length - 1) {
                const blocksUnder = [this.player.game.maps[this.player.game.currentLevel][y][x], this.player.game.maps[this.player.game.currentLevel][y][x + 1], this.player.game.maps[this.player.game.currentLevel][y][x + 2]];

                if (permeableBlocks.includes(blocksUnder[0]) && permeableBlocks.includes(blocksUnder[1]) && permeableBlocks.includes(blocksUnder[2])) {
                    this.player.isFlying = true;
                    this.player.directionV = DirectionV.DOWN;
                } else {
                    this.player.isDuckFalling = false;
                    this.player.y = this.roundCoord(this.player.y, 'v');
                }
            }
        }
    }

    handleRamps(): (Ramp | null) {
        if (this.player.x >= 548 && this.player.x <= 554 && this.player.y === 17) {
            return null;
        }
        const ramps = this.player.game.map.ramps;
        const ramp = ramps.find(ramp => (this.player.x >= ramp.x && this.player.x < ramp.x + ramp.width && this.player.y >= ramp.y - 3 && this.player.y < ramp.y + ramp.height));
        return ramp || null;
    }

    checkIfXAtRamp(): boolean {
        const ramps = this.player.game.map.ramps;
        const ramp = ramps.find(ramp => (this.player.x >= ramp.x && this.player.x < ramp.x + ramp.width));
        return (ramp ? true : false);
    }

    checkIfCollides(entity: (Monster | MagicDust | Checkpoint | MonsterStar)) {
        const width = this.player.width / Game.CELL_SIZE;
        const height = this.player.height / Game.CELL_SIZE;
        const entityWidth = entity.width / Game.CELL_SIZE;
        const entityHeight = entity.height / Game.CELL_SIZE;

        return (this.player.x < entity.x + entityWidth && this.player.x + width > entity.x && this.player.y < entity.y + entityHeight && height + this.player.y > entity.y);
    }
}