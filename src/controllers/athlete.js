var Promise = require('promise'),
    router = require('express').Router(),

    athletes = require('../models/athlete'),
    analytics = require('../util/analytics');


router.get('/:id', (req, res) => {
    var id = req.params.id;

    var athleteInfo = athletes.load(id),
        activityInfos = athleteInfo.then((athleteInfo) => athletes.loadActivities(athleteInfo));

    Promise
        .all([ athleteInfo, activityInfos ])
        .then(([ athleteInfo, activityInfos ]) => res.render('athlete', {
            athlete: athleteInfo,
            analytics: analytics.calculate(athleteInfo, activityInfos)
        }))
        .catch((err) => res.render('errors/athlete', { err: err }));
});


module.exports = router;