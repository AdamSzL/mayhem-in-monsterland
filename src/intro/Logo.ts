export default class Logo {

    readonly WIDTH: number = 284
    readonly HEIGHT: number = 177
    readonly MARGIN_HORIZONTAL: number = 175
    readonly MARGIN_TOP: number = 100
    readonly DEST_WIDTH: number = 850
    readonly DEST_HEIGHT: number = 443
    readonly SOURCE: string = 'public/images/logo.png'

    constructor(playfield: HTMLCanvasElement) {
        this.draw(playfield);
    }

    draw(playfield: HTMLCanvasElement) {
        const ctx = playfield.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, this.WIDTH, this.HEIGHT, this.MARGIN_HORIZONTAL, this.MARGIN_TOP, this.DEST_WIDTH, this.DEST_HEIGHT);
        }
        img.src = this.SOURCE;
    }
}