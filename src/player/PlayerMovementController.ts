import Player from './Player';

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

    constructor(player: Player) {
        this.player = player;

        document.onkeydown = (e) => this.keyPressed(e);
        document.onkeyup = (e) => this.keyReleased(e);
    }

    keyPressed(e: KeyboardEvent) {
        let { left, right, top } = this.isLeftOrRight(e);
        if (top && this.player.directionV === DirectionV.NONE && !this.isTopBeingHolded && !this.player.isFlying) {
            this.player.directionV = DirectionV.UP;
            this.player.jumpStartY = this.player.y;
            this.player.isFlying = true;
        }
        if (top) {
            this.isTopBeingHolded = true;
        }
        if (left) {
            this.isLeftBeingHolded = true;
        } else if (right) {
            this.isRightBeingHolded = true;
        }
        if (!this.player.isMoving) {
            if (left) {
                this.player.directionH = DirectionH.LEFT;
                this.player.isMoving = true;
                this.player.currentPosIndex = 0;
            } else if (right) {
                this.player.directionH = DirectionH.RIGHT;
                this.player.isMoving = true;
                this.player.currentPosIndex = 0;
            }
        }
    }

    keyReleased(e: KeyboardEvent) {
        let { left, right, top } = this.isLeftOrRight(e);
        if (top) {
            this.isTopBeingHolded = false;
        }
        if (top && this.player.directionV === DirectionV.UP) {
            this.player.directionV = DirectionV.DOWN;
        }
        if (left) {
            this.isLeftBeingHolded = false;
        } else if (right) {
            this.isRightBeingHolded = false;
        }
        if (this.player.isMoving) {
            if (left && this.player.directionH === DirectionH.LEFT) {
                this.player.isMoving = false;
                this.player.currentPosIndex = 0;

                if (this.isRightBeingHolded) {
                    this.player.isMoving = true;
                    this.player.directionH = DirectionH.RIGHT;
                }
            } else if (right && this.player.directionH === DirectionH.RIGHT) {
                this.player.isMoving = false;
                this.player.currentPosIndex = 0;

                if (this.isLeftBeingHolded) {
                    this.player.isMoving = true;
                    this.player.directionH = DirectionH.LEFT;
                }
            }
        }
    }

    isLeftOrRight(e: KeyboardEvent) {
        return {
            left: (e.key === 'a' || e.key === 'ArrowLeft'),
            right: (e.key === 'd' || e.key === 'ArrowRight'),
            top: (e.key === 'w' || e.key === 'ArrowUp')
        }
    }

    checkIfBlocked(mode: string): boolean {
        const map = this.player.game.maps['1'];
        let x = this.roundCoord(this.player.x, 'h');
        let y = (this.roundCoord(this.player.y, 'v') < 0 ? 0 : this.roundCoord(this.player.y, 'v'));
        const blockingBlocks: (string | number)[] = [1, 2];
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
                alert('stopping game loop');
                this.player.game.stopGameLoop();
                return true;
            }
            const blocks = [map[y][x], map[y][x + 1], map[y][x + 2]];
            return (blockingBlocks.includes(blocks[0]) || blockingBlocks.includes(blocks[1]) || blockingBlocks.includes(blocks[2]));
        } else if (mode === 'left') {
            x--;
            const blocks = [map[y][x], map[y + 1][x], map[y + 2][x]];
            return (blocks.filter(block => blockingBlocks.includes(block)).length >= 2);
        } else if (mode === 'right') {
            x += 3;
            const blocks = [map[y][x], map[y + 1][x], map[y + 2][x]];
            return (blocks.filter(block => blockingBlocks.includes(block)).length >= 2);
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