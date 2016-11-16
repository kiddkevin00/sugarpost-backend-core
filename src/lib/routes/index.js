/**
 * This is the place for exposing module(s) for route component.
 */

const adminRoute = require('./admin/');
const { Router } = require('express');

function setupRoutes(app) {
  // [TODO]
  app.get('/ping', (req, res) => { res.send('OK'); });
  app.get('/health', (req, res) => {});

  app.use('/api', setupApiRoutes());

  // All not-found API endpoints should return an custom 404 page.
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
    //if (req.session.userId) {
      return next();
    //}
    return res.status(401)
      .send('Unauthenticated');
  };

  router.use('/admin', [authMiddleware], adminRoute);

  return router;
}

module.exports = exports = setupRoutes;
