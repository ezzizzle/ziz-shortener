import fetch from 'node-fetch';
import IShortenedUrl from '../entity/IShortenedUrl';

const API = process.env.APP_URL;

test('API is up', async () => {
  const response = await fetch(`${API}`, { method: 'GET' });
  expect(response.status).toEqual(200);
});

test('Shortened URL does not exist', async () => {
  const response = await fetch(`${API}/blablabla`, { method: 'GET' });
  expect(response.status).toEqual(404);
});

test('Can create URL', async () => {
  const body = { url: 'https://www.google.com/' };
  const now = new Date();

  const response = await fetch(`${API}/url`, { method: 'POST', body: JSON.stringify(body) });
  expect(response.status).toEqual(200);

  const shortenedUrl: IShortenedUrl = await response.json();
  console.log(`${JSON.stringify(shortenedUrl)}`);

  // Verify the URL ends with the ID
  const urlId = shortenedUrl.short.split('/').slice(-1)[0];
  expect(urlId).toBe(shortenedUrl.id);
  // Verify the original URL matches what we passed in
  expect(shortenedUrl.original).toBe(body.url);

  // Verify the created date is close to the current date
  expect(shortenedUrl.created).toBeCloseTo(now.getMilliseconds());
  expect(shortenedUrl.lastAccessed).toBeCloseTo(now.getMilliseconds());

  // Verify accessing the URL gives a 302 to the right URL
  const shortResponse = await fetch(shortenedUrl.short);
  expect(shortResponse.ok).toEqual(true);
  expect(shortResponse.redirected).toBe(true);
  expect(shortResponse.url).toBe(body.url);
});
