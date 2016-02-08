var athletes = require('./models/athlete'),
    log      = require('./util/log');


process.on('uncaughtException', function(err) {
    console.error(err.stack);
});

log.appState('replenisher', 'started');

athletes
    .feedForUpdate()
    .then(function(cursor) {
        cursor.each(function(err, result) {
            var athleteInfo = result.new_val;
            log.athleteInfo(athleteInfo, 'updating activities...');

            athletes.updateActivities(athleteInfo);
        });
    }, function(err) {
        console.error(err);
    });