import Logo from './Logo';
import Game from '../game/Game';

export default class WelcomeScreen {
    readonly AUDIO: HTMLAudioElement = new Audio('audio/welcome-screen.wav')
    readonly FONT_SIZE: number = 60
    readonly HEIGHT_OFFSET: number = 120
    readonly TEXT_ANIMATION_INTERVAL: number = 1
    readonly ANIM_DURATION: number = 1000

    gameText: HTMLImageElement = document.querySelector('.game')
    introText: HTMLImageElement = document.querySelector('.intro')

    game: Game
    playfield: HTMLCanvasElement
    playfieldContext: CanvasRenderingContext2D
    selectedOption: string = 'game'
    colorHueDeg: number = 0
    textAnimationInterval: number

    constructor(game: Game) {
        this.game = game;
        this.playfield = game.playfield;
    }

    show() {
        this.insertPlayButton();
        const logo = new Logo(this.playfield);
        this.playfieldContext = this.playfield.getContext('2d');
        this.handleColorAnimation();
        this.slideTextIn();

        setTimeout(() => {
            document.onkeydown = (e) => this.keyPressed(e);
        }, this.ANIM_DURATION);
    }

    insertPlayButton() {
        const btn = document.createElement('button');
        btn.classList.add('play-button');
        btn.innerText = 'PLAY AUDIO';
        btn.addEventListener('click', () => {
            this.AUDIO.currentTime = 0;
            this.AUDIO.play();
        });
        const main = document.querySelector('.main');
        main.appendChild(btn);
    }

    handleColorAnimation() {
        this.textAnimationInterval = window.setInterval(() => {
            if (this.selectedOption === 'game') {
                this.gameText.style.filter = `hue-rotate(${this.colorHueDeg}deg) brightness(.8)`;
            } else {
                this.introText.style.filter = `hue-rotate(${this.colorHueDeg}deg) brightness(.8)`;
            }

            this.colorHueDeg += 1;

            if (this.colorHueDeg === 360) {
                this.colorHueDeg = 0;
            }
        }, this.TEXT_ANIMATION_INTERVAL);
    }

    keyPressed(e: KeyboardEvent) {
        if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
            this.animateTextOut(this.selectedOption);
        } else if (this.selectedOption === 'game' && (e.key.toLowerCase() === 'd' || e.key === 'ArrowRight')) {
            this.gameText.style.filter = 'grayscale(1) opacity(.5)';
            this.selectedOption = 'intro';
        } else if (this.selectedOption === 'intro' && (e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft')) {
            this.introText.style.filter = 'grayscale(1) opacity(.5)';
            this.selectedOption = 'game';
        }
    }

    slideTextIn() {
        setTimeout(() => {
            this.gameText.classList.add('slideIn');
            this.introText.classList.add('slideIn');
        }, 10)
    }

    animateTextOut(mode: string) {
        document.onkeydown = () => false;
        this.gameText.classList.add('slideOut');
        this.introText.classList.add('slideOut');
        setTimeout(() => {
            this.gameText.remove();
            this.introText.remove();
            this.AUDIO.pause();
            document.querySelector('.play-button').remove();
            if (mode === 'game') {
                this.game.showLoadingScreen();
            } else {
                this.playIntro();
            }
        }, this.ANIM_DURATION);
    }

    playIntro() {
        this.playfield.style.display = 'none';
        const intro: HTMLVideoElement = document.querySelector('video');
        intro.style.display = 'block';
        intro.play();
        intro.addEventListener('ended', () => this.introEnded(intro));
    }

    introEnded(intro: HTMLVideoElement) {
        intro.style.display = 'none';
        this.playfield.style.display = 'block';
        this.game.showLoadingScreen();
    }
}