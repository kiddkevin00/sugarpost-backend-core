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
      .then(() => {
        requestCount++;

        return res.status(200)
          .send({
            data: {
              teachers: [
                {
                  _id: '001',
                  name: 'Chris',
                  bankAccountId: '002',
                },
                {
                  _id: '002',
                  name: 'Mike',
                  bankAccountId: '003',
                },
              ],
            },
          });
      })
      .catch(() => {

      });
  }

}

module.exports = exports = SampleController;
