var router   = require('express').Router(),

    athletes = require('../models/athlete');


router.get('/:id', function(req, res) {
    var id = req.params.id;

    // TODO: Check if all athleteInfo data is needed to server request
    athletes.getInfo(id, function(err, athleteInfo) {
        if (err) {
            res.render('errors/athlete');
        }
        else {
            res.render('athlete', athleteInfo);
        }
    });
});

router.get('/:id/activities.json', function(req, res) {
    var id = req.params.id;

    // TODO: Check if all data athleteInfo is needed to server request
    athletes.getInfo(id, function(err, athleteInfo) {
        if (err) {
            res.render({
                message: 'Error'
            });
        }
        else {
            res.json(athleteInfo.activities);
        }
    });
});


module.exports = router;