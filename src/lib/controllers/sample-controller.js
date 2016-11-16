const SampleSvc = require('../services/sample-service');
const ProcessSate = require('../process-state/index');

const containerId = process.env.HOSTNAME;
let requestCount = 0;

class SampleController {

  static sampleReq(req, res) {
    const sampleStrategy = {};

    SampleController._handleRequest(req.query, res, SampleSvc, sampleStrategy);
  }

  static _handleRequest(reqParam = {}, res, svc, strategy) {
    const context = { containerId, requestCount };
    const state = ProcessSate.create(reqParam, context);

    return svc.execute(state, strategy)
      .then((result) => {
        requestCount += 1;

        return res.status(200)
          .send(result);
      })
      .catch(() => {

      });
  }

}

module.exports = exports = SampleController;
