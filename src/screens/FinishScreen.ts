import Screen from './Screen';

export default class FinishScreen extends Screen {
    show() {
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                //this.game.resume();
                //zapis wyniku
                //wyswietlenie poczatkowego ekranu z nowym wynikiem
            }
        }
        this.render();
    }
}