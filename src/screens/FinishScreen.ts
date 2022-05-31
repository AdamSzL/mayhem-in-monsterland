import Screen from './Screen';

export default class FinishScreen extends Screen {
    show() {
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                this.game.shouldRenderFinishScreen = false;
                this.game.shouldRenderGameScreen = true;
                this.game.gameScreen.showScreen('restart');
            }
        }
        this.render();
    }
}