/**
 * This is the place for exposing module(s) for route component.
 */

const authRoutes = require('./auth/');
const referralRoutes = require('./referral/');
const userRoutes = require('./user/');
const paymentRoutes = require('./payment/');
const subscriptionRoutes = require('./subscription/');
const authCheckMiddleware = require('../utility/auth-check-middleware');
const constants = require('../constants/');
const packageJson = require('../../../package.json');
const errorHandler = require('errorhandler');
const { Router } = require('express');

const serverStartTimestamp = new Date();
const containerId = process.env.HOSTNAME;

function setupRoutes(app) {
  app.get('/ping', (req, res) => res.json({
    uptimeInSec: ((new Date()).getTime() - serverStartTimestamp.getTime()) / 1000,
    hostname: containerId || 'N/A',
  }));
  app.get('/health', (req, res) => res.json({
    version: packageJson.version,
    self: {
      name: packageJson.name,
      version: packageJson.version,
      status: constants.SYSTEM.HTTP_STATUS_CODES.OK,
      serverDateStamp: (new Date()).toString(),
      hostname: containerId,
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

  if (app.get('env') !== 'production') {
    app.use(errorHandler()); // Error handler - has to be the last
  }
}

function setupApiRoutes() {
  const router = Router();

  router.use('/auth', authRoutes);
  router.use('/user', [authCheckMiddleware], userRoutes);
  router.use('/payment', [authCheckMiddleware], paymentRoutes);
  router.use('/subscription', [authCheckMiddleware], subscriptionRoutes);
  router.use('/referral', [authCheckMiddleware], referralRoutes);

  return router;
}

module.exports = exports = setupRoutes;
