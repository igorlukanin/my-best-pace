'use strict';


const getUtcHour = (activity) => new Date(activity.start_timestamp * 1000).getUTCHours();

const toLocalHour = (utcHour) => (utcHour + 6) % 24; // TODO: YEKT = GMT+6. Fix this

const calculate = (activities) =>activities
    .reduce((hours, activity) => {
        const hour = toLocalHour(getUtcHour(activity));
        hours[hour]++;
        return hours;
    }, new Array(24).fill(0)) // 24 hours in a day
    .map((count) => count / activities.length);


module.exports = calculate;