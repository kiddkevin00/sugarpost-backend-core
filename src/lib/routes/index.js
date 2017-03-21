/**
 * This is the place for exposing module(s) for route component.
 */

const authRoutes = require('./auth/');
const subscriberRoutes = require('./subscriber/');
const userRoutes = require('./user/');
const paymentRoutes = require('./payment/');
const authCheckMiddleware = require('../utility/auth-check-middleware');
const constants = require('../constants/');
const { Router } = require('express');

function setupRoutes(app) {
  // [TODO]
  app.get('/ping', (req, res) => res.json({
    uptime: 100,
    hostname: 'host 1',
  }));
  app.get('/health', (req, res) => res.json({
    version: 0,
    self: {
      name: 'bulletin-board-system-backend',
      version: 1,
      status: 200,
      dateStamp: (new Date()).toString(),
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
        return res.status(constants.SYSTEM.HTTP_STATUS_CODES.NOT_FOUND)
          .json(err);
      }
      return res.status(constants.SYSTEM.HTTP_STATUS_CODES.NOT_FOUND)
        .render('404');
    }));

  return app;
}

function setupApiRoutes() {
  const router = Router();

  router.use('/auth', authRoutes);
  router.use('/subscriber', [authCheckMiddleware], subscriberRoutes);
  router.use('/user', [authCheckMiddleware], userRoutes);
  router.use('/payment', [authCheckMiddleware], paymentRoutes);

  return router;
}

module.exports = exports = setupRoutes;
