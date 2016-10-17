/*
 * This is the place for exposing module(s) for route component.
 */

const adminRoute = require('./admin/');

function setupRoutes(app) {

  // [TODO]
  app.get('/ping', (req, res) => { res.send('OK'); });
  app.get('/health', () => {});

  app.use('/admin', adminRoute);

  return app;
}

module.exports = exports = setupRoutes;
