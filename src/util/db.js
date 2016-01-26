var config    = require('config'),
    rethinkdb = require('rethinkdb');


var options = {
    host: config.get('rethinkdb.host'),
    port: config.get('rethinkdb.port'),
    db:   config.get('rethinkdb.db')
};


module.exports = {
    r:          rethinkdb,
    c:          rethinkdb.connect(options),
    athletes:   rethinkdb.table('athletes'),
    activities: rethinkdb.table('activities')
};