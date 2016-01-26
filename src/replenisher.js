var athletes = require('./models/athlete'),
    log      = require('./util/log');


process.on('uncaughtException', function(err) {
    console.error(err.stack);
});

console.log("replenisher started");

athletes.feedForUpdate(function(err, result) {
    // It's safe to ignore 'err' here
    var athlete = result.new_val;

    log.athleteInfo(athlete, 'updating activities...');

    athletes.updateActivities(athlete, function (err, result) {
        if (err) {
            throw err;
        }

        log.athleteInfo(athlete, 'all activities up to date')
    });
});