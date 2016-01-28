var router   = require('express').Router();


router.get('/', function(req, res) {
    res.render('index');
});

router.use('/login',    require('./login'));
router.use('/athletes', require('./athlete'));


module.exports = router;