const { sampleController } = require('../../controllers/');
const { Router } = require('express');

const router = Router();

router.get('/sample', sampleController.sampleReq);

module.exports = exports = router;
