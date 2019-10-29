import * as debug from 'debug';
import * as dotenv from 'dotenv';

dotenv.config();

const debugPrefix = process.env.DEBUG_PREFIX;

export const debugInit = debug(`${debugPrefix}:init`);
export const debugDb = debug(`${debugPrefix}:db`);
export const debugExternalRequests = debug(`${debugPrefix}:external-requests`);

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);
