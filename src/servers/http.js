const path = require('path');
const express = require('express');
const jsonServer = require('json-server');

const app = express();

const router = jsonServer.router(path.join(__dirname, '../db.json'));
const middlewares = jsonServer.defaults();

// JSON SERVER
app.use(middlewares);
app.use(jsonServer.bodyParser);
app.use((req, res, next) => {
  switch (req.method) {
    case 'POST':
      req.body.driver      = "driver-default";
      req.body.ui          = "ui-default";
      req.body.connectedAt = 1532211841747;
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

// PWA
app.use(express.static(path.join(__dirname, 'public')));

app.get('/pwa/ui/*', (req, res) => res.send('UI Hello World!'));
app.get('/pwa/*', (req, res) => res.send('PWA Hello World!'));

module.exports = app;
