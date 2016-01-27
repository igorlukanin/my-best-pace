var router   = require('express').Router(),

    athletes = require('../models/athlete');


router.get('/:id', function(req, res) {
    var id = req.params.id;

    athletes.getInfo(id, function(err, athleteInfo) {
        if (err) {
            res.render('errors/athlete');
        }
        else {
            res.render('athlete', athleteInfo);
        }
    });
});


module.exports = router;