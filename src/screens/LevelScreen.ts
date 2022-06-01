import Screen from './Screen';
import Game from '../game/Game';

export default class LevelScreen extends Screen {
    readonly ANIM_OFFSET: number = 10
    readonly ANIM_INTERVAL: number = 10
    readonly ANIM_SPRITE_COUNT: number = 45
    readonly ANIM_SPRITE_INC: number = 0.5

    readonly AUDIO: HTMLAudioElement = new Audio('audio/level-screen.wav')
    readonly dx: number = 0
    dy: number = Game.PLAYFIELD_HEIGHT
    sx: number = 0
    readonly sy: number = 0

    currentTarget: number = 0
    animTargets: number[] = [0, 200, 0, 100, 0, 60, 0, 30, 0]

    animInterval: number
    currentSpriteIndex: number = 0

    shouldAnimatePos: boolean = true

    constructor(width: number, height: number, sprite: HTMLImageElement, game: Game) {
        super(width, height, sprite, game);
    }

    show() {
        this.AUDIO.currentTime = 0;
        this.AUDIO.play();
        this.startAnimation();
    }

    startAnimation() {
        this.animInterval = window.setInterval(() => {
            if (this.shouldAnimatePos) {
                this.update();
            }
            this.currentSpriteIndex += this.ANIM_SPRITE_INC;
            if (this.currentSpriteIndex > this.ANIM_SPRITE_COUNT - 1) {
                this.currentSpriteIndex = 0;
            }
            const ind = Math.floor(this.currentSpriteIndex);
            this.sx = ind * this.width;
            this.render();
        }, this.ANIM_INTERVAL);
    }

    update() {
        if (this.animTargets[this.currentTarget] < this.dy) {
            this.dy -= this.ANIM_OFFSET;
        } else if (this.animTargets[this.currentTarget] > this.dy) {
            this.dy += this.ANIM_OFFSET;
        } else {
            this.currentTarget++;
            if (this.currentTarget > this.animTargets.length - 1) {
                this.shouldAnimatePos = false;
                this.setDismissible();
            }
        }
    }

    setDismissible() {
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                clearInterval(this.animInterval);
                this.currentSpriteIndex = 0;
                this.currentTarget = 0;
                this.shouldAnimatePos = true;
                this.dy = this.height;
                this.resumeGame();
            }
        }
    }

    resumeGame() {
        this.AUDIO.pause();
        this.AUDIO.currentTime = 0;
        this.game.resume();
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        ctx.drawImage(this.sprite, this.sx, this.sy, this.width, this.height, this.dx, this.dy, this.width, this.height);
    }
}