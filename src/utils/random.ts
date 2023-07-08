export const getRandomFromArray = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};

export const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * max + 1 - min) + min;