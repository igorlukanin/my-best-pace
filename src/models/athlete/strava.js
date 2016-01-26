var strava = require('strava-v3'),

    log    = require('../../util/log');


var getAthleteId = function(data) {
    return data.athlete.getId;
};

var getNewAthleteActivities = function(athlete, afterTimestamp, cb) {
    strava.athlete.listActivities({
        access_token: athlete.data.access_token,
        after:        afterTimestamp
    }, function(err, activities) {
        log.athleteInfo(athlete, activities.length + ' activities read from service');

        cb(err, activities);
    });
};


module.exports = {
    getId:            getAthleteId,
    getNewActivities: getNewAthleteActivities
};