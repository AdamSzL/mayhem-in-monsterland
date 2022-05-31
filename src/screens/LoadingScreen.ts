import Screen from './Screen';

export default class LoadingScreen extends Screen {
    readonly ANIM_INTERVAL: number = 300
    readonly SPRITE_COUNT: number = 12
    readonly AFTER_TIMEOUT: number = 500

    sx: number = 0
    sy: number = 0
    dx: number = 0
    dy: number = 0

    spriteAnimation: number

    currentSpriteIndex: number = 0

    show() {
        this.game.loadSprites();
        this.spriteAnimation = window.setInterval(() => {
            this.currentSpriteIndex++;
            this.sx = this.currentSpriteIndex * this.width;
            this.render();
            if (this.currentSpriteIndex == this.SPRITE_COUNT - 1) {
                clearInterval(this.spriteAnimation);
                setTimeout(() => {
                    this.game.gameScreen.showScreen('start');
                }, this.AFTER_TIMEOUT);
            }
        }, this.ANIM_INTERVAL);
        this.render();
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        ctx.drawImage(this.sprite, this.sx, this.sy, this.width, this.height, this.dx, this.dy, this.width, this.height);
    }
}