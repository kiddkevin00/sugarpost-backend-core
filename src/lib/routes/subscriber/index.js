const Controller = require('../../controllers/subscriber.controller');
const { Router } = require('express');

const router = Router();

router.get('/', Controller.index);

module.exports = exports = router;
