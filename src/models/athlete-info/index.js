var helpers = {
        strava: require('./strava')
    };


var extractAthleteData = function(athlete) {
    return helpers[athlete.service].extractAthleteData(athlete);
};

var calculateActivityDistanceGroup = function(activity) {
    return activity.distance_km >=    0 && activity.distance_km <   0.5 ? '0k' :
           activity.distance_km >=  0.5 && activity.distance_km <   2.0 ? '1k' :
           activity.distance_km >=  2.0 && activity.distance_km <   4.0 ? '3k' :
           activity.distance_km >=  4.0 && activity.distance_km <   6.5 ? '5k' :
           activity.distance_km >=  6.5 && activity.distance_km <   9.0 ? '8k (5m)' :
           activity.distance_km >=  9.0 && activity.distance_km <  13.0 ? '10k' :
           activity.distance_km >= 13.0 && activity.distance_km <  18.5 ? '16k (10m)' :
           activity.distance_km >= 18.5 && activity.distance_km <  23.7 ? '21k (HM)' :
           activity.distance_km >= 23.7 && activity.distance_km <  38.6 ? 'HM-M' :
           activity.distance_km >= 38.6 && activity.distance_km <  44.8 ? '42k (M)' : 'UM';
};

var extractActivitiesData = function(athlete, activities) {
    var activitiesData = helpers[athlete.service].extractActivitiesData(activities);

    return activitiesData.map(function(activity) {
        activity.pace_m_km = activity.time_m / activity.distance_km;
        activity.distance_group = calculateActivityDistanceGroup(activity);

        return activity;
    });
};

var calculatePaceStatistics = function(activities) {
    //activities.sort(function(a, b) {
    //    return a.distance_km - b.distance_km;
    //});

    var distanceGroups = {};

    activities.forEach(function(activity) {
        if (!distanceGroups[activity.distance_group]) {
            distanceGroups[activity.distance_group] = 0;
        }

        distanceGroups[activity.distance_group]++;
    });

    return {
        distanceGroups: distanceGroups
    };
};

var createAthleteInfo = function(athlete, activities) {
    var athleteData    = extractAthleteData(athlete),
        activitiesData = extractActivitiesData(athlete, activities);

    return {
        athlete:    athleteData,
        activities: activitiesData,
        paceStats:  calculatePaceStatistics(activitiesData)
    };
};


module.exports = {
    create: createAthleteInfo
};