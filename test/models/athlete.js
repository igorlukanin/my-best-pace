var util = require('../util'),
    expect = util.expect,

    athletes = require('../../src/models/athlete');


describe(util.path(), function() {
    before(function(done) {
        util.connect(this, done);
    });

    var athleteId = athletes.create({
        full_name: 'Usain Bolt',
        service: 'runtastic',
        service_id: 31337,
        raw_data: { abc: 123 }
    });

    describe('create', function() {
        it('should be resolved', function() {
            return expect(athleteId).to.be.fulfilled;
        });
    });

    var athleteInfo = athleteId.then(function(athleteId) {
        return athletes.load(athleteId);
    });

    describe('loadInfo', function() {
        it('should be resolved', function() {
            return expect(athleteInfo).to.be.fulfilled;
        });

        it('should retrieve correct full name', function() {
            return athleteInfo.then(function(athleteInfo) {
                return expect(athleteInfo.full_name).to.equal('Usain Bolt');
            });
        });

        it('should retrieve raw data', function() {
            return athleteInfo.then(function(athleteInfo) {
                return expect(athleteInfo.raw_data).to.contain({ abc: 123 });
            });
        });
    });

    var activityIds = athleteInfo.then(function(athleteInfo) {
        var activities = athletes.createActivities(athleteInfo, [{
            service: 'strava',
            service_id: 41146776,
            raw_data: { bcd: 234 }
        }, {
            service: 'strava',
            service_id: 41140076,
            raw_data: { cde: 345 }
        }]);

        return activities;
    });

    describe('createActivities', function() {
        it('should be resolved', function() {
            return expect(activityIds).to.be.fulfilled;
        });

        it('should return ids', function() {
            return activityIds.then(function(activityIds) {
                return expect(activityIds.length).to.equal(2);
            });
        });
    });

    var activityInfos = athleteInfo.then(function(athleteInfo) {
        return athletes.loadActivities(athleteInfo);
    });

    describe('loadActivities', function() {
        it('should be resolved', function() {
            return expect(activityInfos).to.be.fulfilled;
        });

        it('should resolve to array', function() {
            return activityInfos.then(function(activityInfos) {
                return expect(activityInfos).to.be.an('array');
            });
        });
    });

    describe('feedForUpdate', function() {
        var feed = athletes.feedForUpdate();

        it('should be resolved', function() {
            return expect(feed).to.be.fulfilled;
        });

        it('should return cursor', function() {
            return feed.then(function(cursor) {
                return expect(cursor.each).to.be.a('function');
            });
        });
    });
});