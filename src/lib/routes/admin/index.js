const { SampleController } = require('../../controllers/');
const { Router } = require('express');

const router = Router();

router.get('/sample', SampleController.sampleReq);

module.exports = exports = router;
