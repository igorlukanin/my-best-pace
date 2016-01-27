var helpers = {
        strava: require('./strava')
    };


var createAthleteInfo = function(athlete, activities) {
    return {
        athlete:    helpers[athlete.service].extractAthleteData(athlete),
        activities: helpers[athlete.service].extractActivitiesData(activities)
    };
};


module.exports = {
    create: createAthleteInfo
};