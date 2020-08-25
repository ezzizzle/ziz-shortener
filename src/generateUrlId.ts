const idLength = 4;
const urlIdMap = 'abcdefghijklmnopqrstuvwxyz'.split('');

const generateUrlId = (numericId: number): string => {
  if (numericId < 0 || numericId > (26 ** idLength)) {
    throw new Error('Number must be between 1 and 26^4 inclusive');
  }

  const digits: number[] = [];
  let currentNumber = numericId;
  do {
    digits.push(currentNumber % urlIdMap.length);
    currentNumber = Math.floor(currentNumber / urlIdMap.length);
  } while (currentNumber > 0);

  const chars = digits.reverse().map((digit) => urlIdMap[digit]);
  return chars.join('').padStart(idLength, 'a');
};

export default generateUrlId;
