var Promise = require('promise'),

    db = require('../util/db'),
    log = require('../util/log'),

    clients = {
        runkeeper: require('../util/api/runkeeper'),
        strava: require('../util/api/strava')
    };


var createUniqueId = (entity) => entity.service + '_' + entity.service_id;

var createEntityId = (entity) => db.c.then((c) => db.r.uuid(createUniqueId(entity)).run(c));

var createEntityIds = (entities) => db.c.then((c) => db.r.expr(entities.map(createUniqueId)).map((row) => db.r.uuid(row)).run(c));

var prepareForInsert = (entity, id) => {
    entity.id = id;
    entity.creation_date = db.r.now();

    return entity;
};

var prepareForInsertArray = (entities, ids) => entities.map((entity, i) => prepareForInsert(entity, ids[i]));

var createAthlete = (athleteInfo) => db.c.then((c) => createEntityId(athleteInfo).then((athleteId) => {
    var athleteForInsert = prepareForInsert(athleteInfo, athleteId);

    return db.athletes
        .insert(athleteForInsert, {conflict: 'update'}).run(c)
        .then(() => athleteId);
}));

var loadAthlete = (athleteId) => db.c.then((c) => db.athletes
    .get(athleteId).run(c)
    .then((athleteInfo) => {
        if (athleteInfo == null) {
            return Promise.reject({
                message: 'Athlete not found',
                athleteId: athleteId
            });
        }
    
        return athleteInfo;
    }));

var createActivities = (athleteInfo, activityInfos) => db.c.then((c) => createEntityIds(activityInfos)
    .then((activityIds) => {
        var activitiesForInsert = prepareForInsertArray(activityInfos, activityIds),
            activitiesForInsertWithAthleteId = activitiesForInsert.map((activityInfo) => {
                activityInfo.athlete_id = athleteInfo.id;
    
                return activityInfo;
            });

        return db.activities
            .insert(activitiesForInsertWithAthleteId, { conflict: 'replace' }).run(c)
            .then(() => activityIds);
    }));

var loadActivities = (athleteInfo) => db.c.then((c) => db.activities
    .filter({ athlete_id: athleteInfo.id }).run(c)
    .then((cursor) => cursor.toArray()));

var feedAthletesToBeUpdated = () => db.c.then((c) => db.athletes.changes({ includeInitial: true }).run(c));

var updateAthleteActivities = (athleteInfo) => {
    var client = clients[athleteInfo.service];

    return client.loadNewActivitiesAndUpdateAthlete(athleteInfo)
        .then((activitiesPack) => {
            log.athleteInfo(activitiesPack.athleteInfo, activitiesPack.activityInfos.length + ' new activities');

            return Promise.all([
                createActivities(activitiesPack.athleteInfo, activitiesPack.activityInfos),
                db.c.then((c) => db.athletes.get(athleteInfo.id).replace(activitiesPack.athleteInfo).run(c))
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