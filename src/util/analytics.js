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
    },
    minimumActivityCountPerDistance = 4;


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
        years: 0,
        periods: 0,
        period_seconds: 0
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

    stats.years = (stats.max_timestamp - stats.min_timestamp) / (60 * 60 * 24 * 365);
    stats.periods = calculateDatePeriodsCount(stats.years);
    stats.period_seconds = (stats.max_timestamp - stats.min_timestamp) / stats.periods;

    return stats;
};


var calculateDateGroup = function(activity, stats) {
    var position = Math.floor((activity.start_timestamp - stats.min_timestamp) / stats.period_seconds);
    return Math.floor(stats.min_timestamp + stats.period_seconds * (0.5 + position));
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


var calculatePace = function(activity) {
    return activity.time_m / activity.distance_km;
};


var calculateData = function(athlete, activities) {
    var dateStats = calculateDateStats(activities),
        distanceStats = {
            distance_groups: {},
            most_frequent: []
        };

    for (var name in distanceGroups) {
        if (distanceGroups.hasOwnProperty(name)) {
            distanceStats.distance_groups[name] = {
                relevant: true,
                count: 0,
                ratio: 0,
                date_groups: {}
            };
        }
    }

    activities = activities.map(function(activity, i) {
        activity.date_group = calculateDateGroup(activity, dateStats);
        activity.distance_group = calculateDistanceGroup(activity);
        activity.pace_m_km = calculatePace(activity);

        var distanceCell = distanceStats.distance_groups[activity.distance_group];
        distanceCell.count++;

        if (distanceCell.date_groups[activity.date_group] == undefined) {
            distanceCell.date_groups[activity.date_group] = {
                activities: []
            };
        }

        distanceCell.date_groups[activity.date_group].activities.push(i);

        delete activity.raw_data;
        return activity;
    });

    var distanceRatios = [];

    for (name in distanceGroups) {
        if (distanceGroups.hasOwnProperty(name)) {
            distanceStats.distance_groups[name].relevant = distanceStats.distance_groups[name].count >= minimumActivityCountPerDistance;
            distanceStats.distance_groups[name].ratio = distanceStats.distance_groups[name].count / activities.length;
            distanceRatios.push([ name, distanceStats.distance_groups[name].ratio ]);
        }
    }

    distanceStats.most_frequent = distanceRatios
        .sort(function(a, b) { return a[1] - b[1]; })
        .slice(-3)
        .reverse()
        .map(function(a) { return a[0]; });

    return {
        date_stats: dateStats,
        distance_stats: distanceStats,
        activities: activities
    };
};


module.exports = {
    calculate: calculateData,

    // For testing:
    calculateDistanceGroup: calculateDistanceGroup,
    calculateDateGroup: calculateDateGroup,
    calculateDateStats: calculateDateStats,
    calculatePace: calculatePace
};