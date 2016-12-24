/**
 * This is the place for exposing module(s) for route component.
 */

const adminRoute = require('./auth/');
const subscriberRoute = require('./subscriber/');
const StandardErrorWrapper = require('../utility/standard-error-wrapper');
const constants = require('../constants');
const { Router } = require('express');
const jwt = require('jsonwebtoken');

const jwtSecret = 'my-jwt-secret'; // [TODO]

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
  app.route('/:url(api)*')
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
  const authMiddleware = (req, res, next) => {
    const jwtToken = req.cookies.jwt;

    try {
      const decodedJwt = jwt.verify(jwtToken, jwtSecret, {
        issuer: 'bulletin-board-system.herokuapp.com',
        audience: '.sugarpost.com',
      });

      /* eslint-disable no-param-reassign */
      req.user = {
        _id: decodedJwt._id,
        email: decodedJwt.email,
        type: decodedJwt.type,
        firstName: decodedJwt.firstName,
        lastName: decodedJwt.lastName,
      };
      /* eslint-enable */

      return next();
    } catch (_err) {
      const err = new StandardErrorWrapper([
        {
          code: constants.SYSTEM.ERROR_CODES.UNAUTHENTICATED,
          name: (_err && _err.name) || constants.AUTH.ERROR_NAMES.JWT_INVALID,
          source: constants.SYSTEM.COMMON.CURRENT_SOURCE,
          message: (_err && _err.message) || constants.AUTH.ERROR_MSG.JWT_INVALID,
          detail: _err,
        },
      ]);

      return res.status(401)
        .json(err.format());
    }
  };

  router.use('/auth', adminRoute);
  router.use('/subscriber', [authMiddleware], subscriberRoute);

  return router;
}

module.exports = exports = setupRoutes;
