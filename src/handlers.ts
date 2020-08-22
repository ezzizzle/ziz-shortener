import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { URLStats, urlStatsResponseBuilder } from './urlstats';
import ShortenedUrl from './entity/ShortenedUrl';

export const rootHandler = (_req: Request, res: Response): Response => res.send('API is working 👋');

export const getShortenedUrl = async (req: Request, res: Response): Promise<void> => {
  const { params } = req;
  const { urlId } = params;

  const urlRepository = getRepository(ShortenedUrl);

  const shortenedUrl = await urlRepository.findOne(urlId);

  if (shortenedUrl === undefined) {
    res.sendStatus(404);
    return;
  }

  res.redirect(shortenedUrl.original);
};

export const getStatsForUrl = async (urlId: string): Promise<URLStats> => {
  // TODO: Get the stats from the DB
  const urlStats: URLStats = {
    id: urlId,
    url: 'https://www.google.com.au',
    shortenedUrl: 'https://l.ziz.cx/bhdfer',
    created: new Date(),
    lastAccessed: new Date(),
    accessCount: 2,
  };
  return urlStats;
};

export const urlStatsHandler = async (req: Request, res: Response): Promise<void> => {
  const { params } = req;
  const { urlId } = params;
  const urlStats = await getStatsForUrl(urlId);

  const response = urlStatsResponseBuilder(urlStats);

  res.json(response);
};

export const createUrlHandler = async (req: Request, res: Response): Promise<void> => {
  const { body } = req;

  const urlRepository = getRepository(ShortenedUrl);
  // TODO: Create a unique ID
  const newID = 'bla';

  const newUrl = {
    id: newID,
    original: body.url,
    short: `https://l.ziz.cx/${newID}`,
  };

  const shortenedUrl = await urlRepository.save(newUrl);
  const results = await getRepository(ShortenedUrl).save(shortenedUrl);

  res.json(results);
};

export const deleteUrlHandler = async (req: Request, res: Response): Promise<void> => {
  const { params } = req;
  const { urlId } = params;

  // TODO: Delete URL from DB

  res.sendStatus(200);
};
