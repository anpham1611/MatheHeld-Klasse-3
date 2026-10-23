import type { IncomingMessage, ServerResponse } from 'node:http';
import { app, initializeServer } from '../src/server/app.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await initializeServer();
  app(req, res);
}
