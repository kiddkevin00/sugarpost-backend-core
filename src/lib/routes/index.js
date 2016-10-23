/*
 * This is the place for exposing module(s) for route component.
 */

const adminRoute = require('./admin/');

function setupRoutes(app) {

  // [TODO]
  app.get('/ping', (req, res) => { res.send('OK'); });
  app.get('/health', (req, res) => {});

  app.use('/admin', adminRoute);

  // All not found asset or API routes should return an 404
  app.route('/:url(api)/*')
    .get((req, res) => {
      res.render('404', (err) => {
        if (err) { return res.status(404).json(err); }
        return res.render('404');
      });
    });

  return app;
}

module.exports = exports = setupRoutes;
