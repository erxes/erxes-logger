import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';

// load environment variables
dotenv.config();

import { connect } from './connection';
import { debugInit, debugLogs, debugRequest } from './debuggers';
import Logs from './models/Logs';

connect();

const app = express();

app.use((req: any, _res, next) => {
  req.rawBody = '';

  req.on('data', chunk => {
    req.rawBody += chunk.toString().replace(/\//g, '/');
  });

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// create new log entry
app.post('/logs/create', async (req, res) => {
  debugRequest(debugLogs, req);

  const { createdBy, type, action, oldData, content, objectId, objectName } = req.body;

  try {
    await Logs.createLog({
      createdBy,
      type,
      action,
      oldData,
      content,
      objectId,
      objectName,
      createdAt: new Date(),
    });

    return res.json({ status: 'ok' });
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);
  res.status(500).send(error.message);
});

const { PORT } = process.env;

app.listen(PORT, () => {
  debugInit(`Logger server is running on port ${PORT}`);
});
