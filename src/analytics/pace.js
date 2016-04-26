'use strict';

const _ = require('lodash');
const config = require('config');


const distances = {
    '5': [2.5, 7.5],
    '10': [7.5, 15.0],
    'HM': [15.0, 32.5],
    'M': [35.0, Infinity]
};


const isNotOutdated = activity => {
    var period = config.get('analytics.window_period_ms');
    return activity.start_timestamp > (new Date().getTime() - period) / 1000;
};


// 1 km world record is 2:11.96
// 7+ km/h is walking, not running
const hasReasonablePace = activity => activity.pace_m_km > 2 && activity.pace_m_km < 7;


const byTimestamp = (activity1, activity2) => activity1.start_timestamp - activity2.start_timestamp;


const asPeriods = (periods, activity) => {
    var lastPeriod = periods[periods.length - 1];
    var lastActivity = lastPeriod[lastPeriod.length - 1];

    const gap = config.get('analytics.gap_period_ms') / 1000;

    if (lastActivity != undefined && activity.start_timestamp - lastActivity.start_timestamp > gap) {
        periods.push([]);
    }

    periods[periods.length - 1].push(activity);
    return periods;
};


const hasReasonableActivityCount = activities => activities.length >= config.get('analytics.min_period_activity_count');


const toCertainTimestamps = activity => {
    const date = new Date(1000 * activity.start_timestamp);
    const firstDayOfMonth = new Date(date.getUTCFullYear(), date.getUTCMonth(), 15);

    activity.start_timestamp = firstDayOfMonth.getTime() / 1000;
    return activity;
};


const toPoints = activity => ({
    timestamp: activity.start_timestamp,
    pace: activity.pace_m_km,
    distance: activity.distance_km
});


const pushPointTo = (points, point) => {
    point.paces = [ point.pace ];
    point.distances = [ point.distance ];
    points.push(point);
    return points;
};


const withSameTimestamp = (points, point) => {
    if (points.length == 0) {
        points = pushPointTo(points, point);
    }
    else {
        const lastPoint = points[points.length - 1];

        if (lastPoint.timestamp == point.timestamp) {
            lastPoint.paces.push(point.pace);         // add current activity's pace
            lastPoint.distances.push(point.distance); // add current activity's distance
        }
        else {
            points = pushPointTo(points, point);
        }
    }

    return points;
};


const toPointPack = point => {
    point.minPace = _.min(point.paces);
    point.avgPace = _.mean(point.paces);
    point.distance = Math.floor(_.sum(point.distances));
    delete point.paces;
    delete point.distances;
    return point;
};


const calculate = (athlete, activities) => {
    activities = activities
        .filter(isNotOutdated)
        .filter(hasReasonablePace)
        .sort(byTimestamp);

    var periods = activities
        .reduce(asPeriods, [[]])
        .filter(hasReasonableActivityCount)
        .map(activities => activities.map(toCertainTimestamps))
        .map(activities => activities.map(toPoints))
        .map(points => points.reduce(withSameTimestamp, []))
        .map(points => points.map(toPointPack));

    var points = _.flatten(periods),
        avgPaces = points.map(point => point.avgPace),
        minPaces = points.map(point => point.minPace),
        timestamps = points.map(point => point.timestamp);

    return {
        periods: periods,
        range: {
            pace: {
                min: Math.floor(_.min(minPaces) * 2) / 2, // round to nearest 0.5
                max: Math.ceil(_.max(avgPaces) * 2) / 2,  // round to nearest 0.5
                step: 0.5
            },
            timestamp: {
                min: _.min(timestamps),
                max: Math.floor(new Date().getTime() / 1000), // current date
                step: 60 * 60 * 24 * 30.5                     // avg. seconds in month
            }
        }
    };
};


module.exports = {
    allTime: calculate
};