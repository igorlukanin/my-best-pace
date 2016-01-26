var db   = require('../util/db');


var createAthleteId = function(service, data, cb) {
    var id =
        service == 'strava' ? data.athlete.id :
        db.r.uuid(); // This branch should be unreachable

    var uniqueId = service + '_' + id;

    db.c.then(function(c) {
        db.r.uuid(uniqueId).run(c, function(err, result) {
            cb(result);
        });
    });
};

var createAthlete = function(service, data, cb) {
    db.c.then(function(c) {
        createAthleteId(service, data, function(id) {
            db.athletes.insert({
                id:      id,
                service: service,
                data:    data
            }, {
                conflict: 'update'
            }).run(c, function(err, result) {
                cb(id);
            });
        });
    });
};

var getAthlete = function(id, cb) {
    db.c.then(function(c) {
        db.athletes.get(id).run(c, cb);
    });
};


module.exports = {
    create: createAthlete,
    select: getAthlete
};