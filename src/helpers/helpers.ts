export class NumberFormatter {
    static padWithZeroes(value: number, totalLength: number) {
        const zeroes = new Array(totalLength + 1).join('0');
        return (zeroes + value).slice(-totalLength);
    }
}