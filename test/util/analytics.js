var util = require('../util'),
    expect = util.expect,

    analytics = require('../../src/util/analytics');


describe(util.path(), function() {
    describe('calculateDistanceGroup', function() {
        var activities = [{
            distance_km: 0.4,
            distance_group: '0k'
        }, {
            distance_km: 9.5,
            distance_group: '10k'
        }, {
            distance_km: 26.3,
            distance_group: '30k'
        }, {
            distance_km: 201.0,
            distance_group: '00k'
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
                { start_timestamp: 1234 },
                { start_timestamp: 4567 },
                { start_timestamp: 6789 }
            ]);

            expect(actual).to.be.an('object');
            expect(actual.min_timestamp).to.equal(1234);
            expect(actual.max_timestamp).to.equal(6789);
        });

        it('should be zero if there are no activities', function() {
            var actual = analytics.calculateDateStats([]);

            expect(actual).to.be.an('object');
            expect(actual.min_timestamp).to.equal(0);
            expect(actual.max_timestamp).to.equal(0);
        });
    });
});