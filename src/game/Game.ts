import WelcomeScreen from '../intro/WelcomeScreen';
import Map from '../sprites/Map';
import SpritesLoader from '../sprites/SpritesLoader';
import StatsPanel from './StatsPanel';
import Player from '../player/Player';
import maps from '../../json/maps.json';

export default class Game {

    static readonly PLAYFIELD_WIDTH: number = 1200
    static readonly PLAYFIELD_HEIGHT: number = 800
    static readonly BLOCK_SIZE: number = 128
    static readonly CELL_SIZE: number = 32
    static readonly BLOCKS_VERT: number = 6
    static readonly BLOCKS_HORZ: number = 240
    static readonly PLAYER_WIDTH: number = 96
    static readonly PLAYER_HEIGHT: number = 84
    static readonly JUMP_HEIGHT: number = 8

    maps: { [key: string]: (string | number)[][] } = maps

    score: number = 0
    totalSeconds: number = 250
    timeLeft: number
    up: number = 3
    magic: number = 0
    stars: number = 0
    startTime: number
    lastTime: number
    fps: number

    statsPanel: StatsPanel

    playfield: HTMLCanvasElement = document.querySelector('canvas')
    map: Map

    player: Player

    gameLoop: number

    constructor() {
        const welcomeScreen = new WelcomeScreen(this);
        welcomeScreen.show();
    }

    async start() {
        this.clearCanvas();
        const spritesLoader = new SpritesLoader();
        const [map, score, magic, time, up, stars, numbers, player] = await Promise.all(spritesLoader.load());
        this.statsPanel = new StatsPanel(this, [score, magic, time, up, stars, numbers]);

        this.map = new Map(this, map);
        this.player = new Player(this, player);

        this.startTime = Date.now();
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame(now => this.frame(now));
    }

    clearCanvas() {
        const ctx = this.playfield.getContext('2d');
        ctx.clearRect(0, 0, Game.PLAYFIELD_WIDTH, Game.PLAYFIELD_HEIGHT);
    }

    frame(now: number) {
        this.clearCanvas();
        const dt = Math.abs((now - this.lastTime) / 1000);

        this.fps = Math.round(1 / dt);

        this.render(dt);
        this.lastTime = now;

        this.gameLoop = requestAnimationFrame(now => this.frame(now));
    }

    stopGameLoop() {
        cancelAnimationFrame(this.gameLoop);
    }

    render(dt: number) {
        const secondsPassed = Math.floor(((Date.now() - this.startTime) / 1000));
        this.timeLeft = this.totalSeconds - secondsPassed;
        //this.map.x += this.map.vx * dt;
        //this.player.x += this.player.vx * dt;
        if (this.timeLeft > 0) {
            this.player.update(dt);
            this.map.update(dt);
            this.map.render();
            this.player.render();
            this.statsPanel.render();
        } else {
            alert('lose');
        }
    }
}