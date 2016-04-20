var config = require('config'),
    Promise = require('promise'),
    r = require('rethinkdb'),

    tables = [ 'athletes', 'activities' ];


var options = {
    host: config.get('rethinkdb.host'),
    port: config.get('rethinkdb.port'),
    db: config.get('rethinkdb.db')
};


var connect = () => {
    var c = r.connect(options);

    if (process.env.NODE_ENV == 'test') {
        c = dropAndCreateForTests(c);
    }

    return c;
};


var dropAndCreateForTests = (conn) => conn.then((c) => new Promise((resolve, reject) => {
    r.dbDrop(options.db).run(c, () => {
        // It doesn't matter whether database existed or not, so ignore 'err'
        r.dbCreate(options.db).run(c, (err) => {
            if (err) {
                reject(err);
            }
            else {
                r.db(options.db).wait().run(c);

                r.expr(tables).forEach(
                    r.db(options.db).tableCreate(r.row)
                ).run(c, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        r.expr(tables).forEach(r.db(options.db).table(r.row).wait()).run(c);
                        resolve(c);
                    }
                });
            }
        });
    });
}));


module.exports = {
    r: r,
    c: connect()
};

tables.forEach((table) => module.exports[table] = r.table(table));