const idLength = 4;
const urlIdMap = 'abcdefghijklmnopqrstuvwxyz'.split('');
const urlIdRegex = new RegExp('^[a-z]{4}$', 'i');

export const generateUrlId = (numericId: number): string => {
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

export const urlIdToNumber = (urlId: string): number => {
  if (!urlIdRegex.test(urlId)) throw new Error(`urlID must match the format ${urlIdRegex.toString()}`);
  const values = urlId.toLowerCase().split('').map((l) => urlIdMap.indexOf(l));

  return (values[0] * (26 ** 3) + (values[1] * (26 ** 2)) + (values[2] * 26) + values[3]);
};
