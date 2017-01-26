/**
 * This is the place for exposing module(s) for route component.
 */

const authRoute = require('./auth/');
const subscriberRoute = require('./subscriber/');
const authCheckMiddleware = require('../utility/auth-check-middleware');
const { Router } = require('express');

function setupRoutes(app) {
  // [TODO]
  app.get('/ping', (req, res) => res.json({
    uptime: 123,
    hostname: 'host 1',
  }));
  app.get('/health', (req, res) => res.json({
    version: 0,
    self: {
      name: 'bulletin-board-system-backend',
      version: 1,
      status: 200,
      dateStamp: new Date().toString(),
      hostname: 'host 1',
    },
    dependencies: {
      http: [],
    },
  }));

  app.use('/api', setupApiRoutes());

  // All not-found API endpoints should return a custom 404 page.
  app.route('/:url(api)/*')
    .get((req, res) => res.render('404', (err) => {
      if (err) {
        return res.status(404)
          .json(err);
      }
      return res.status(404)
        .render('404');
    }));

  return app;
}

function setupApiRoutes() {
  const router = Router();

  router.use('/auth', authRoute);
  router.use('/subscriber', [authCheckMiddleware], subscriberRoute);

  return router;
}

module.exports = exports = setupRoutes;
