var fs = require('fs'),

    distanceGroups = {
        '0k': [0.0, 0.5],
        '1k': [0.5, 2.0],
        '3k': [2.0, 4.0],
        '5k': [4.0, 6.5],
        '8k': [6.5, 9.0],
        '10k': [9.0, 13.0],
        '16k': [13.0, 18.5],
        '21k': [18.5, 23.7],
        '30k': [23.7, 38.6],
        '42k': [38.6, 44.8],
        '00k': [44.8, Infinity]
    };


var calculateDistanceGroup = function(activity) {
    for (var name in distanceGroups) {
        if (distanceGroups.hasOwnProperty(name) &&
            distanceGroups[name][0] <= activity.distance_km &&
            distanceGroups[name][1] > activity.distance_km
        ) {
            return name;
        }
    }
};


var calculateDistanceGroupStats = function(activities) {
    var stats = {};

    for (var name in distanceGroups) {
        if (distanceGroups.hasOwnProperty(name)) {
            stats[name] = {
                count: 0,
                ratio: 0
            };
        }
    }

    if (activities.length == 0) {
        return stats;
    }

    activities.forEach(function(activity) {
        stats[activity.distance_group].count++;
    });

    for (name in stats) {
        if (stats.hasOwnProperty(name)) {
            stats[name].ratio = stats[name].count / activities.length;
        }
    }

    return stats;
};


var calculateData = function(athlete, activities) {
    fs.writeFileSync('./test/util/analytics-activities.json', JSON.stringify(activities, null, 2));

    activities = activities.map(function(activity) {
        activity.distance_group = calculateDistanceGroup(activity);

        return activity;
    });

    return {
        //activities: activities,
        distance_group_stats: calculateDistanceGroupStats(activities),
        "todo": "add more data"
    };
};


module.exports = {
    calculateDistanceGroup: calculateDistanceGroup,
    calculateDistanceGroupStats: calculateDistanceGroupStats,
    calculate: calculateData
};


//var calculateActivityDistanceGroup = function(activity) {
//                            activity.distance_km >= 13.0 && activity.distance_km <  18.5 ? '16k (10m)' :
//                                activity.distance_km >= 18.5 && activity.distance_km <  23.7 ? '21k (HM)' :
//                                    activity.distance_km >= 23.7 && activity.distance_km <  38.6 ? 'HM-M' :
//                                        activity.distance_km >= 38.6 && activity.distance_km <  44.8 ? '42k (M)' : 'UM';
//};