const Controller = require('../../controllers/referral.controller');
const { Router } = require('express');

const router = Router();

router.post('/email', Controller.sendEmail);

module.exports = exports = router;
