const Controller = require('../../controllers/subscription.controller');
const { Router } = require('express');


const router = Router();

router.post('/unsubscribe', Controller.unsubscribe);

module.exports = exports = router;
