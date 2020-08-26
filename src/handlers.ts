import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { URLStats, urlStatsResponseBuilder } from './urlstats';
import ShortenedUrl from './entity/ShortenedUrl';
import URLSequence from './entity/URLSequence';
import { generateUrlId, urlIdToNumber } from './urlIds';

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

  // TODO: Create a unique ID
  const urlSequence = await getRepository(URLSequence).save({});
  const newID = generateUrlId(urlSequence.id);

  const newUrl = {
    id: newID,
    original: body.url,
    short: `${process.env.BASE_URL}/${newID}`,
  };

  const shortenedUrl = await getRepository(ShortenedUrl).save(newUrl);
  res.json(shortenedUrl);
};

export const deleteUrlHandler = async (req: Request, res: Response): Promise<void> => {
  const { params } = req;
  const { urlId } = params;

  // TODO: Delete URL from DB

  res.sendStatus(200);
};
