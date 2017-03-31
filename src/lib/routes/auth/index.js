const Controller = require('../../controllers/auth.controller');
const authCheckMiddleware = require('../../utility/auth-check-middleware');
const { Router } = require('express');

const router = Router();

router.post('/signup', Controller.signup);
router.post('/login', Controller.login);
router.get('/logout', Controller.logout);
router.post('/forgot-password', Controller.forgotPassword);
router.get('/token', Controller.getToken);
router.get('/check', [authCheckMiddleware], Controller.getUserInfo);

module.exports = exports = router;
