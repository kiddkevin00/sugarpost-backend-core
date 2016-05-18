class SampleController {

  static _handleRequest(req, res, svc) {
    let context = {
      
    };
    
    svc.execute(context)
      .then(() => {
        
      })
      .catch(() => {
        
      });
  }

  static sampleReq(req, res) {
    SampleController._handleRequest(req, res, )
  }
  
}
