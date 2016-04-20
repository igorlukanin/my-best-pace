'use strict';

const config = require('config');


const getUtcDay = (activity) => (new Date(activity.start_timestamp * 1000).getUTCDay() + 6) % 7; // Now Monday is 0

const toLocalDay = (utcDay) => utcDay; // TODO: Fix this

const calculate = (activities) =>activities
    .reduce((days, activity) => {
        const day = toLocalDay(getUtcDay(activity));
        days[day]++;
        return days;
    }, new Array(7).fill(0)) // 7 days in a week
    .map((count) => count / activities.length);

const calculateRecent = (activities) => calculate(activities
    .filter((activity) => {
        const delta = config.get('analytics.recent_period_ms');
        return new Date().getTime() - activity.start_timestamp * 1000 < delta;
    }));


module.exports = {
    allTime: calculate,
    recent: calculateRecent
};