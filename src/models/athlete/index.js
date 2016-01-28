var config           = require('config'),
    moment           = require('moment'),

    athleteInfos     = require('../athlete-info'),
    db               = require('../../util/db'),

    initialTimestamp = config.get('services.initial_timestamp'),

    helpers = {
        strava: require('./strava')
    };


var createAthleteId = function(service, data, cb) {
    var uniqueId = service + '_' + helpers[service].getId(data);

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
                id:            id,
                service:       service,
                data:          data,
                creation_date: db.r.now()
            }, {
                conflict: 'update'
            }).run(c, function(err, result) {
                cb(id);
            });
        });
    });
};

var getAthleteInfo = function(id, cb) {
    db.c.then(function(c) {
        db.athletes.get(id).run(c, function(err, athlete) {
            if (err) {
                cb(err);
            }
            else if (athlete == null) {
                cb({
                    athlete_id: id,
                    message:    'Athlete not found'
                });
            }
            else {
                db.activities.filter({
                    athlete_id: id
                }).run(c, function(err, activities) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        activities.toArray(function(err, activitiesArray) {
                            if (err) {
                                cb(err);
                            }
                            else {
                                cb(err, athleteInfos.create(athlete, activitiesArray));
                            }
                        });
                    }
                });
            }
        });
    });
};

var feedAthletesToBeUpdated = function(cb) {
    db.c.then(function(c) {
        db.athletes.changes({
            includeInitial: true
        }).run(c, function(err, cursor) {
            cursor.each(cb);
        });
    });
};

var updateAthleteActivities = function(athlete, cb) {
    var latestTimestamp = athlete.activities_update_date
        ? moment(athlete.activities_update_date).unix()
        : initialTimestamp;

    helpers[athlete.service].getNewActivities(athlete, latestTimestamp, function(err, bareActivities) {
        if (err) {
            cb(err);
        }
        else {
            var activities = bareActivities.map(function(activity) {
                latestTimestamp = Math.max(latestTimestamp, moment(activity.start_date).unix());

                return {
                    athlete_id: athlete.id,
                    service:    athlete.service,
                    data:       activity
                };
            });

            db.c.then(function(c) {
                db.activities.insert(activities, {
                    conflict: 'update'
                }).run(c, function(err, result) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        db.athletes.get(athlete.id).update({
                            activities_update_date: db.r.epochTime(latestTimestamp)
                        }).run(c, cb);
                    }
                });
            });
        }
    });
};


module.exports = {
    create:           createAthlete,
    getInfo:          getAthleteInfo,
    feedForUpdate:    feedAthletesToBeUpdated,
    updateActivities: updateAthleteActivities
};