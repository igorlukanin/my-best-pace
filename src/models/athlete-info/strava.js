var extractAthleteData = function(athlete) {
    return {
        id: athlete.id
    };
};

var extractActivitiesData = function(activities) {
    return activities.filter(function(activity) {
        return activity.data.type == 'Run'
            && activity.data.manual == false;
    });
};

module.exports = {
    extractAthleteData:    extractAthleteData,
    extractActivitiesData: extractActivitiesData
};