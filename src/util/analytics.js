var distanceGroups = {
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
    },
    periodsPerYearCounts = {
        '0y': [0.0, 0.5, 12], // 12 per year
        '1y': [0.5, 1.5, 6], // 6 per year
        '00y': [1.5, Infinity, 4] // 4 per year
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


var calculateDateGroup = function(activity, stats) {
    var position = Math.floor((activity.start_timestamp - stats.min_timestamp) / stats.period);
    return Math.floor(stats.min_timestamp + stats.period * (0.5 + position));
};


var calculateDatePeriodsCount = function(years) {
    for (var name in periodsPerYearCounts) {
        if (periodsPerYearCounts.hasOwnProperty(name) &&
            periodsPerYearCounts[name][0] <= years &&
            periodsPerYearCounts[name][1] > years
        ) {
            return Math.ceil(periodsPerYearCounts[name][2] * years);
        }
    }
};


var calculateDateStats = function(activities) {
    var stats = {
        min_timestamp: 0,
        max_timestamp: 0,
        delta_years: 0,
        periods_count: 0,
        period: 0
    };

    if (activities.length == 0) {
        return stats;
    }

    activities.forEach(function(activity) {
        if (stats.min_timestamp == 0 || stats.max_timestamp == 0) {
            stats.min_timestamp = activity.start_timestamp;
            stats.max_timestamp = activity.start_timestamp;
        }

        stats.min_timestamp = Math.min(stats.min_timestamp, activity.start_timestamp);
        stats.max_timestamp = Math.max(stats.max_timestamp, activity.start_timestamp);
    });

    stats.delta_years = (stats.max_timestamp - stats.min_timestamp) / (60 * 60 * 24 * 365);
    stats.periods_count = calculateDatePeriodsCount(stats.delta_years);
    stats.period = (stats.max_timestamp - stats.min_timestamp) / stats.periods_count;

    return stats;
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
    var dateStats = calculateDateStats(activities);

    activities = activities.map(function(activity) {
        activity.date_group = calculateDateGroup(activity, dateStats);
        activity.distance_group = calculateDistanceGroup(activity);
        activity.pace_m_km = calculatePace(activity);

        delete activity.raw_data;

        return activity;
    });

    var distanceGroupStats = calculateDistanceGroupStats(activities);

    return {
        distance_group_stats: distanceGroupStats,
        date_stats: dateStats,
        most_frequent_stats: calculateMostFrequentStats(distanceGroupStats),
        activities: activities
    };
};


module.exports = {
    calculate: calculateData,

    // For testing:
    calculateDistanceGroup: calculateDistanceGroup,
    calculateDistanceGroupStats: calculateDistanceGroupStats,
    calculateDateGroup: calculateDateGroup,
    calculateDateStats: calculateDateStats,
    calculatePace: calculatePace,
    calculateMostFrequentDistanceGroupStats: calculateMostFrequentDistanceGroupStats
};