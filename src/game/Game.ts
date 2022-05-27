import WelcomeScreen from '../intro/WelcomeScreen';
import Map from '../map/Map';
import SpritesLoader from '../sprites/SpritesLoader';
import StatsPanel from './StatsPanel';
import Player from '../player/Player';
import maps from '../../json/maps.json';
import Monster from '../monster/Monster';
import checkpoints from '../../json/checkpoints.json';
import monsters from '../../json/monsters.json';
import monsterSprites from '../../json/monsterSprites.json';
import Checkpoint from '../map/Checkpoint';
import Standard from '../monster/Standard';
import Wasp from '../monster/Wasp';
import StandardShooting from '../monster/StandardShooting';
import MonsterSprites from '../monster/MonsterSprites';
import MagicDust from './MagicDust';
import MonsterStar from '../monster/MonsterStar';
import { DirectionH } from '../player/PlayerMovementController';
import GameOverScreen from '../screens/GameOverScreen';
import ContinueScreen from '../screens/ContinueScreen';
import Screen from '../screens/Screen';
import LevelScreen from '../screens/LevelScreen';


export default class Game {
    static readonly PLAYFIELD_WIDTH: number = 1200
    static readonly PLAYFIELD_HEIGHT: number = 810
    static readonly BLOCK_SIZE: number = 128
    static readonly CELL_SIZE: number = 32
    static readonly BLOCKS_VERT: number = 6
    static readonly BLOCKS_HORZ: number = 240
    static readonly PLAYER_WIDTH: number = 96
    static readonly PLAYER_HEIGHT: number = 84
    static readonly MAX_SPEED: number = 18
    static readonly BASE_SPEED: number = 6
    static readonly SPEED_MULTIPLIER: number = 20
    static readonly MONSTER_KILLED_JUMP_HEIGHT: number = 3
    static readonly BASE_JUMP_HEIGHT: number = 8
    static readonly MAGIC_DUST_DROP_CHANCE: number = 30
    static readonly PLAYER_DEAD_TIMEOUT: number = 1000

    readonly MAP_OFFSET: number = 17

    maps: { [key: string]: (string | number)[][] } = maps

    score: number = 0
    totalSeconds: number = 250
    timeLeft: number = 250
    magic: number = 10
    stars: number = 0
    startTime: number
    lastTime: number
    fps: number
    jumpHeight: number = 8
    currentLevel: number = 1
    continuesLeft: number = 3
    triesLeft: number = 3

    statsPanel: StatsPanel

    shouldRenderLevelScreen: boolean = false
    shouldRenderGameOverScreen: boolean = false
    shouldRenderContinueScreen: boolean = false

    playfield: HTMLCanvasElement = document.querySelector('canvas')

    map: Map

    player: Player

    levelScreen: LevelScreen
    gameOverScreen: GameOverScreen
    continueScreen: ContinueScreen


    shouldRunNextFrame: boolean = true

    monsters: Monster[] = []
    checkpoints: Checkpoint[] = []
    magicDusts: MagicDust[] = []
    monsterStars: MonsterStar[] = []

    constructor() {
        const welcomeScreen = new WelcomeScreen(this);
        welcomeScreen.show();
        this.loadSprites();
    }

    async loadSprites() {
        const spritesLoader = new SpritesLoader();
        const [map, score, magic, time, up, stars, numbers, player, monsterSprite, monsterAnimationSprite, monsterStarAnimationSprite, starsSprite, starsAnimationSprite, checkpointInactiveSprite, checkpointActiveSprite, magicDustSprite, levelScreen, continueScreen, gameOverScreen] = await Promise.all(spritesLoader.load());
        MonsterStar.sprite = starsSprite;
        MonsterStar.peakAnimationSprite = starsAnimationSprite;
        MagicDust.sprite = magicDustSprite;
        MonsterSprites.normalSprite = monsterSprite;
        MonsterSprites.animationSprite = monsterAnimationSprite;
        MonsterSprites.starAnimationSprite = monsterStarAnimationSprite;
        this.statsPanel = new StatsPanel(this, [score, magic, time, up, stars, numbers]);
        this.map = new Map(this, map);
        this.player = new Player(this, player);
        this.initScreens(levelScreen, continueScreen, gameOverScreen);
        this.spawnMonsters();
        this.initCheckpoints(checkpointInactiveSprite, checkpointActiveSprite);
    }

    async start() {
        this.clearCanvas();
        this.player.initController();

        this.startTime = Date.now();
        this.lastTime = performance.now();
        requestAnimationFrame(now => this.frame(now));
    }

    initScreens(levelScreen: HTMLImageElement, continueScreen: HTMLImageElement, gameOverScreen: HTMLImageElement) {
        this.levelScreen = new LevelScreen(Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT, levelScreen, this);
        this.continueScreen = new ContinueScreen(Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT, continueScreen, this);
        this.gameOverScreen = new GameOverScreen(Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT, gameOverScreen, this);
    }

