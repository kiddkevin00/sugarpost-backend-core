const Controller = require('../../controllers/user.controller');
const { Router } = require('express');

const router = Router();

router.put('/info', Controller.updateUserInfo);

module.exports = exports = router;
