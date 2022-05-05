import Player from './Player';
import Game from '../game/Game';

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
        if (!this.player.isMoving && !this.player.isDucking) {
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
        if (this.player.isMoving && !this.player.isDucking) {
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

    checkIfBlocked(mode: string): boolean {
        const map = this.player.game.maps['1'];
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
                this.player.game.stopGameLoop();
                return true;
            }
            if (this.player.isDuckFalling) {
                blockingBlocks = [1];
            }
            const blocks = [map[y][x], map[y][x + 1], map[y][x + 2]];
            return (blockingBlocks.includes(blocks[0]) || blockingBlocks.includes(blocks[1]) || blockingBlocks.includes(blocks[2]));
        } else if (mode === 'left') {
            x--;
            const blocks = [map[y][x], map[y + 1][x], map[y + 2][x]];
            //console.log((blocks.filter(block => bbb.includes(block)).length >= 1))
            return blocks[0] === 1 || blocks[1] === 1 || blocks[2] === 1;
        } else if (mode === 'right') {
            x += 3;
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
}