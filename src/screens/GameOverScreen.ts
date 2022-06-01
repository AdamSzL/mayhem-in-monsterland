import Screen from './Screen';

export default class GameOverScreen extends Screen {
    readonly AUDIO: HTMLAudioElement = new Audio('audio/continue-game-over-screen.wav')

    show() {
        this.AUDIO.currentTime = 0;
        this.AUDIO.play();
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                this.AUDIO.pause();
                this.game.shouldRenderGameOverScreen = false;
                this.game.shouldRenderGameScreen = true;
                this.game.gameScreen.showScreen('restart');
            }
        }
        this.render();
    }
}