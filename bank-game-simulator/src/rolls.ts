function getRandomNumber(high: number, low: number = 0): number {
    return Math.random() * (high - low) + low
}

export const rollDie = () => getRandomNumber(1, 6);
