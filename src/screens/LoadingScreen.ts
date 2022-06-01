import Screen from './Screen';

export default class LoadingScreen extends Screen {
    readonly ANIM_INTERVAL: number = 300
    readonly SPRITE_COUNT: number = 12
    readonly AFTER_TIMEOUT: number = 500
    readonly IMG_LOAD_INTERVAL: number = 100

    sx: number = 0
    readonly sy: number = 0
    readonly dx: number = 0
    readonly dy: number = 0

    spriteAnimation: number
    imagesLoadInterval: number

    spritesLoaded: boolean = false

    currentSpriteIndex: number = 0

    async show() {
        this.spriteAnimation = window.setInterval(() => {
            this.currentSpriteIndex++;
            this.sx = this.currentSpriteIndex * this.width;
            this.render();
            if (this.currentSpriteIndex == this.SPRITE_COUNT - 1) {
                clearInterval(this.spriteAnimation);
                setTimeout(() => {
                    this.imagesLoadInterval = window.setInterval(() => {
                        if (this.spritesLoaded) {
                            clearInterval(this.imagesLoadInterval);
                            this.game.gameScreen.showScreen('start');
                        }
                    }, this.IMG_LOAD_INTERVAL);
                }, this.AFTER_TIMEOUT);
            }
        }, this.ANIM_INTERVAL);
        this.render();
        await this.game.loadSprites();
    }

    render() {
        const ctx = this.game.playfield.getContext('2d');
        ctx.drawImage(this.sprite, this.sx, this.sy, this.width, this.height, this.dx, this.dy, this.width, this.height);
    }
}