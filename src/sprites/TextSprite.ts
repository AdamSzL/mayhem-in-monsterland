export default class TextSprite {
    static readonly MAGIC_SPRITE_COUNT: number = 10
    static readonly MAGIC_OFFSET: number = 2

    name: string

    destX: number
    destY: number

    destWidth: number
    destHeight: number

    textSpriteIndex: number = 0

    spriteIndex: number = 0
    spriteChangeSpeed: number = 10

    sprite: HTMLImageElement

    playfield: HTMLCanvasElement = document.querySelector('canvas')

    constructor(name: string, destX: number, destY: number, destWidth: number, destHeight: number, sprite: HTMLImageElement) {
        this.name = name;
        this.destX = destX;
        this.destY = destY;
        this.destWidth = destWidth;
        this.destHeight = destHeight;
        this.sprite = sprite;
    }

    render() {
        const ctx = this.playfield.getContext('2d');
        ctx.drawImage(this.sprite, 0, this.spriteIndex * this.destHeight, this.destWidth, this.destHeight, this.destX, this.destY, this.destWidth, this.destHeight);
    }
}