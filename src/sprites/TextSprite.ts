import IRenderable from './IRenderable';

export default class TextSprite implements IRenderable {
    static readonly MAGIC_SPRITE_COUNT: number = 10
    static readonly MAGIC_OFFSET: number = 2

    name: string

    destX: number
    destY: number

    destWidth: number
    destHeight: number

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
        ctx.drawImage(this.sprite, 0, 0, this.destWidth, this.destHeight, this.destX, this.destY, this.destWidth, this.destHeight);
    }
}