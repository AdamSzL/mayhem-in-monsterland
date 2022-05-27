import Screen from './Screen';

export default class GameOverScreen extends Screen {
    show() {
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                console.log('enter game over screen');
            }
        }
        this.render();
    }
}