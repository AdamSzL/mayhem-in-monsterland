export default interface IRenderable {
    destX: number,
    destY: number,
    destWidth: number,
    destHeight: number,

    sprite: HTMLImageElement,

    render: () => void,
}   