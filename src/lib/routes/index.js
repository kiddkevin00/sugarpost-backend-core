/*
 * This is the place for exposing module(s) for routes.
 */

const adminRoute = require('./admin/');

function setupRoutes(app) {

  // [TODO]
  app.get('/ping', (req, res) => { res.send('OK'); });
  app.get('/health', () => {});

  app.use('/admin', adminRoute);
}

module.exports = exports = setupRoutes;
