const SampleController = require('../../controllers/sample-controller');
const { Router } = require('express');

const router = Router();

router.get('/sample', SampleController.sampleReq);

module.exports = exports = router;
