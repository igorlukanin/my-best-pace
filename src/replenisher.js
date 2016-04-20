var athletes = require('./models/athlete'),
    log = require('./util/log');


process.on('uncaughtException', (err) => console.error(err.stack));
require('promise/lib/rejection-tracking').enable({ allRejections: true });


log.appState('replenisher', 'started');

athletes
    .feedForUpdate()
    .then((cursor) => cursor.each((err, result) => {
        var athleteInfo = result.new_val;
        log.athleteInfo(athleteInfo, 'updating activities...');

        athletes.updateActivities(athleteInfo);
    }))
    .catch((err) => console.error(err));