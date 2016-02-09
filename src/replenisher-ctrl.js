var childProcess      = require('child_process'),
    config            = require('config'),

    log               = require('./util/log'),

    restartIntervalMs = config.get('replenisher-ctrl.restart_interval_ms');


process.on('uncaughtException', function(err) {
    console.error(err.stack);
});

require('promise/lib/rejection-tracking').enable({
    allRejections: true
});


var children = [];

var restartChild = function() {
    // Start new child
    children.push(childProcess.fork(__dirname + '/replenisher'));

    log.appState('replenisher-ctrl', 'child spawned, now ' + children.length + ' child(ren)');

    // Stop old child
    if (children.length > 1) {
        children.shift().kill();

        log.appState('replenisher-ctrl', 'child stopped, now ' + children.length + ' child');
    }
};

restartChild();
setInterval(restartChild, restartIntervalMs);

log.appState('replenisher-ctrl', 'started');