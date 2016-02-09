var util = require('../util'),
    expect = util.expect,

    analytics = require('../../src/util/analytics');


describe(util.path(), function() {
    var athleteInfo = {},
        activityInfos = require('./analytics-activities.json');

    describe('calculate', function() {
        //it('should be resolved', function() {
        //    return expect(athleteId).to.be.fulfilled;
        //});
    });

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

    describe('calculateDistanceGroupStats', function() {
        var distanceGroupNames = [ '0k', '1k', '3k', '5k', '8k', '10k', '16k', '21k', '30k', '42k', '00k' ];

        it('should have all distance groups', function() {
            var actual = analytics.calculateDistanceGroupStats([]);

            distanceGroupNames.forEach(function(name) {
                expect(actual[name]).to.be.ok;
            });
        });

        it('should have zero counts and ratios if there are no activities', function() {
            var actual = analytics.calculateDistanceGroupStats([]);

            expect(actual['10k']).to.be.ok;
            expect(actual['10k'].count).to.be.equal(0);
            expect(actual['10k'].ratio).to.be.equal(0);
        });

        it('should have correct count and ratio', function() {
            var actual = analytics.calculateDistanceGroupStats([
                { distance_group: '8k' },
                { distance_group: '8k' },
                { distance_group: '8k' },
                { distance_group: '21k' }
            ]);

            expect(actual['8k']).to.be.ok;
            expect(actual['10k']).to.be.ok;
            expect(actual['21k']).to.be.ok;

            expect(actual['8k'].count).to.be.equal(3);
            expect(actual['10k'].count).to.be.equal(0);
            expect(actual['21k'].count).to.be.equal(1);

            expect(actual['8k'].ratio).to.be.equal(0.75);
            expect(actual['10k'].ratio).to.be.equal(0);
            expect(actual['21k'].ratio).to.be.equal(0.25);
        });
    });

    describe('calculateMostFrequentDistanceGroupStats', function() {
        it('should be correct', function() {
            var actual = analytics.calculateMostFrequentDistanceGroupStats({
                '0k': { ratio: 0.06 },
                '1k': { ratio: 0.03 },
                '3k': { ratio: 0.09 },
                '5k': { ratio: 0.23 },
                '8k': { ratio: 0.29 },
                '10k': { ratio: 0.19 },
                '16k': { ratio: 0.08 },
                '21k': { ratio: 0.04 },
                '30k': { ratio: 0.01 },
                '42k': { ratio: 0 },
                '00k': { ratio: 0 }
            });

            expect(actual).to.be.an('array');
            expect(actual.length).to.be.equal(3);
            expect(actual).to.have.members([ '5k', '8k', '10k' ]);
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
});