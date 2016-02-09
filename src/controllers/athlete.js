var Promise = require('promise'),
    router = require('express').Router(),

    athletes = require('../models/athlete'),
    analytics = require('../util/analytics');


router.get('/:id', function(req, res) {
    var id = req.params.id;

    var athleteInfo = athletes.load(id),
        activityInfos = athleteInfo.then(function(athleteInfo) {
            return athletes.loadActivities(athleteInfo);
    });

    Promise
        .all([ athleteInfo, activityInfos ])
        .then(function(result) {
            athleteInfo = result[0];
            activityInfos = result[1];

            res.render('athlete', {
                athlete: athleteInfo,
                analytics: analytics.calculate(athleteInfo, activityInfos)
            });
        }, function(err) {
            res.render('errors/athlete', {
                err: err
            });
        });
});


module.exports = router;