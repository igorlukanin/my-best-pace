var client = require('strava-v3'),
    config = require('config'),
    moment = require('moment'),
    Promise = require('promise'),

    log = require('../log'),

    name = 'strava',
    earliestActivityTimestamp = config.get('strava.earliest_activity_timestamp');


var setClientId = function(value) {
    client.util.config.client_id = value;
};


var setClientSecret = function(value) {
    client.util.config.client_secret = value;
};


var setAccessToken = function(value) {
    client.util.config.access_token = value;
};


var setRedirectUri = function(value) {
    client.util.config.redirect_uri = value;
};


var configure = function() {
    setClientId(config.get('strava.client_id'));
    setClientSecret(config.get('strava.client_secret'));
    setAccessToken(config.get('strava.access_token'));
    setRedirectUri(config.get('strava.redirect_uri'));
};


var getOAuthRedirectUrl = function() {
    return client.oauth.getRequestAccessURL({ scope: 'public' });
};


var athleteDataCache = {};

var loadOAuthAccessToken = function(code) {
    return new Promise(function(resolve, reject) {
        client.oauth.getToken(code, function(err, result) {
            if (err || result.message == 'Bad Request') {
                reject(err);
            }
            else {
                athleteDataCache[result.access_token] = result.athlete;
                resolve(result.access_token);
            }
        });
    });
};

var extractAthleteInfo = function(data, accessToken) {
    return {
        full_name: data.firstname + ' ' + data.lastname,
        avatar_url: data.profile,
        access_token: accessToken,
        service: name,
        service_id: data.id,
        raw_data: data
    };
};


var loadAthleteInfo = function(accessToken) {
    if (athleteDataCache[accessToken]) {
        var data = athleteDataCache[accessToken];
        return Promise.resolve(extractAthleteInfo(data, accessToken));
    }

    var clientAthleteGet = Promise.denodeify(client.athlete.get);

    return clientAthleteGet({ access_token: accessToken })
        .then(function(result) {
            athleteDataCache[accessToken] = result;
            return extractAthleteInfo(result, accessToken);
        });
};


var calculateLowerTimestamp = function(athleteInfo) {
    return athleteInfo.activities_update_timestamp
        ? athleteInfo.activities_update_timestamp
        : earliestActivityTimestamp;
};


var calculateUpperTimestamp = function(lowerTimestamp, activityInfos) {
    return activityInfos.reduce(function(previous, current) {
        return Math.max(previous, moment(current.start_date).unix());
    }, lowerTimestamp);
};


var filterActivityInfo = function(data) {
    return data.type == 'Run'
        && data.manual == false;
};


// Strava excludes resting time from moving_time so moving_time is more accurate.
// See http://blog.strava.com/run-activity-page-updates-and-improvements-6500/
var extractActivityInfo = function(data) {
    return {
        distance_km: data.distance / 1000,
        time_m: data.moving_time / 60,
        start_timestamp: moment(data.start_date).unix(),
        service: name,
        service_id: data.id,
        raw_data: data
    };
};


var loadNewActivitiesAndUpdateAthlete = function(athleteInfo) {
    var latestTimestamp = calculateLowerTimestamp(athleteInfo);

    return new Promise(function(resolve, reject) {
        client.athlete.listActivities({
            access_token: athleteInfo.access_token,
            after: latestTimestamp
        }, function(err, activityInfos) {
            if (err) {
                reject(err);
            }
            else {
                latestTimestamp = calculateUpperTimestamp(latestTimestamp, activityInfos);
                athleteInfo.activities_update_timestamp = latestTimestamp;

                activityInfos = activityInfos
                    .filter(filterActivityInfo)
                    .map(extractActivityInfo);

                resolve({
                    athleteInfo: athleteInfo,
                    activityInfos: activityInfos
                });
            }
        });
    });
};


configure();


module.exports = {
    getOAuthRedirectUrl: getOAuthRedirectUrl,
    loadOAuthAccessToken: loadOAuthAccessToken,
    loadAthleteInfo: loadAthleteInfo,
    loadNewActivitiesAndUpdateAthlete: loadNewActivitiesAndUpdateAthlete
};