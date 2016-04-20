var router = require('express').Router(),

    db = require('../util/db');


router.get('/', (req, res) => db.c.then((c) => db.athletes
    .run(c)
    .then((cursor) => cursor.toArray())
    .then((athleteInfos) => res.render('index', { athletes: athleteInfos }))));

router.use('/login',    require('./login'));

router.use('/athletes', require('./athlete'));


module.exports = router;