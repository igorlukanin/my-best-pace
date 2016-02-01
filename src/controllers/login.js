var router    = require('express').Router(),
    strava    = require('strava-v3'),

    athletes  = require('../models/athlete'),
    runkeeper = require('../util/service/runkeeper');


var handleLoginError = function(res, service) {
    res.render('errors/login', {
        service: service
    });
};

router.get('/runkeeper', function(req, res) {
    res.redirect(runkeeper.getRequestAccessURL());
});

router.get('/runkeeper/complete', function(req, res) {
    var service = 'runkeeper',
        code    = req.query.code;

    if (!code) {
        handleLoginError(res, service);
    }
    else {
        runkeeper.getNewToken(code, function(err, token) {
            if (err) {
                handleLoginError(res, service);
            }
            else {
                runkeeper.access_token = token;

                runkeeper.user(function(err, userResult) {
                    if (err) {
                        handleLoginError(res, service);
                    }
                    else {
                        runkeeper.profile(function(err, profileResult) {
                            if (err) {
                                handleLoginError(res, service);
                            }
                            else {
                                profileResult.userID = userResult.userID;

                                athletes.create(service, profileResult, function(athleteId) {
                                    res.redirect('/athletes/' + athleteId);
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});

router.get('/runkeeper/disconnect', function(req, res) {
    // res.
});

router.get('/strava', function(req, res) {
    res.redirect(strava.oauth.getRequestAccessURL({
        scope: 'public'
    }));
});

router.get('/strava/complete', function(req, res) {
    var service = 'strava',
        code    = req.query.code;

    if (!code) {
        handleLoginError(res, service);
    }
    else {
        strava.oauth.getToken(code, function(err, result) {
            if (err) {
                handleLoginError(res, service);
            }
            else {
                athletes.create(service, result, function(athleteId) {
                    res.redirect('/athletes/' + athleteId);
                });
            }
        });
    }
});


module.exports = router;