var async       = require('async'),
    compression = require('compression'),
    config      = require('config'),
    ejs         = require('ejs'),
    express     = require('express'),
    strava      = require('strava-v3'),

    port        = config.get('server.port');


process.on('uncaughtException', function(err) {
    console.error(err.stack);
});

express()
    .use(express.static('public'))
    .use(compression())

    .get('/', function(req, res) {
        res.render('index');
    })

    .get('/auth/strava', function(req, res) {
        res.redirect(strava.oauth.getRequestAccessURL({
            scope:         'public'
        }));
    })

    .get('/auth/strava/complete', function(req, res) {
        var code = req.query.code;

        if (code) {
            strava.oauth.getToken(code, function(err, result) {
                strava.athlete.listActivities({
                    'access_token': result.access_token
                }, function(err, activities) {
                    async.series(activities.map(function(activity) {
                        return function(callback) {
                            strava.activities.get({
                                id: activity.id
                            }, function(err, activity) {
                                callback(null, activity);
                            });
                        };
                    }), function(err, detailedActivities) {
                        res.render('index', {
                            user:       result.athlete,
                            activities: detailedActivities
                        });
                    });
                });
            });
        }
        else {
            res.render('index'); // TODO: Change to more meaningful solution
        }
    })

    .set('view engine', 'ejs')

    .listen(port, function() {
        console.log("my-best-pace-website started at port " + port);
    });
