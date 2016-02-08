var Promise = require('promise'),

    db = require('../util/db'),
    log = require('../util/log'),

    clients = {
        runkeeper: require('../util/api/runkeeper'),
        strava: require('../util/api/strava')
    };


var createUniqueId = function(entity) {
    return entity.service + '_' + entity.service_id;
};


var createEntityId = function(entity) {
    return db.c.then(function(c) {
        return db.r.uuid(createUniqueId(entity)).run(c);
    });
};


var createEntityIds = function(entities) {
    return db.c.then(function(c) {
        return db.r.expr(entities.map(createUniqueId)).map(function(row) {
            return db.r.uuid(row);
        }).run(c);
    });
};


var prepareForInsert = function(entity, id) {
    entity.id = id;
    entity.creation_date = db.r.now();

    return entity;
};


var prepareForInsertArray = function(entities, ids) {
    return entities.map(function(entity, i) {
        return prepareForInsert(entity, ids[i]);
    });
};


var createAthlete = function(athleteInfo) {
    return db.c.then(function(c) {
        return createEntityId(athleteInfo)
            .then(function(athleteId) {
                var athleteForInsert = prepareForInsert(athleteInfo, athleteId);

                return db.athletes
                    .insert(athleteForInsert, { conflict: 'update' }).run(c)
                    .then(function() {
                        return athleteId;
                    });
            });
    });
};


var loadAthlete = function(athleteId) {
    return db.c.then(function(c) {
        return db.athletes
            .get(athleteId).run(c)
            .then(function(athleteInfo) {
                if (athleteInfo == null) {
                    return Promise.reject(athleteId);
                }

                return athleteInfo;
            });
    });
};


var createActivities = function(athleteInfo, activityInfos) {
    return db.c.then(function(c) {
        return createEntityIds(activityInfos)
            .then(function(activityIds) {
                var activitiesForInsert = prepareForInsertArray(activityInfos, activityIds),
                    activitiesForInsertWithAthleteId = activitiesForInsert.map(function(activityInfo) {
                    activityInfo.athlete_id = athleteInfo.id;

                    return activityInfo;
                });

                return db.activities
                    .insert(activitiesForInsertWithAthleteId, { conflict: 'replace' }).run(c)
                    .then(function() {
                        return activityIds;
                    });
            });
    });
};


var loadActivities = function(athleteInfo) {
    return db.c.then(function(c) {
        return db.activities
            .filter({ athlete_id: athleteInfo.id }).run(c)
            .then(function(cursor) {
                return cursor.toArray();
            });
    });
};


var feedAthletesToBeUpdated = function() {
    return db.c.then(function (c) {
        return db.athletes.changes({ includeInitial: true }).run(c);
    });
};


var updateAthleteActivities = function(athleteInfo) {
    var client = clients[athleteInfo.service];

    return client.loadNewActivitiesAndUpdateAthlete(athleteInfo)
        .then(function(activitiesPack) {
            log.athleteInfo(activitiesPack.athleteInfo, activitiesPack.activityInfos.length + ' new activities');

            return Promise.all([
                createActivities(activitiesPack.athleteInfo, activitiesPack.activityInfos),
                db.c.then(function(c) {
                    return db.athletes.get(athleteInfo.id).replace(activitiesPack.athleteInfo).run(c);
                })
            ]);
        });
};


module.exports = {
    create: createAthlete,
    load: loadAthlete,
    createActivities: createActivities,
    loadActivities: loadActivities,
    feedForUpdate: feedAthletesToBeUpdated,
    updateActivities: updateAthleteActivities
};