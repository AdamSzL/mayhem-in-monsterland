import Screen from './Screen';

export default class ContinueScreen extends Screen {
    continues: number = 3

    show() {
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || (e.location === 3 && e.key === '0')) {
                console.log('enter');
                this.game.resume();
            }
        }
        this.render();
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
    }
}