import type { IncomingMessage, ServerResponse } from 'node:http';
import { app, initializeServer } from './app.js';

export default async function vercelHandler(req: IncomingMessage, res: ServerResponse) {
  await initializeServer();
  app(req, res);
}
