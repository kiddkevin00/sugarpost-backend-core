const sampleSvc = {};

class SampleController {

  static _handleRequest(req, res, svc, strategy) {
    let context = {

    };

    svc.execute(context, strategy)
      .then(() => {
        
      })
      .catch(() => {

      });
  }

  static sampleReq(req, res) {
    const sampleStrategy = {};
    
    SampleController._handleRequest(req, res, SampleController.getSampleService(), sampleStrategy)
  }
  
  static getSampleService() {
    return sampleSvc;
  }

}

module.exports = exports = SampleController;
