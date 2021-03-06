import fetch from 'node-fetch';
import dotenv from 'dotenv';
import IShortenedUrl from '../entity/IShortenedUrl';

dotenv.config();

const sleep = (ms: number) => {
  const timeout = new Promise((resolve) => setTimeout(resolve, ms));
  return timeout;
};

const API = process.env.APP_URL;

test('API is up', async () => {
  const response = await fetch(`${API}`, { method: 'GET' });
  expect(response.status).toEqual(200);
});

test('Swagger definition is being served', async () => {
  const response = await fetch(`${API}/api-docs`, { method: 'GET' });
  expect(response.status).toEqual(200);
});

test('Shortened URL does not exist', async () => {
  const response = await fetch(`${API}/blablabla`, { method: 'GET' });
  expect(response.status).toEqual(404);
});

test('Can create a shortened URL', async () => {
  const body = { url: 'https://www.google.com/' };
  const requestStartTime = new Date();

  const response = await fetch(`${API}/api/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const requestEndTime = new Date();
  expect(response.ok).toEqual(true);

  const shortenedUrl: IShortenedUrl = await response.json();
  shortenedUrl.created = new Date(shortenedUrl.created);
  shortenedUrl.lastAccessed = new Date(shortenedUrl.lastAccessed);

  // Verify the URL ends with the ID
  const urlId = shortenedUrl.short.split('/').slice(-1)[0];
  expect(urlId).toBe(shortenedUrl.id);

  // Verify the original URL matches what we passed in
  expect(shortenedUrl.original).toBe(body.url);

  // Verify the date retruned from the server is within a 10 second buffer of the client's time
  expect(shortenedUrl.created.getTime()).toBeGreaterThan(requestStartTime.getTime() - 5000);
  expect(shortenedUrl.created.getTime()).toBeLessThan(requestEndTime.getTime() + 5000);

  expect(shortenedUrl.lastAccessed.getTime()).toBeGreaterThan(requestStartTime.getTime() - 5000);
  expect(shortenedUrl.lastAccessed.getTime()).toBeLessThan(requestEndTime.getTime() + 5000);

  // Verify accessing the URL gives a 302 to the right URL
  const shortResponse = await fetch(shortenedUrl.short);
  expect(shortResponse.ok).toEqual(true);
  expect(shortResponse.redirected).toBe(true);
  expect(shortResponse.url).toBe(body.url);
});

test('ShortenedUrl.lastAccessedTime is updated on request', async () => {
  const body = { url: 'https://www.google.com/' };

  const response = await fetch(`${API}/api/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const shortenedUrl: IShortenedUrl = await response.json();
  shortenedUrl.created = new Date(shortenedUrl.created);
  shortenedUrl.lastAccessed = new Date(shortenedUrl.lastAccessed);

  // Access the URL
  await sleep(1000);
  await fetch(shortenedUrl.short);
  await sleep(1000);

  // Verify the last accessed time is updated
  const shortResponse = await fetch(`${API}/api/url/${shortenedUrl.id}`);
  const shortResponseUrl: IShortenedUrl = await shortResponse.json();
  shortResponseUrl.created = new Date(shortResponseUrl.created);
  shortResponseUrl.lastAccessed = new Date(shortResponseUrl.lastAccessed);

  expect(shortResponseUrl.created).toEqual(shortenedUrl.created);
  expect(shortResponseUrl.accessCount).toEqual(1);
  expect(shortResponseUrl.lastAccessed.getTime())
    .toBeGreaterThan(shortenedUrl.created.getTime());
});

test('Can delete a URL', async () => {
  const body = { url: 'https://www.google.com/' };

  const response = await fetch(`${API}/api/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  expect(response.ok).toBeTruthy();

  const response2 = await fetch(`${API}/api/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  expect(response.ok).toBeTruthy();

  const shortenedUrl: IShortenedUrl = await response.json();
  const shortenedUrl2: IShortenedUrl = await response2.json();
  const deleteResponse = await fetch(`${API}/api/url/${shortenedUrl.id}`, { method: 'DELETE' });
  expect(deleteResponse.ok).toBeTruthy();

  // Verify we get a 404 for the URL
  const statsResponse = await fetch(`${API}/api/url/${shortenedUrl.id}`);
  expect(statsResponse.status).toBe(404);

  const redirectResponse = await fetch(`${shortenedUrl.short}`);
  expect(redirectResponse.status).toBe(404);

  // Verify the other URL still works
  const statsResponse2 = await fetch(`${API}/api/url/${shortenedUrl2.id}`);
  expect(statsResponse2.ok).toBeTruthy();
});
