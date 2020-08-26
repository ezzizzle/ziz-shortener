import { generateUrlId, urlIdToNumber } from './urlIds';

test('generateUrlId throws error with numbers out of range', () => {
  expect(() => {
    generateUrlId(-128);
  }).toThrowError();
  expect(() => {
    generateUrlId(-1);
  }).toThrowError();
  expect(() => {
    generateUrlId(26 ** 4 + 1);
  }).toThrowError();
});

test('URL IDs are generated correctly', () => {
  expect(generateUrlId(0)).toBe('aaaa');
  expect(generateUrlId(1)).toBe('aaab');
  expect(generateUrlId(25)).toBe('aaaz');
  expect(generateUrlId(26)).toBe('aaba');
  expect(generateUrlId(52)).toBe('aaca');
  expect(generateUrlId(100)).toBe('aadw');
  expect(generateUrlId(26 ** 4 - 1)).toBe('zzzz');
});

test('URL IDs can be converted back into numbers', () => {
  expect(urlIdToNumber('aaaa')).toBe(0);
  expect(urlIdToNumber('AAAA')).toBe(0);
  expect(urlIdToNumber('aaab')).toBe(1);
  expect(urlIdToNumber('aaaz')).toBe(25);
  expect(urlIdToNumber('aaba')).toBe(26);
  expect(urlIdToNumber('aaca')).toBe(52);
  expect(urlIdToNumber('aadw')).toBe(100);
  expect(urlIdToNumber('zzzz')).toBe(26 ** 4 - 1);
  expect(urlIdToNumber('ZZZZ')).toBe(26 ** 4 - 1);
});

test('urlIdToNumber throws errors with strings out of range', () => {
  expect(() => {
    urlIdToNumber('aaaaa');
  }).toThrowError();
  expect(() => {
    urlIdToNumber('a');
  }).toThrowError();
  expect(() => {
    urlIdToNumber('');
  }).toThrowError();
});
