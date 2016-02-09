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


var calculatePace = function(activity) {
    return activity.time_m / activity.distance_km;
};


var calculateMostFrequentDistanceGroupStats = function(distanceGroupStats) {
    var distanceGroupStatsArray = [];

    for (name in distanceGroupStats) {
        if (distanceGroupStats.hasOwnProperty(name) && distanceGroupStats[name].ratio > 0) {
            distanceGroupStatsArray.push([ name, distanceGroupStats[name].ratio ]);
        }
    }

    return distanceGroupStatsArray
        .sort(function(a, b) { return a[1] - b[1]; })
        .slice(-3)
        .map(function(a) { return a[0]; });
};


var calculateMostFrequentStats = function(distanceGroupStats) {
    return {
        distance_groups: calculateMostFrequentDistanceGroupStats(distanceGroupStats)
    };
};


var calculateData = function(athlete, activities) {
    fs.writeFileSync('./test/util/analytics-activities.json', JSON.stringify(activities, null, 2));

    activities = activities.map(function(activity) {
        activity.distance_group = calculateDistanceGroup(activity);
        activity.pace_m_km = calculatePace(activity);

        delete activity.raw_data;

        return activity;
    });

    var distanceGroupStats = calculateDistanceGroupStats(activities);

    return {
        distance_group_stats: distanceGroupStats,
        most_frequent_stats: calculateMostFrequentStats(distanceGroupStats),
        activities: activities
    };
};


module.exports = {
    calculate: calculateData,

    // For testing:
    calculateDistanceGroup: calculateDistanceGroup,
    calculateDistanceGroupStats: calculateDistanceGroupStats,
    calculatePace: calculatePace,
    calculateMostFrequentDistanceGroupStats: calculateMostFrequentDistanceGroupStats
};