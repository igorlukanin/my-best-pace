var router    = require('express').Router(),

    athletes  = require('../models/athlete'),
    runkeeper = require('../util/api/runkeeper'),
    strava    = require('../util/api/strava');


var handleLoginError = (res, service) => res.render('errors/login', { service: service });

router.get('/runkeeper', (req, res) => res.redirect(runkeeper.getOAuthRedirectUrl()));

router.get('/runkeeper/complete', (req, res) => {
    var code = req.query.code,
        service = 'runkeeper';

    if (!code) {
        handleLoginError(res, service);
    }
    else {
        runkeeper
            .loadOAuthAccessToken(code)
            .then(runkeeper.loadAthleteInfo)
            .then(athletes.create)
            .then((athleteId) => res.redirect('/athletes/' + athleteId))
            .catch((err) => handleLoginError(err, service));
    }
});

router.get('/strava', (req, res) => res.redirect(strava.getOAuthRedirectUrl()));

router.get('/strava/complete', (req, res) => {
    var code = req.query.code,
        service = 'strava';

    if (!code) {
        handleLoginError(res, service);
    }
    else {
        strava
            .loadOAuthAccessToken(code)
            .then(strava.loadAthleteInfo)
            .then(athletes.create)
            .then((athleteId) => res.redirect('/athletes/' + athleteId))
            .catch((err) => handleLoginError(err, service));
    }
});


module.exports = router;