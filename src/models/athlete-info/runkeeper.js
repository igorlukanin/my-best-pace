var moment = require('moment');


var extractAthleteData = function(athlete) {
    return {
        id:         athlete.id,
        name:       athlete.data.name,
        avatar_url: athlete.data.medium_picture
    };
};

var extractActivitiesData = function(activities) {
    //return activities.filter(function(activity) {
    //    return activity.data.type == 'Run'
    //        && activity.data.manual == false;
    //}).map(function(activity) {
    //    return {
    //        id:          activity.id,
    //        distance_km: activity.data.distance / 1000,
    //        time_m:      activity.data.moving_time / 60,
    //        date:        moment(activity.data.start_date).unix()
    //    };
    //});

    return [];
};


module.exports = {
    extractAthleteData:    extractAthleteData,
    extractActivitiesData: extractActivitiesData
};