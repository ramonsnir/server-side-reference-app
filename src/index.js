const express = require('express');
const hbs = require('hbs');
const session = require('express-session');
const uuidv4 = require('uuid/v4');
const DYAPI = require('./DYAPI');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET || 'devsecret',
}));

const SESSION_MAX_INACTIVITY_LENGTH = 1000 * 60 * 30; // 30 minutes
const SESSION_MAX_LENGTH = 1000 * 60 * 60 * 24; // 1 day

app.get('/healthcheck', (_req, res) => {
  res.sendStatus(200);
});

// generate sessionID and userID either doesn't exist
app.use((req, _res, next) => {
  if (!req.session.dyUserId) {
    req.session.dyUserId = uuidv4();
  }
  if (!req.session.dySessionId
      || req.session.dySessionEnd < Date.now()
      || req.session.dySessionStart + SESSION_MAX_LENGTH < Date.now()) {
    req.session.dySessionId = uuidv4();
    req.session.dySessionStart = Date.now();
  }
  req.session.dySessionEnd = Date.now() + SESSION_MAX_INACTIVITY_LENGTH;
  next();
});

// build some page context
app.use((req, _res, next) => {
  req.dyContext = {
    page: {
      location: `${req.protocol}://${req.hostname}${req.originalUrl}`,
      referrer: req.headers.referer || '',
    },
    device: {
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip,
    },
  };
  next();
});

app.get('/', async (req, res) => {
  req.dyContext.page.type = 'HOMEPAGE';
  req.dyContext.page.data = [];

  const [dyJwt, dyDecisions] = await Promise.all([
    DYAPI.generateJwt(req.session.dyUserId),
    DYAPI.choose(
      req.session.dyUserId,
      req.session.dySessionId,
      req.dyContext,
      [
        'homepage-banner',
        'homepage-recs',
      ],
    ),
  ]);
  res.render('index.html', {
    dyJwt,
    dyUserId: req.session.dyUserId,
    dySessionId: req.session.dySessionId,
    homepageBanner: dyDecisions['homepage-banner'],
    homepageRecs: dyDecisions['homepage-recs'],
  });
});

app.listen(process.env.APPLICATION_PORT || 3000);
