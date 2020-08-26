import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import ShortenedUrl from './entity/ShortenedUrl';
import URLSequence from './entity/URLSequence';
import { generateUrlId } from './urlIds';

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

export const urlStatsHandler = async (req: Request, res: Response): Promise<void> => {
  const { params } = req;
  const { urlId } = params;

  const dbResponse = await getRepository(ShortenedUrl).findOne(urlId);
  if (dbResponse === undefined) {
    res.status(404).json({ error: `No URL for ID: ${urlId}` });
    return;
  }

  res.json(dbResponse);
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

  try {
    await getRepository(ShortenedUrl)
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: urlId })
      .execute();
    res.sendStatus(200);
  } catch (err) {
    res.status(404).json({ error: err });
  }
};
