var Promise = require('promise'),
    router = require('express').Router(),

    athletes = require('../models/athlete'),
    analytics = require('../analytics');
    hourAnalytics = require('../analytics/hours'),
    dayAnalytics = require('../analytics/days');


router.get('/:id', (req, res) => {
    var id = req.params.id;

    var athleteInfo = athletes.load(id),
        activityInfos = athleteInfo.then((athleteInfo) => athletes.loadActivities(athleteInfo));

    Promise
        .all([ athleteInfo, activityInfos ])
        .then(([ athleteInfo, activityInfos ]) => res.render('athlete', {
            athlete: athleteInfo,
            analytics: analytics.calculate(athleteInfo, activityInfos),
            hours: {
                allTime: hourAnalytics.allTime(activityInfos),
                recent: hourAnalytics.recent(activityInfos)
            },
            days: {
                allTime: dayAnalytics.allTime(activityInfos),
                recent: dayAnalytics.recent(activityInfos)
            }
        }))
        .catch((err) => res.render('errors/athlete', { err: err }));
});


module.exports = router;