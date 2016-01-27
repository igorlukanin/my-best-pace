var extractAthleteData = function(athlete) {
    return {
        id: athlete.id
    };
};

// Strava excludes resting time from moving_time, that's why elapsed_time is used
// See http://blog.strava.com/run-activity-page-updates-and-improvements-6500/
var extractActivitiesData = function(activities) {
    return activities.filter(function(activity) {
        return activity.data.type == 'Run'
            && activity.data.manual == false;
    }).map(function(activity) {
        return {
            id:          activity.id,
            distance_km: activity.data.distance / 1000,
            time_m:      activity.data.elapsed_time / 60,
            date:        activity.data.start_date
        };
    });
};

module.exports = {
    extractAthleteData:    extractAthleteData,
    extractActivitiesData: extractActivitiesData
};