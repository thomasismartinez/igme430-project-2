require('dotenv').config();

const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const router = require('./router.js');

const socketSetup = require('./io.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// connect mongoose
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/IGME430Project2';
mongoose.connect(dbURI).catch((err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// connect redis
const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});

redisClient.on('error', (err) => console.log('Redic Client Error', err));

redisClient.connect().then(() => {
  const app = express();

  app.use(helmet());
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(session({
    key: 'sessionid',
    // store redis info
    store: new RedisStore({
      client: redisClient,
    }),
    // hashing seed
    secret: 'Club Penguin',
    // only send to database if data changes
    resave: false,
    // wont save uninitialized sessions
    saveUninitialized: false,
  }));

  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  router(app);

  const server = socketSetup(app); // for socket.io

  // app.listen(port, (err) => {
  server.listen(port, (err) => {
    if (err) { throw err; }
    console.log(`Listening on port ${port}`);
  });
});

// socket.io code from https://subscription.packtpub.com/book/data/9781785880865/1/ch01lvl1sec11/creating-an-express-server-with-socket-io
