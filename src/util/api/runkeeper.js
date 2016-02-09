var runkeeper = require('runkeeper-js'),
    client = new runkeeper.HealthGraph({}),
    config = require('config'),
    Promise = require('promise'),

    name = 'runkeeper';


var setClientId = function(value) {
    client.client_id = value;
};


var setClientSecret = function(value) {
    client.client_secret = value;
};


var setAccessToken = function(value) {
    client.access_token = value;
};


var setRedirectUri = function(value) {
    client.redirect_uri = value;
};


var configure = function() {
    setClientId(config.get('runkeeper.client_id'));
    setClientSecret(config.get('runkeeper.client_secret'));
    setRedirectUri(config.get('runkeeper.redirect_uri'));
};


var getOAuthRedirectUrl = function() {
    return client.auth_url +
        '?client_id=' + client.client_id +
        '&response_type=code' +
        '&redirect_uri=' + client.redirect_uri;
};


var loadOAuthAccessToken = function(code) {
    return new Promise(function(resolve, reject) {
        client.getNewToken(code, function(err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};


var extractAthleteInfo = function(data, userData, accessToken) {
    return {
        full_name: data.name,
        avatar_url: data.medium_picture,
        access_token: accessToken,
        service: name,
        service_id: userData.userID,
        raw_data: data
    };
};


var loadAthleteInfo = function(accessToken) {
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
var filterActivityInfo = function(data) {
    return data.type == 'Running'
        && data.source == 'RunKeeper'
        && data.entry_mode == 'API';
};


var extractActivityInfo = function(data) {
    return {
        service: name,
        service_id: data.uri.substr(data.uri.indexOf('/fitnessActivities/')),
        raw_data: data
    };
};


var loadNewActivitiesAndUpdateAthlete = function(athleteInfo) {
    var activityCount = athleteInfo.activity_count ? athleteInfo.activity_count : 0;

    return new Promise(function(resolve, reject) {
        setAccessToken(athleteInfo.access_token);

        client.fitnessActivityFeed(function(err, result) {
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
                    client.fitnessActivityFeed({
                        pageSize: delta
                    }, function(err, result) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            var delta = result.size - activityCount;
                            athleteInfo.activity_count = Math.min(result.size, activityCount + result.items.length);

                            var activityInfos = result.items.slice(0, delta)
                                .filter(filterActivityInfo)
                                .map(extractActivityInfo);

                            resolve({
                                athleteInfo: athleteInfo,
                                activityInfos: activityInfos
                            });
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