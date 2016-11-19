const Controller = require('../../controllers/auth-controller');
const { Router } = require('express');

const router = Router();

router.post('/signup', Controller.signup);

module.exports = exports = router;
