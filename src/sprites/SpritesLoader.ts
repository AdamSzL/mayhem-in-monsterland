export default class SpritesLoader {
    load(): Promise<HTMLImageElement>[] {
        const sources = ['public/maps/1.png', 'public/images/score.png', 'public/images/magic.png', 'public/images/time.png', 'public/images/1up.png', 'public/images/stars.png', 'public/images/numbers.png', 'public/images/mayhem-sprite.png', 'public/images/monsters-sprite.png', 'public/images/monster-animation-sprite.png',
            'public/images/monster-star-animation-sprite.png', 'public/images/monster-stars.png', 'public/images/star-animation-sprite.png', 'public/images/checkpoint.png', 'public/images/active-checkpoint-sprite.png', 'public/images/magic-dust-sprite.png', 'public/images/level-screen-sprite.png', 'public/images/continue-screen.png', 'public/images/first-level-game-over-screen.png', 'public/images/first-level-finish-screen.png', 'public/images/game-screen.png', 'public/images/continues-digits.png'];
        let promises: Promise<HTMLImageElement>[] = []

        sources.forEach(source => {
            promises.push(new Promise(resolve => {
                const img = new Image();
                img.addEventListener('load', () => {
                    resolve(img);
                });
                img.src = source;
            }));
        });

        return promises;
    }
}