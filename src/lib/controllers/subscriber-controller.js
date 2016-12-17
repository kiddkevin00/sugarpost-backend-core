class SubscriberController {

  static index(req, res) {

    return res.status(200).json(req.user);
  }

}

module.exports = exports = SubscriberController;
