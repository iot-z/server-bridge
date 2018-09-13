const path        = require('path');
const express     = require('express');
const jsonServer  = require('json-server');

const app         = express();

const router      = jsonServer.router(path.join(__dirname, '../db.json'));
const middlewares = jsonServer.defaults();

// JSON SERVER
app.use(middlewares);
app.use(jsonServer.bodyParser);
app.use((req, res, next) => {
  switch (req.method) {
    case 'POST':
      req.body.driver      = '@iotz/driver-default';
      req.body.ui          = '@iotz/ui-default';
      req.body.connectedAt = Date.now();
      req.body.status      = 1;
      req.body.createdAt   = Date.now();
      req.body.updatedAt   = null;
      break;
    case 'PUT':
      req.body.updatedAt = Date.now();
      break;
  }

  next();
});

app.use('/api', router);

module.exports = app;
