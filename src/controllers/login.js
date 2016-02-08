var router    = require('express').Router(),

    athletes  = require('../models/athlete'),
    runkeeper = require('../util/api/runkeeper'),
    strava    = require('../util/api/strava');


var handleLoginError = function(res, service) {
    res.render('errors/login', {
        service: service
    });
};

router.get('/runkeeper', function(req, res) {
    res.redirect(runkeeper.getOAuthRedirectUrl());
});

router.get('/runkeeper/complete', function(req, res) {
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
            .then(function(athleteId) {
                res.redirect('/athletes/' + athleteId);
            }, function(err) {
                handleLoginError(err, service);
            });
    }
});

router.get('/runkeeper/disconnect', function(req, res) {
    // TODO: Implement
});

router.get('/strava', function(req, res) {
    res.redirect(strava.getOAuthRedirectUrl());
});

router.get('/strava/complete', function(req, res) {
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
            .then(function(athleteId) {
                res.redirect('/athletes/' + athleteId);
            }, function(err) {
                handleLoginError(err, service);
            });
    }
});


module.exports = router;