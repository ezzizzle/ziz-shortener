import generateUrlId from './generateUrlId';

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
