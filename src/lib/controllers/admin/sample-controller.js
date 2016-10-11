const SampleSvc = require('../../services/sample-service');

class SampleController {

  static sampleReq(req, res) {
    const sampleStrategy = {};

    SampleController._handleRequest(req, res, SampleSvc, sampleStrategy);
  }

  static _handleRequest(req, res, svc, strategy) {
    let context = {

    };

    svc.execute(context, strategy)
      .then(() => {
        res.status(200)
          .send('Hello world!');
      })
      .catch(() => {

      });
  }

}

module.exports = exports = SampleController;
