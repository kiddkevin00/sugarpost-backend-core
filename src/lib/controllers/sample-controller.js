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

  static sampleReq(req, res, svc, strategy) {
    SampleController._handleRequest(req, res, svc)
  }

}
