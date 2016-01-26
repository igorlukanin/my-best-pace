var router   = require('express').Router(),
    strava   = require('strava-v3'),

    athletes = require('../models/athlete');


var handleLoginError = function(res, service) {
    res.render('errors/login', {
        service: service
    });
};

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