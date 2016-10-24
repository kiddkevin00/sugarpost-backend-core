/*
 * This is the place for exposing module(s) for route component.
 */

const adminRoute = require('./admin/');

function setupRoutes(app) {

  // [TODO]
  app.get('/ping', (req, res) => { res.send('OK'); });
  app.get('/health', (req, res) => {});

  const authMiddleware = (req, res, next) => {
    if (req.session.userId) {
      return next();
    } else {
      return res.status(401).send('Unauthenticated');
    }
  };

  app.use('/admin', authMiddleware, adminRoute);

  // All not-found API endpoints should return an custom 404 page.
  app.route('/:url(api)/*')
    .get((req, res) => {
      return res.render('404', (err) => {
        if (err) { return res.status(404).json(err); }
        return res.render('404');
      });
    });

  return app;
}

module.exports = exports = setupRoutes;
