import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { createConnection, ConnectionOptions } from 'typeorm';
import 'reflect-metadata';

import ShortenedUrl from './entity/ShortenedUrl';
import URLLogEntry from './entity/URLLogEntry';
import URLSequence from './entity/URLSequence';
import {
  rootHandler,
  urlStatsHandler,
  deleteUrlHandler,
  createUrlHandler,
  getShortenedUrl,
} from './handlers';

if (process.env.BASE_URL == null || !/http(s)?:/.test(process.env.BASE_URL)) {
  throw new Error('BASE_URL must be set and have a value of http(s)?://s.d.com');
}
if (process.env.BASE_URL.endsWith('/')) {
  process.env.BASE_URL = process.env.BASE_URL.slice(0, -1);
}

// Ensure dates in the database are stored in UTC
process.env.TZ = 'UTC';

const sleep = (ms: number) => {
  const timeout = new Promise((resolve) => setTimeout(resolve, ms));
  return timeout;
};

const ormConfig: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: (process.env.DB_PORT) ? +process.env.DB_PORT : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  extra: {
    connectionTimeoutMillis: 5000,
  },
  entities: [
    ShortenedUrl,
    URLLogEntry,
    URLSequence,
  ],
};

const connectToDb = async () => {
  try {
    await createConnection(ormConfig);
  } catch (err) {
    throw new Error(err);
  }
};

const run = async (maxRetries: number) => {
  let retryCount = 0;
  console.log('RUNNING');

  while (retryCount < maxRetries) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await connectToDb();
      break;
    } catch (err) {
      console.error(`Error connecting to DB ${err}`);
      retryCount += 1;
      // eslint-disable-next-line no-await-in-loop
      await sleep(2000);
    }
  }

  if (retryCount >= maxRetries) {
    console.error(`Failed to connect to DB after ${retryCount} attempts`);
    process.exit(-1);
  }

  const app = express();
  app.use(express.json());
  const port = process.env.PORT || '8000';

  // Swagger docs
  const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get('/', rootHandler);
  app.get('/:urlId', getShortenedUrl);
  app.post('/url', createUrlHandler);
  app.get('/url/:urlId', urlStatsHandler);
  app.delete('/url/:urlId', deleteUrlHandler);

  app.listen(port, (err) => {
    if (err) {
      console.error(err);
      process.exit(-1);
    }
    console.log(`Server running on ${process.env.BASE_URL}`);
  });
};

const maxRetries = 5;

try {
  run(maxRetries);
} catch (err) {
  throw new Error(err);
}
