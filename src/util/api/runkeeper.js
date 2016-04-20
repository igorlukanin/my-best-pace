var runkeeper = require('runkeeper-js'),
    client = new runkeeper.HealthGraph({}),
    config = require('config'),
    Promise = require('promise'),

    name = 'runkeeper';


var setClientId = (value) => client.client_id = value;

var setClientSecret = (value) => client.client_secret = value;

var setAccessToken = (value) => client.access_token = value;

var setRedirectUri = (value) => client.redirect_uri = value;

var configure = () => {
    setClientId(config.get('runkeeper.client_id'));
    setClientSecret(config.get('runkeeper.client_secret'));
    setRedirectUri(config.get('runkeeper.redirect_uri'));
};


var getOAuthRedirectUrl = () =>
    client.auth_url +
    '?client_id=' + client.client_id +
    '&response_type=code' +
    '&redirect_uri=' + client.redirect_uri;


var loadOAuthAccessToken = (code) => new Promise((resolve, reject) => {
    client.getNewToken(code, function(err, result) {
        if (err) {
            reject(err);
        }
        else {
            resolve(result);
        }
    });
});


var extractAthleteInfo = (data, userData, accessToken) => {
    return {
        full_name: data.name,
        avatar_url: data.medium_picture,
        access_token: accessToken,
        service: name,
        service_id: userData.userID,
        raw_data: data
    };
};


var loadAthleteInfo = (accessToken) => {
    setAccessToken(accessToken);

    return new Promise(function(resolve, reject) {
        client.user(function(err, userResult) {
            if (err) {
                reject(err);
            }
            else {
                client.profile(function(err, profileResult) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(extractAthleteInfo(profileResult, userResult, accessToken));
                    }
                });
            }
        });
    });
};


// Unfortunately, there's no way to distinguish between manually entered activities
// and those tracked via GPS. Both have { source: 'RunKeeper', entry_mode: 'API' }
var filterActivityInfo = (data) =>
    data.type == 'Running' &&
    data.source == 'RunKeeper' &&
    data.entry_mode == 'API' &&
    data.tracking_mode == 'outdoor';


var extractActivityInfo = (data) => {
    return {
        distance_km: data.total_distance / 1000,
        time_m: data.duration / 60,
        start_timestamp: new Date(data.start_time + ' GMT+00:00').getTime() / 1000,
        elevation_grade: data.climb ? data.climb / data.total_distance : 0,
        service: name,
        service_id: data.uri.substr(data.uri.indexOf('/fitnessActivities/')),
        raw_data: data
    };
};


var loadNewActivitiesAndUpdateAthlete = (athleteInfo) => {
    var activityCount = athleteInfo.activity_count ? athleteInfo.activity_count : 0;

    return new Promise((resolve, reject) => {
        setAccessToken(athleteInfo.access_token);

        client.fitnessActivityFeed((err, result) => {
            if (err) {
                reject(err);
            }
            else {
                var delta = result.size - activityCount;

                // All new activities already loaded
                if (delta < result.items.length) {
                    athleteInfo.activity_count = Math.min(result.size, activityCount + result.items.length);

                    var activityInfos = result.items.slice(0, delta)
                        .filter(filterActivityInfo)
                        .map(extractActivityInfo);

                    resolve({
                        athleteInfo: athleteInfo,
                        activityInfos: activityInfos
                    });
                }
                // Not all new activities loaded, loading...
                else {
                    client.fitnessActivityFeed({ pageSize: delta }, (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            var delta = result.size - activityCount;
                            athleteInfo.activity_count = Math.min(result.size, activityCount + result.items.length);

                            var activityInfos = result.items.slice(0, delta)
                                .filter(filterActivityInfo)
                                .map(extractActivityInfo);

                            resolve({ athleteInfo, activityInfos });
                        }
                    });
                }
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