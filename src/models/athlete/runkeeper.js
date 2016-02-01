var log       = require('../../util/log'),
    runkeeper = require('../../util/service/runkeeper');


var getAthleteId = function(data) {
    return data.userID;
};

var getNewAthleteActivities = function(athlete, afterTimestamp, cb) {
    //strava.athlete.listActivities({
    //    access_token: athlete.data.access_token,
    //    after:        afterTimestamp
    //}, function(err, activities) {
    //    log.athleteInfo(athlete, activities.length + ' activities read from service');
    //
    //    cb(err, activities);
    //});

    cb(null, []);
};


module.exports = {
    getId:            getAthleteId,
    getNewActivities: getNewAthleteActivities
};