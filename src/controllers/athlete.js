var router   = require('express').Router(),

    athletes = require('../models/athlete');


router.get('/:id', function(req, res) {
    var id = req.params.id;

    athletes.select(id, function(err, athlete) {
        if (err) {
            res.render('errors/athlete');
        }
        else {
            res.render('athlete', {
                athlete: athlete
            });
        }
    });
});


module.exports = router;