    spawnMonsters() {
        monsters.forEach(monster => {
            if (monster.type === 'standard') {
                const spriteData = monsterSprites.standard;
                if (monster.mode === 'shooting') {
                    const mon = new StandardShooting(this, monster.type, monster.x, monster.y, monster.range, monster.speed, monster.mode, monster.points, monster.animation, spriteData);
                    mon.setShouldTurn(monster.shouldTurn);
                    mon.randomizeMagicDustDrop(Game.MAGIC_DUST_DROP_CHANCE);
                    this.monsters.push(mon);
                    if (monster.x > this.player.x) {
                        this.monsterStars.push(new MonsterStar(monster.x, monster.y, monster.range, monster.speed, DirectionH.LEFT, this));
                    } else {
                        this.monsterStars.push(new MonsterStar(monster.x, monster.y, monster.range, monster.speed, DirectionH.RIGHT, this));
                    }

                } else {
                    const mon = new Standard(this, monster.type, monster.x, monster.y, monster.range, monster.speed, monster.mode, monster.points, monster.animation, spriteData);
                    mon.randomizeMagicDustDrop(Game.MAGIC_DUST_DROP_CHANCE);
                    this.monsters.push(mon);
                }
            } else if (monster.type === 'wasp') {
                const spriteData = monsterSprites.wasp;
                this.monsters.push(new Wasp(this, monster.type, monster.x, monster.y, monster.range, monster.speed, monster.mode, monster.points, monster.animation, spriteData));
            }
        });
    }

    initCheckpoints(inactiveCheckpointSprite: HTMLImageElement, activeCheckpointSprite: HTMLImageElement) {
        Checkpoint.inactiveSprite = inactiveCheckpointSprite;
        Checkpoint.activeSprite = activeCheckpointSprite;
        checkpoints.forEach(checkpoint => {
            this.checkpoints.push(new Checkpoint(this, checkpoint.x, checkpoint.y, checkpoint.width, checkpoint.height));
        });
    }

    clearCanvas() {
        const ctx = this.playfield.getContext('2d');
        ctx.clearRect(0, 0, Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT);
    }

    frame(now: number) {
        this.clearCanvas();
        const dt = Math.abs((now - this.lastTime) / 1000);

        this.fps = Math.round(1 / dt);
        this.updateFps();

        this.lastTime = now;
        this.updateTimeLeft();

        if (this.timeLeft > 0) {
            if (this.shouldRenderLevelScreen) {
                this.levelScreen.show();
            } else if (this.shouldRenderContinueScreen) {
                this.continueScreen.continues = this.continuesLeft;
                this.continueScreen.show();
            } else if (this.shouldRenderGameOverScreen) {
                this.gameOverScreen.show();
            } else {
                this.update(dt);
                this.render();
                requestAnimationFrame(now => this.frame(now));
            }
        } else {
            console.log('lose');
        }
    }

    updateFps() {
        const fpsInfo = document.querySelector('.fps-info');
        fpsInfo.innerHTML = this.fps.toString();
    }

    updateTimeLeft() {
        const secondsPassed = Math.floor(((Date.now() - this.startTime) / 1000));
        this.timeLeft = this.totalSeconds - secondsPassed;
    }

    handleChekpointReach() {
        this.checkpoints.forEach(checkpoint => {
            if (Math.abs(this.player.x - checkpoint.x) <= 5 && !checkpoint.isActive) {
                if (this.player.movementController.checkIfCollides(checkpoint)) {
                    this.makeCheckpointsInactive();
                    checkpoint.isActive = true;
                }
            }
        });
    }

    disableMonsterStarRespawn(x: number, y: number) {
        const star = this.monsterStars.find(star => star.baseX === x && star.baseY === y);
        star.shouldRespawn = false;
    }

    makeCheckpointsInactive() {
        this.checkpoints.forEach(checkpoint => {
            checkpoint.isActive = false;
        });
    }

    renderCheckpoints() {
        this.checkpoints.forEach(checkpoint => {
            checkpoint.render();
        });
    }

    respawnDeadMonsters() {
        this.monsters.forEach(monster => {
            if (!monster.isAlive && (monster.startX + (monster.width / Game.CELL_SIZE) < this.map.x || monster.startX > this.map.x + this.map.destWidth / Game.CELL_SIZE)) {
                monster.x = monster.startX;
                monster.y = monster.startY;
                monster.isAlive = true;
                monster.dropsMagicDust = false;
                monster.randomizeMagicDustDrop(Game.MAGIC_DUST_DROP_CHANCE);
                const star = this.monsterStars.find(star => star.baseX === monster.x && star.baseY === monster.y);
                if (star) {
                    monster.currentSpriteIndex = 1;
                    star.shouldRespawn = true;
                    star.respawn();
                } else {
                    monster.currentSpriteIndex = 0;
                    monster.shouldSpriteIndexIncrease = true;
                }
            }
        });
    }

    resume() {
        this.player.spawnAtCheckpoint();
        this.shouldRenderLevelScreen = false;
        this.shouldRenderGameOverScreen = false;
        this.shouldRenderContinueScreen = false;
        this.player.movementController.restoreListeners();
        requestAnimationFrame(now => this.frame(now));
    }

    update(dt: number) {
        this.respawnDeadMonsters();
        this.handleChekpointReach();
        this.monsters.forEach(monster => monster.update(dt));
        this.magicDusts.forEach(magicDust => magicDust.update(dt));
        this.checkpoints.forEach(checkpoint => checkpoint.update(dt));
        this.monsterStars.forEach(star => star.update(dt));
        this.player.update(dt);
        this.map.update(dt);
    }

    render() {
        this.map.render();
        this.monsters.forEach(monster => monster.render());
        this.renderCheckpoints();
        this.magicDusts.forEach(magicDust => magicDust.render());
        this.monsterStars.forEach(star => star.render());
        this.player.render();
        this.statsPanel.render();
    }
}