var router   = require('express').Router();


router.use('/login',    require('./login'));
router.use('/athletes', require('./athlete'));


module.exports = router;