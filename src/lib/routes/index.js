const SampleController = require('../controllers/sample-controller');

function routes(app) {

  // [TODO]
  app.get('/ping', () => {});
  app.get('/health', () => {});

  app.use('/admin', SampleController.sampleReq);
}

module.exports = exports = routes;
