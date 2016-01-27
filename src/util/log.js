var debug = require('console-debug');


var console = new debug({
    uncaughtExceptionCatch: true,
    logToFile:              true,
    colors:                 true,
    consoleFilter:          [],
    logFilter:              []
});


var logAppState = function(app, message) {
    console.info('Application ' + app + ': ' + message);
};

var logAthleteInfo = function(athlete, err, message) {
    if (message == undefined) {
        message = err;
        err = null;
    }

    if (err) {
        console.error(arguments);
    }
    else {
        console.info('Athlete ' + athlete.id + ' @ ' + athlete.service + ': ' + message);
    }
};


module.exports = {
    appState:    logAppState,
    athleteInfo: logAthleteInfo
};