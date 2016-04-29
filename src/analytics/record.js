'use strict';

const _ = require('lodash');
const config = require('config');
const util = require('./util');


const realRatio = 0.9;


const getStrictDistance = (activity) => {
    var d = undefined;

    util.distances.forEach(function(distance) {
        if (activity.distance_km >= distance.real * realRatio && activity.distance_km < distance.max) {
            d = distance;
        }
    });

    return d;
};


const isNotOutdated = activity => {
    var period = config.get('analytics.window_period_ms');
    return activity.start_timestamp > (new Date().getTime() - period) / 1000;
};


// 1 km world record is 2:11.96
// 7+ km/h is walking, not running
const hasReasonablePace = activity => activity.pace_m_km > 2 && activity.pace_m_km < 7;


const asRecords = (records, activity) => {
    var distance = getStrictDistance(activity);

    if (distance != undefined) {
        var time = activity.time_m * distance.real / activity.distance_km;

        if (records[distance.name] > time || records[distance.name] == undefined) {
            records[distance.name] = time;
        }
    }

    return records;
};


const formatPace = function(pace) {
    var hours = Math.floor(pace / 60),
        minutes = Math.floor(pace - hours * 60),
        seconds = Math.floor(60 * (pace - hours * 60 - minutes));

    return (hours > 0 ? hours + ':' : '') +
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (seconds < 10 ? '0' : '') + seconds;
};


const calculate = (activities) => {
    var records = activities
        .filter(isNotOutdated)
        .filter(hasReasonablePace)
        .reduce(asRecords, {});

    records = _.sortBy(Object
        .keys(records)
        .map((label) => ({
            id: label,
            label: label,
            time: formatPace(records[label]),
            time_m: records[label]
        })), 'time_m');

    return [{
        id: 'all',
        label: 'All',
        time: '0',
        time_m: 0
    }].concat(records);
};


module.exports = {
    calculate: calculate
};