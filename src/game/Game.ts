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
import LevelScreen from '../screens/LevelScreen';
import FinishScreen from '../screens/FinishScreen';
import GameScreen from '../screens/GameScreen';
import LoadingScreen from '../screens/LoadingScreen';


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
    static readonly FINISH_BLOCK_START_X: number = 476
    static readonly FINISH_BLOCK_END_X: number = 480
    static readonly FINISH_BLOCK_OFFSET: number = 5

    readonly MAP_OFFSET: number = 17

    mainAudio: HTMLAudioElement = new Audio('audio/main.wav')

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
    shouldRenderFinishScreen: boolean = false
    shouldRenderGameScreen: boolean = false
    canRunTimeOutAnim: boolean = true

    playfield: HTMLCanvasElement = document.querySelector('canvas')

    map: Map

    player: Player

    loadingScreen: LoadingScreen
    levelScreen: LevelScreen
    gameOverScreen: GameOverScreen
    continueScreen: ContinueScreen
    finishScreen: FinishScreen
    gameScreen: GameScreen


    shouldRunNextFrame: boolean = true

    monsters: Monster[] = []
    checkpoints: Checkpoint[] = []
    monsterStars: MonsterStar[] = []

    constructor() {
        const welcomeScreen = new WelcomeScreen(this);
        welcomeScreen.show();
    }

    async loadSprites() {
        const spritesLoader = new SpritesLoader();
        const [map, score, magic, time, up, stars, numbers, player, monsterSprite, monsterAnimationSprite, monsterStarAnimationSprite, starsSprite, starsAnimationSprite, checkpointInactiveSprite, checkpointActiveSprite, magicDustSprite, levelScreen, continueScreen, gameOverScreen, finishScreen, gameScreen, continuesDigits] = await Promise.all(spritesLoader.load());

        MonsterStar.sprite = starsSprite;
        MonsterStar.peakAnimationSprite = starsAnimationSprite;
        MagicDust.sprite = magicDustSprite;
        MonsterSprites.normalSprite = monsterSprite;
        MonsterSprites.animationSprite = monsterAnimationSprite;
        MonsterSprites.starAnimationSprite = monsterStarAnimationSprite;
        this.statsPanel = new StatsPanel(this, [score, magic, time, up, stars, numbers]);
        this.map = new Map(this, map);
        this.player = new Player(this, player);
        this.initScreens(levelScreen, continueScreen, gameOverScreen, finishScreen, gameScreen, continuesDigits, numbers);
        this.spawnMonsters();
        this.initCheckpoints(checkpointInactiveSprite, checkpointActiveSprite);
    }

    showLoadingScreen() {
        const loadingScreenImg = new Image();
        loadingScreenImg.addEventListener('load', () => {
            this.loadingScreen = new LoadingScreen(Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT, loadingScreenImg, this);
            this.loadingScreen.show();
        });
        loadingScreenImg.src = 'public/images/loading-screen-sprite.png';
    }

    start() {
        this.clearCanvas();
        this.resetMonsters();
        this.player.initController();

        this.startTime = Date.now();
        this.lastTime = performance.now();
        if (this.shouldPlayAudio()) {
            this.restartAudio();
        }
        requestAnimationFrame(now => this.frame(now));
    }

    shouldPlayAudio() {
        return !this.shouldRenderContinueScreen && !this.shouldRenderFinishScreen && !this.shouldRenderGameOverScreen && !this.shouldRenderGameScreen && !this.shouldRenderLevelScreen;
    }

    restartAudio() {
        this.mainAudio.currentTime = 0;
        this.mainAudio.loop = true;
        this.mainAudio.play();
    }

    restart() {
        this.score = 0;
        this.magic = 10;
        this.continuesLeft = 3;
        this.triesLeft = 3;
        this.checkpoints.forEach(checkpoint => { checkpoint.isActive = false });
        this.player.spawnAtCheckpoint();
        this.resetMonsters();
        this.enableStarRespawn();
        this.monsters.forEach(monster => monster.hadMagicDustPicked = false);
        this.start();
    }

    initScreens(levelScreen: HTMLImageElement, continueScreen: HTMLImageElement, gameOverScreen: HTMLImageElement, finishScreen: HTMLImageElement, gameScreen: HTMLImageElement, continuesDigits: HTMLImageElement, numbers: HTMLImageElement) {
        this.levelScreen = new LevelScreen(Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT, levelScreen, this);
        this.continueScreen = new ContinueScreen(Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT, continueScreen, this, continuesDigits);
        this.gameOverScreen = new GameOverScreen(Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT, gameOverScreen, this);
        this.finishScreen = new FinishScreen(Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT, finishScreen, this);
        this.gameScreen = new GameScreen(Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT, gameScreen, this, numbers);
    }

    enableStarRespawn() {
        this.monsterStars.forEach(star => star.shouldRespawn = true);
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

        if (this.shouldRenderLevelScreen) {
            this.levelScreen.show();
        } else if (this.shouldRenderContinueScreen) {
            this.continueScreen.continues = this.continuesLeft;
            this.continueScreen.show();
        } else if (this.shouldRenderGameOverScreen) {
            this.gameOverScreen.show();
        } else if (this.shouldRenderFinishScreen) {
            this.finishScreen.show();
        } else if (this.shouldRenderGameScreen) {
            this.gameScreen.showScreen('restart');
        } else {
            this.update(dt);
            this.render();
            requestAnimationFrame(now => this.frame(now));
        }

        if (this.timeLeft <= 0 && this.canRunTimeOutAnim) {
            this.canRunTimeOutAnim = false;
            this.player.runFallAnimation();
        }
    }

    updateFps() {
        const fpsInfo = document.querySelector('.fps-info');
        fpsInfo.innerHTML = this.fps.toString();
    }

    updateTimeLeft() {
        const secondsPassed = Math.floor(((Date.now() - this.startTime) / 1000));
        this.timeLeft = this.totalSeconds - secondsPassed;
        if (this.timeLeft < 0) {
            this.timeLeft = 0;
        }
    }

    handleChekpointReach() {
        this.checkpoints.forEach(checkpoint => {
            if (Math.abs(this.player.x - checkpoint.x) <= 5 && !checkpoint.isActive) {
                if (this.player.movementController.checkIfCollides(checkpoint)) {
                    this.makeCheckpointsInactive();
                    checkpoint.isActive = true;
                    Checkpoint.audio.currentTime = 0;
                    Checkpoint.audio.play();
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
                if (monster.magicDust) {
                    monster.magicDust = null;
                } else {
                    monster.dropsMagicDust = false;
                    if (!monster.hadMagicDustPicked) {
                        monster.randomizeMagicDustDrop(Game.MAGIC_DUST_DROP_CHANCE);
                    }
                }
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

    saveScore() {
        const score = localStorage.getItem('score');
        if (score) {
            if (this.score > parseInt(score)) {
                localStorage.setItem('score', this.score.toString());
            }
        } else {
            localStorage.setItem('score', this.score.toString());
            this.score = 0;
        }
    }

    canDropMagicDust(): boolean {
        return this.magic - this.monsters.filter(monster => monster.magicDust).length > 0;
    }

    updateMagicDusts(dt: number) {
        this.monsters.forEach(monster => {
            if (monster.magicDust) {
                monster.magicDust.update(dt);
            }
        });
    }

    renderMagicDusts() {
        this.monsters.forEach(monster => {
            if (monster.magicDust) {
                monster.magicDust.render();
            }
        });
    }

    resume() {
        this.lastTime = performance.now();
        this.player.spawnAtCheckpoint();
        this.restartAudio();
        this.resetMonsters();
        this.enableStarRespawn();
        this.shouldRenderLevelScreen = false;
        this.shouldRenderGameOverScreen = false;
        this.shouldRenderContinueScreen = false;
        this.shouldRenderFinishScreen = false;
        this.canRunTimeOutAnim = true;
        this.player.movementController.restoreListeners();
        requestAnimationFrame(now => this.frame(now));
    }

    resetMonsters() {
        this.monsters.forEach(monster => monster.reset());
    }

    update(dt: number) {
        this.respawnDeadMonsters();
        this.handleChekpointReach();
        this.monsters.forEach(monster => monster.update(dt));
        this.updateMagicDusts(dt);
        this.checkpoints.forEach(checkpoint => checkpoint.update(dt));
        this.monsterStars.forEach(star => star.update(dt));
        this.player.update(dt);
        this.map.update(dt);
    }

    render() {
        this.map.render();
        this.monsters.forEach(monster => monster.render());
        this.renderCheckpoints();
        this.renderMagicDusts();
        this.monsterStars.forEach(star => star.render());
        this.player.render();
        this.statsPanel.render();
    }
}