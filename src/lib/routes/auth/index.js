const Controller = require('../../controllers/auth-controller');
const { Router } = require('express');

const router = Router();

router.post('/subscribe', Controller.subscribe);
router.post('/signup', Controller.signup);
router.post('/login', Controller.login);
router.get('/token', Controller.getToken);

module.exports = exports = router;
