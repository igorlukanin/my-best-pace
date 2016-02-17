var util = require('../util'),
    expect = util.expect,

    analytics = require('../../src/util/analytics');


describe(util.path(), function() {
    describe('calculateDistanceGroup', function() {
        var activities = [{
            start_timestamp: 1447995168, // 20 Nov 2015
            date_group: 1446318000       // 01 Nov 2015
        }, {
            start_timestamp: 1449744425, // 10 Dec 2015
            date_group: 1448910000       // 01 Dec 2015
        }, {
            start_timestamp: 1452620547, // 12 Jan 2016
            date_group: 1451588400       // 01 Jan 2016
        }, {
            start_timestamp: 1455006949, // 09 Feb 2016
            date_group: 1454266800       // 01 Feb 2016
        }, {
            start_timestamp: 1455549927, // 15 Feb 2016
            date_group: 1454266800       // 01 Feb 2016
        }];

        var stats = analytics.calculateDateStats(activities);

        activities.forEach(function(activity) {
            it('should calculate correctly for ' + activity.start_timestamp, function() {
                var actual = analytics.calculateDateGroup(activity, stats);

                expect(actual).to.equal(activity.date_group);
            });
        });
    });

    describe('calculateDateGroup', function() {
        var activities = [{
            distance_km: 0.4,
            distance_group: '0'
        }, {
            distance_km: 9.5,
            distance_group: '10'
        }, {
            distance_km: 26.3,
            distance_group: '30'
        }, {
            distance_km: 201.0,
            distance_group: '42+'
        }];

        activities.forEach(function(activity) {
            it('should calculate correctly for ' + activity.distance_km, function() {
                var actual = analytics.calculateDistanceGroup(activity);

                expect(actual).to.equal(activity.distance_group);
            });
        });
    });

    describe('calculatePace', function() {
        it('should be correct', function() {
            var actual = analytics.calculatePace({
                distance_km: 10.2,
                time_m: 48.5
            });

            expect(actual).to.be.within(4.7, 4.8);
        });
    });

    describe('calculateDateStats', function() {
        it('should be correct', function() {
            var actual = analytics.calculateDateStats([
                { start_timestamp: 1447995168 },
                { start_timestamp: 1449744425 },
                { start_timestamp: 1452620547 }
            ]);

            expect(actual).to.be.an('object');
            expect(actual.min_timestamp).to.equal(1446318000);
            expect(actual.max_timestamp).to.equal(1452620547);
        });

        it('should be zero if there are no activities', function() {
            var actual = analytics.calculateDateStats([]);

            expect(actual).to.be.an('object');
            expect(actual.min_timestamp).to.equal(0);
            expect(actual.max_timestamp).to.equal(0);
        });
    });
});