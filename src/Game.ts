export { Game }
import { WelcomeScreen } from './WelcomeScreen';

class Game {

    public static PLAYFIELD_WIDTH: number = 1050
    public static PLAYFIELD_HEIGHT: number = 768

    playfield: HTMLCanvasElement = document.querySelector('canvas')


    constructor() {
        const welcomeScreen = new WelcomeScreen(this);
        welcomeScreen.show();
    }

    start() {
        console.log('game starts');
    }
}