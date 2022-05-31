import Game from '../game/Game'
import playerSprites from '../../json/playerSprites.json'
import { PlayerMovementController, DirectionH, DirectionV } from './PlayerMovementController';
import Monster from '../monster/Monster';
import MagicDust from '../game/MagicDust';

export interface PlayerSprite {
    x: number,
    y: number
}

export default class Player {
    readonly JUMP_START_SOUND: HTMLAudioElement = new Audio('audio/jump-start.wav')
    readonly JUMP_END_SOUND: HTMLAudioElement = new Audio('audio/jump-end.wav')
    readonly BEING_HIT_SOUND: HTMLAudioElement = new Audio('audio/player-being-hit.wav')
    readonly DEAD_SOUND: HTMLAudioElement = new Audio('audio/player-dead.wav')
    readonly SPRITE_COUNT: number = 8
    readonly SPECIAL_ANIM_SPRITE_COUNT: number = 5
    readonly HIT_ANIM_SPRITE_COUNT: number = 2
    readonly HIT_ANIM_Y: number = 6
    readonly HIT_ANIM_TIME: number = 3000
    readonly FALL_ANIM_HEIGHT: number = 4
    readonly FALL_ANIM_TOP_TIMEOUT: number = 200
    readonly MONSTER_KILLED_JUMP_HEIGHT: number = 3
    readonly BASE_JUMP_HEIGHT: number = 8
    static readonly DEFAULT_X: number = 408
    static readonly DEFAULT_Y: number = 9

    readonly TOP_OFFSET = Game.PLAYER_WIDTH - Game.PLAYER_HEIGHT

    lives: number = 2

    x: number = 408
    y: number = 9

    vx: number = 20
    jumpSpeed: number = 30

    width: number = 96
    height: number = 84

    jumpHeight: number = 8

    shouldRender: boolean = true
    shouldRunFallAnimation: boolean = false
    fallAnimStartY: number
    fallAnimDir: DirectionV = DirectionV.UP
    fallAnimSpeed: number = 30

    sprite: HTMLImageElement
    game: Game

    currentPosIndex: number = 0
    specialAnimIndex: number = 0
    hitAnimIndex: number = 0

    spriteChangeSpeed: number = 20
    hitAnimationSpeed: number = 10

    directionH: DirectionH = DirectionH.RIGHT
    directionV: DirectionV = DirectionV.NONE

