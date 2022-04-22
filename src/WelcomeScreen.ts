import { Logo } from './Logo';
import { Game } from './Game';

export { WelcomeScreen }

class WelcomeScreen {

    readonly FONT_SIZE: number = 60
    readonly HEIGHT_OFFSET: number = 120
    readonly TEXT_ANIMATION_INTERVAL: number = 1

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
        const logo = new Logo(this.playfield);
        this.playfieldContext = this.playfield.getContext('2d');
        this.handleColorAnimation();
        this.slideTextIn();

        setTimeout(() => {
            document.onkeydown = this.keyPressed.bind(this);
        }, 1000);
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
        if (e.key === 'Enter') {
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
            if (mode === 'game') {
                this.game.start();
            } else {
                this.playIntro();
            }
        }, 1000);
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
    }
}