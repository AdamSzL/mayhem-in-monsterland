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

    maps: { [key: string]: (string | number)[][] } = maps

    score: number = 0
    totalSeconds: number = 250
    timeLeft: number = 250
    up: number = 3
    magic: number = 10
    stars: number = 0
    startTime: number
    lastTime: number
    fps: number
    jumpHeight: number = 8
    currentLevel: number = 1

    statsPanel: StatsPanel

    playfield: HTMLCanvasElement = document.querySelector('canvas')
    map: Map

    player: Player

    gameLoop: number

    monsters: Monster[] = []
    checkpoints: Checkpoint[] = []
    magicDusts: MagicDust[] = []

    constructor() {
        const welcomeScreen = new WelcomeScreen(this);
        welcomeScreen.show();
        this.loadSprites();
    }

    async loadSprites() {
        const spritesLoader = new SpritesLoader();
        const [map, score, magic, time, up, stars, numbers, player, monsterSprite, monsterAnimationSprite, starsSprite, checkpointInactiveSprite, checkpointActiveSprite, magicDustSprite] = await Promise.all(spritesLoader.load());
        MagicDust.sprite = magicDustSprite;
        MonsterSprites.normalSprite = monsterSprite;
        MonsterSprites.animationSprite = monsterAnimationSprite;
        this.statsPanel = new StatsPanel(this, [score, magic, time, up, stars, numbers]);
        this.map = new Map(this, map);
        this.player = new Player(this, player);
        this.spawnMonsters();
        this.initCheckpoints(checkpointInactiveSprite, checkpointActiveSprite);
    }

    async start() {
        this.clearCanvas();
        this.player.initController();

        this.startTime = Date.now();
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame(now => this.frame(now));
    }

    spawnMonsters() {
        monsters.forEach(monster => {
            if (monster.type === 'standard') {
                const spriteData = monsterSprites.standard;
                if (monster.mode === 'shooting') {
                    this.monsters.push(new StandardShooting(this, monster.x, monster.y, monster.range, monster.speed, monster.mode, monster.points, spriteData));
                } else {
                    this.monsters.push(new Standard(this, monster.x, monster.y, monster.range, monster.speed, monster.mode, monster.points, spriteData));
                }
            } else if (monster.type === 'wasp') {
                const spriteData = monsterSprites.wasp;
                this.monsters.push(new Wasp(this, monster.x, monster.y, monster.range, monster.speed, monster.mode, monster.points, spriteData));
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
            this.render(dt);
            this.gameLoop = requestAnimationFrame(now => this.frame(now));
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

    stopGameLoop() {
        cancelAnimationFrame(this.gameLoop);
    }

    renderCheckpoints() {
        this.checkpoints.forEach(checkpoint => {
            if (true) {
                checkpoint.render();
            }
        });
    }

    handleChekpointReach() {
        this.checkpoints.forEach(checkpoint => {
            if (Math.abs(this.player.x - checkpoint.x) <= 5 && !checkpoint.isActive) {
                if (this.player.checkIfCollides(checkpoint)) {
                    this.makeCheckpointsInactive();
                    checkpoint.isActive = true;
                }
            }
        });
    }

    makeCheckpointsInactive() {
        this.checkpoints.forEach(checkpoint => {
            checkpoint.isActive = false;
        });
    }

    render(dt: number) {
        this.handleChekpointReach();
        this.monsters.forEach(monster => monster.update(dt));
        this.magicDusts.forEach(magicDust => magicDust.update(dt));
        this.checkpoints.forEach(checkpoint => checkpoint.update(dt));
        this.player.update(dt);
        this.map.update(dt);
        this.map.render();
        this.monsters.forEach(monster => monster.render());
        this.renderCheckpoints();
        this.magicDusts.forEach(magicDust => magicDust.render());
        this.player.render();
        this.statsPanel.render();
    }
}