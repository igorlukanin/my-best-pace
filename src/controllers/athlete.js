var router   = require('express').Router(),

    athletes = require('../models/athlete');


router.get('/:id', function(req, res) {
    var id = req.params.id;

    athletes
        .load(id)
        .then(function(athleteInfo) {
            res.render('athlete', athleteInfo);
        }, function(err) {
            res.render('errors/athlete');
        });
});


module.exports = router;