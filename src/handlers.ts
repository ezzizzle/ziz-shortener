import { Request, Response } from 'express';

import ShortenedUrl from './entity/ShortenedUrl';
import { URLNotFoundException } from './entity/Errors';

const bearerRegex = new RegExp('^Bearer (.*)');

export const rootHandler = (_req: Request, res: Response): Response => res.send('API is working 👋');

export const getShortenedUrl = async (req: Request, res: Response): Promise<void> => {
  const { params } = req;
  const { urlId } = params;

  let shortenedUrl: ShortenedUrl;
  try {
    shortenedUrl = await ShortenedUrl.getForId(urlId);
  } catch (err) {
    if (err instanceof URLNotFoundException) {
      res.status(404).json({ error: `No record for ID: ${urlId}` });
      return;
    }
    res.status(500).json({ error: 'Could not get record from DB' });
    return;
  }

  res.redirect(shortenedUrl.original);
  shortenedUrl.accessCount += 1;
  shortenedUrl.save();
};

export const urlStatsHandler = async (req: Request, res: Response): Promise<void> => {
  const { params } = req;
  const { urlId } = params;

  let shortenedUrl: ShortenedUrl;
  try {
    shortenedUrl = await ShortenedUrl.getForId(urlId);
  } catch (err) {
    if (err instanceof URLNotFoundException) {
      res.status(404).json({ error: `No record for ID: ${urlId}` });
      return;
    }
    res.status(500).json({ error: 'Could not get record from DB' });
    return;
  }

  res.json(shortenedUrl);
};

export const createUrlHandler = async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const { url } = body;

  try {
    const shortenedUrl = await ShortenedUrl.create(url);
    res.json({ ...shortenedUrl });
  } catch (err) {
    res.status(500).json({ error: 'Could not save URL' });
  }
};

export const deleteUrlHandler = async (req: Request, res: Response): Promise<void> => {
  const { params } = req;
  const { urlId } = params;

  try {
    await ShortenedUrl.delete(urlId);
    res.sendStatus(200);
  } catch (err) {
    res.status(404).json({ error: err });
  }
};

export const tokenHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.headers.authorization) {
    res.status(404).json({ error: 'No token found' });
    return;
  }

  const headerComponents = req.headers.authorization.match(bearerRegex);

  if (headerComponents === null) {
    res.status(404).json({ error: 'Could not get token from Authorization header' });
    return;
  }

  try {
    const token = headerComponents[1];
    res.json({ token });
  } catch {
    res.status(404).json({ error: 'Could not goet token from Authorization header' });
  }
};
