'use strict';

const _ = require('lodash');
const config = require('config');


const distances = [
    { name: '5K',  min: 2.5,  real: 5.0,    max: 7.5 },
    { name: '10K', min: 7.5,  real: 10.0,   max: 15.0 },
    { name: 'HM', min: 15.0, real: 21.095, max: 32.5 },
    { name: 'M',  min: 35.0, real: 42.190, max: Infinity }
];


const getStrictDistanceLabel = (activity) => {
    var label = undefined;

    distances.forEach(function(distance) {
        if (activity.distance_km >= distance.real && activity.distance_km < distance.max) {
            label = distance.name;
        }
    });

    return label;
};


const isNotOutdated = activity => {
    var period = config.get('analytics.window_period_ms');
    return activity.start_timestamp > (new Date().getTime() - period) / 1000;
};


// 1 km world record is 2:11.96
// 7+ km/h is walking, not running
const hasReasonablePace = activity => activity.pace_m_km > 2 && activity.pace_m_km < 7;


const asRecords = (records, activity) => {
    var label = getStrictDistanceLabel(activity);

    if (label != undefined && (records[label] > activity.time_m || records[label] == undefined)) {
        records[label] = activity.time_m;
    }

    return records;
};


const formatPace = function(pace) {
    var hours = Math.floor(pace / 60),
        minutes = Math.floor(pace - hours * 60),
        seconds = Math.floor(60 * (pace - hours * 60 - minutes));

    return (hours > 0 ? hours + ':' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};


const calculate = (activities) => {
    var records = activities
        .filter(isNotOutdated)
        .filter(hasReasonablePace)
        .reduce(asRecords, {});

    return _.sortBy(Object
        .keys(records)
        .map((label) => ({
            label: label,
            time: formatPace(records[label]),
            time_m: records[label]
        })), 'time_m');
};


module.exports = {
    calculate: calculate
};