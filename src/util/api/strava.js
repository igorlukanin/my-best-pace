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


var extractActivityInfo = function(data) {
    return {
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


//// Strava excludes resting time from moving_time so it's more accurate
//// See http://blog.strava.com/run-activity-page-updates-and-improvements-6500/
//var extractActivitiesData = function(activities) {
//    return activities.map(function(activity) {
//        return {
//            id:          activity.id,
//            distance_km: activity.data.distance / 1000,
//            time_m:      activity.data.moving_time / 60,
//            date:        moment(activity.data.start_date).unix()
//        };
//    });
//};


//var calculateActivityDistanceGroup = function(activity) {
//    return activity.distance_km >=    0 && activity.distance_km <   0.5 ? '0k' :
//        activity.distance_km >=  0.5 && activity.distance_km <   2.0 ? '1k' :
//            activity.distance_km >=  2.0 && activity.distance_km <   4.0 ? '3k' :
//                activity.distance_km >=  4.0 && activity.distance_km <   6.5 ? '5k' :
//                    activity.distance_km >=  6.5 && activity.distance_km <   9.0 ? '8k (5m)' :
//                        activity.distance_km >=  9.0 && activity.distance_km <  13.0 ? '10k' :
//                            activity.distance_km >= 13.0 && activity.distance_km <  18.5 ? '16k (10m)' :
//                                activity.distance_km >= 18.5 && activity.distance_km <  23.7 ? '21k (HM)' :
//                                    activity.distance_km >= 23.7 && activity.distance_km <  38.6 ? 'HM-M' :
//                                        activity.distance_km >= 38.6 && activity.distance_km <  44.8 ? '42k (M)' : 'UM';
//};
//
//var extractActivitiesData = function(athlete, activities) {
//    var activitiesData = helpers[athlete.service].extractActivitiesData(activities);
//
//    return activitiesData.map(function(activity) {
//        activity.pace_m_km = activity.time_m / activity.distance_km;
//        activity.distance_group = calculateActivityDistanceGroup(activity);
//
//        return activity;
//    });
//};
//
//var calculatePaceStatistics = function(activities) {
//    //activities.sort(function(a, b) {
//    //    return a.distance_km - b.distance_km;
//    //});
//
//    var distanceGroups = {};
//
//    activities.forEach(function(activity) {
//        if (!distanceGroups[activity.distance_group]) {
//            distanceGroups[activity.distance_group] = 0;
//        }
//
//        distanceGroups[activity.distance_group]++;
//    });
//
//    return {
//        distanceGroups: distanceGroups
//    };
//};