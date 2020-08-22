import { URLStats, urlStatsResponseBuilder } from './urlstats';

test('URLStatsResponseBuilder converts dates to strings', () => {
  const urlStats: URLStats = {
    id: 'bhdfer',
    url: 'https://www.google.com.au',
    shortenedUrl: 'https://l.ziz.cx/bhdfer',
    created: new Date(),
    lastAccessed: new Date(),
    accessCount: 2,
  };
  const urlStatsResponse = urlStatsResponseBuilder(urlStats);
  expect(typeof urlStatsResponse.created).toBe('string');
  expect(typeof urlStatsResponse.lastAccessed).toBe('string');
});

test('URLStatsResponseBuilder converts dates to strings in the right format', () => {
  const urlStats: URLStats = {
    id: 'bhdfer',
    url: 'https://www.google.com.au',
    shortenedUrl: 'https://l.ziz.cx/bhdfer',
    created: new Date('2020-01-01T01:01:01Z'),
    lastAccessed: new Date('2020-12-30T23:59:59Z'),
    accessCount: 2,
  };
  const urlStatsResponse = urlStatsResponseBuilder(urlStats);
  expect(urlStatsResponse.created).toBe('2020-01-01T01:01:01.000Z');
  expect(urlStatsResponse.lastAccessed).toBe('2020-12-30T23:59:59.000Z');
});
