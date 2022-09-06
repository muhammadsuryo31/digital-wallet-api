const express = require('express')
const router = express.Router();
const authenticate = require("./../middlewares/authenticate");
const controller = require('./../controllers/transctionController')

router.use(authenticate)
router.route('/').get(controller.getTransaction).post(controller.postTransaction);

module.exports = router