'use strict';


const distances = [
    { name: '5K',  min: 2.5,  real: 5.0,    max: 7.5 },
    { name: '10K', min: 7.5,  real: 10.0,   max: 15.0 },
    { name: '21K', min: 15.0, real: 21.095, max: 32.5 },
    { name: '42K',  min: 35.0, real: 42.190, max: Infinity }
];


module.exports = {
    distances: distances
};