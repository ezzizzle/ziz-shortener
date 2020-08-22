import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { createConnection, ConnectionOptions } from 'typeorm';
import 'reflect-metadata';

import ShortenedUrl from './entity/ShortenedUrl';
import URLLogEntry from './entity/URLLogEntry';
import {
  rootHandler,
  urlStatsHandler,
  deleteUrlHandler,
  createUrlHandler,
  getShortenedUrl,
} from './handlers';

const ormConfig: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: (process.env.DB_PORT) ? +process.env.DB_PORT : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    ShortenedUrl,
    URLLogEntry,
  ],
};

createConnection(ormConfig).then((connection) => {
  const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yml'));

  const app = express();
  app.use(express.json());
  const port = process.env.PORT || '8000';

  app.get('/', rootHandler);
  app.get('/:urlId', getShortenedUrl);
  app.post('/url', createUrlHandler);
  app.get('/url/:urlId', urlStatsHandler);
  app.delete('/url/:urlId', deleteUrlHandler);

  // Swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.listen(port, (err) => {
    if (err) return console.error(err);
    return console.log(`Server is listening on ${port}`);
  });
});
