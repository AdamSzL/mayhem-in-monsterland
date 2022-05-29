import Screen from './Screen';

export default class GameOverScreen extends Screen {
    show() {
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                this.game.shouldRenderGameOverScreen = false;
                this.game.shouldRenderGameScreen = true;
                this.game.gameScreen.showScreen('restart');
            }
        }
        this.render();
    }
}