    isMoving: boolean = false
    isUsingSpecialSkill: boolean = false
    isFlying: boolean = false
    isDucking: boolean = false
    isDuckFalling: boolean = false
    shouldRunSpecialAnim: boolean = false
    shouldRunHitAnimation: boolean = false
    shouldUpdate: boolean = true

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
        if (this.shouldRunFallAnimation) {
            if (this.y > (Game.PLAYFIELD_HEIGHT / Game.CELL_SIZE)) {
                this.shouldRunFallAnimation = false;
                this.isFlying = false;
                this.handleDeath();
                this.game.mainAudio.pause();
            } else {
                if ((this.y < this.fallAnimStartY - this.FALL_ANIM_HEIGHT || this.y <= 0) && this.fallAnimDir === DirectionV.UP) {
                    this.fallAnimSpeed = 1;
                    setTimeout(() => {
                        this.fallAnimSpeed = 30;
                    }, this.FALL_ANIM_TOP_TIMEOUT);
                    this.fallAnimDir = DirectionV.DOWN;
                }

                if (this.fallAnimDir === DirectionV.UP) {
                    this.y -= (dt * this.fallAnimSpeed);
                } else if (this.fallAnimDir === DirectionV.DOWN) {
                    this.y += (dt * this.fallAnimSpeed);
                }
            }
        } else if (this.shouldUpdate) {
            this.checkForMonsterStarsCollisions();
            this.checkForMonsterCollisions();
            this.checkForMagicDustsCollisions();
            const ramp = this.movementController.handleRamps();
            if (!this.isFlying && ramp) {
                const xOffset = this.x - ramp.x;
                const width = (ramp.type === 'up' ? xOffset : ramp.width - xOffset);
                const height = width / 2;
                const yOffset = ramp.height - height;
                this.y = ramp.y + yOffset - 3;
            } else {
                if (this.shouldGravityWork) {
                    this.movementController.handleGravity();
                }

                if (this.movementController.isLeftBeingHolded && !this.isMoving && !this.movementController.checkIfBlocked('left') && !this.isDucking) {
                    this.isMoving = true;
                } else if (this.movementController.isRightBeingHolded && !this.isMoving && !this.movementController.checkIfBlocked('right') && !this.isDucking) {
                    this.isMoving = true;
                }

                this.handleBlocked();

                if (this.directionV === DirectionV.UP) {
                    this.movementController.handleUpDirection(dt);
                } else if (this.directionV === DirectionV.DOWN) {
                    this.movementController.handleDownDirection(dt);
                }
            }

            this.updateSprite(dt);
        }
    }

    handleDeath() {
        this.game.mainAudio.pause();
        setTimeout(() => {
            if (this.game.triesLeft === 0) {
                if (this.game.continuesLeft === 0) {
                    this.game.shouldRenderGameOverScreen = true;
                    this.game.saveScore();
                } else {
                    this.game.shouldRenderContinueScreen = true;
                    this.game.continueScreen.continues = this.game.continuesLeft;
                    this.game.triesLeft = 0; //3
                }
            } else {
                this.game.shouldRenderLevelScreen = true;
                this.game.triesLeft--;
            }
        }, Game.PLAYER_DEAD_TIMEOUT);
    }

    handleBlocked() {
        if (this.directionH === DirectionH.RIGHT && this.isMoving && this.movementController.checkIfBlocked('right') && !this.movementController.checkIfXAtRamp()) {
            this.x = this.movementController.roundCoord(this.x, 'h');
            this.isMoving = false;
        } else if (this.directionH === DirectionH.LEFT && this.isMoving && this.movementController.checkIfBlocked('left') && !this.movementController.checkIfXAtRamp()) {
            this.x = this.movementController.roundCoord(this.x, 'h');
            this.isMoving = false;
        }
    }

    updateSprite(dt: number) {
        if (this.directionH === DirectionH.RIGHT && this.isMoving) {
            this.currentPosIndex += (dt * this.spriteChangeSpeed);
        } else if (this.directionH === DirectionH.LEFT && this.isMoving) {
            this.currentPosIndex += (dt * this.spriteChangeSpeed);
        }

        if (this.currentPosIndex >= this.SPRITE_COUNT) {
            this.currentPosIndex = 0;
        }

        if (this.shouldRunSpecialAnim) {
            this.specialAnimIndex += (dt * this.spriteChangeSpeed);

            if (this.specialAnimIndex > this.SPECIAL_ANIM_SPRITE_COUNT) {
                this.shouldRunSpecialAnim = false;
                this.specialAnimIndex = 0;
            }
        }

        if (this.shouldRunHitAnimation) {
            this.hitAnimIndex += (dt * this.hitAnimationSpeed);

            if (this.hitAnimIndex > this.HIT_ANIM_SPRITE_COUNT) {
                this.hitAnimIndex = 0;
            }
        }
    }

    spawnAtCheckpoint() {
        this.currentPosIndex = 0;
        this.shouldUpdate = true;
        this.shouldRender = true;
        this.lives = 2;
        this.game.startTime = Date.now();
        //dodać animacje wjazdu (x)
        const checkpoint = this.game.checkpoints.find(checkpoint => checkpoint.isActive);
        if (checkpoint) {
            this.x = checkpoint.x;
            this.y = checkpoint.y;
        } else {
            this.x = Player.DEFAULT_X;
            this.y = Player.DEFAULT_Y;
        }
        this.directionH = DirectionH.RIGHT;
        this.directionV = DirectionV.NONE;
        this.game.map.x = this.x - this.game.MAP_OFFSET;
    }

    runFallAnimation() {
        this.movementController.removeListeners();
        this.movementController.resetHoldedKeys();
        this.fallAnimDir = DirectionV.UP;
        this.shouldRunFallAnimation = true;
        this.shouldUpdate = false;
        this.isFlying = true;
        this.isMoving = false;
        this.fallAnimStartY = this.y;
    }

    handleBeingHit() {
        if (!this.shouldRunHitAnimation) {
            this.lives--;
            if (this.lives === 0) {
                this.DEAD_SOUND.play();
                this.runFallAnimation();
            } else {
                this.BEING_HIT_SOUND.play();
                this.shouldRunHitAnimation = true;
            }
            setTimeout(() => {
                this.shouldRunHitAnimation = false;
            }, this.HIT_ANIM_TIME);
        }
    }

    checkForMonsterCollisions() {
        this.game.monsters.forEach(monster => {
            if (Math.abs(this.x - monster.x) <= 5 && monster.isAlive) {
                if (this.movementController.checkIfCollides(monster)) {
                    if (this.directionV === DirectionV.DOWN && (monster.y - this.y >= 2)) {
                        Monster.DEAD_SOUND.play();
                        this.jumpStartY = this.y;
                        this.isFlying = true;
                        this.directionV = DirectionV.UP;
                        this.jumpHeight = this.MONSTER_KILLED_JUMP_HEIGHT;
                        monster.isAlive = false;
                        monster.magicDustX = monster.x;
                        monster.magicDustY = monster.y;
                        this.game.score += monster.points;
                        monster.isAnimationRunning = true;
                        monster.currentSpriteIndex = 0;
                        if (monster.mode === 'shooting') {
                            this.game.disableMonsterStarRespawn(monster.x, monster.y);
                        }
                    } else {
                        this.handleBeingHit();
                    }
                }
            }
        });
    }

    checkForMagicDustsCollisions() {
        this.game.monsters.forEach(monster => {
            const magicDust = monster.magicDust;
            if (magicDust && this.movementController.checkIfCollides(magicDust)) {
                MagicDust.PICK_SOUND.play();
                this.shouldRunSpecialAnim = true;
                this.game.score += magicDust.POINTS;
                if (this.game.magic > 0) {
                    this.game.magic--;
                }
                monster.magicDust = null;
                monster.hadMagicDustPicked = true;
            }
        })
    }

    checkForMonsterStarsCollisions() {
        this.game.monsterStars.forEach(star => {
            if (this.movementController.checkIfCollides(star) && star.isPresent && !star.isAtPeak) {
                this.handleBeingHit();
            }
        });
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
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
            if (this.shouldRunSpecialAnim) {
                const specialSpriteInd = Math.floor(this.specialAnimIndex);
                ctx.drawImage(this.sprite, x, this.height + specialSpriteInd * this.height, this.width, this.height, destX, destY, this.width, this.height);
            } else if (this.shouldRunHitAnimation && Math.floor(this.hitAnimIndex) === 0) {
                ctx.drawImage(this.sprite, x, this.HIT_ANIM_Y * this.height, this.width, this.height, destX, destY, this.width, this.height);
            } else {
                ctx.drawImage(this.sprite, x, y, this.width, this.height, destX, destY, this.width, this.height);
            }
        }
    }
}