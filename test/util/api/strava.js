var util = require('../../util'),
    expect = util.expect,

    config = require('config'),
    url = require('url'),

    client = require('../../../src/util/api/strava');


describe(util.path(), function() {
    describe('getOAuthRedirectUrl', function() {
        var redirectUrl = url.parse(client.getOAuthRedirectUrl(), true),
            query = redirectUrl.query;

        it('should return URL with correct client_id', function() {
            expect(query.client_id).to.be.ok;
            expect(parseInt(query.client_id)).to.be.ok;
        });

        it('should return URL with correct redirect_uri', function() {
            expect(query.redirect_uri).to.be.ok;
            expect(url.parse(query.redirect_uri)).to.be.an('object');
        });

        it('should return URL with response_type = code', function() {
            expect(query.response_type).to.be.ok;
            expect(query.response_type).to.equal('code');
        });

        it('should return URL with scope = public', function() {
            expect(query.scope).to.be.ok;
            expect(query.scope).to.equal('public');
        });
    });

    var accessToken = config.get('strava.athlete_access_token'),
        athleteInfo = client.loadAthleteInfo(accessToken);

    describe('loadAthleteInfo', function() {
        it('should be resolved', function() {
            return expect(athleteInfo).to.be.fulfilled;
        });

        it('should contain full name', function() {
            return athleteInfo.then(function(athleteInfo) {
                return expect(athleteInfo.full_name).to.be.ok;
            });
        });

        it('should contain access token', function() {
            return athleteInfo.then(function(athleteInfo) {
                return expect(athleteInfo.access_token).to.be.ok;
            });
        });

        it('should contain service name', function() {
            return athleteInfo.then(function(athleteInfo) {
                return expect(athleteInfo.service).to.be.ok;
            });
        });

        it('should contain service-specific id of athlete', function() {
            return athleteInfo.then(function(athleteInfo) {
                return expect(athleteInfo.service_id).to.be.ok;
            });
        });

        it('should contain raw data', function() {
            return athleteInfo.then(function(athleteInfo) {
                return expect(athleteInfo.raw_data).to.be.ok;
            });
        });
    });

    describe('loadNewActivitiesAndUpdateAthlete', function() {
        var activitiesPack = athleteInfo.then(function(athleteInfo) {
            return client.loadNewActivitiesAndUpdateAthlete(athleteInfo);
        });

        it('should be resolved', function() {
            return expect(activitiesPack).to.be.fulfilled;
        });

        it('should be an array', function() {
            return activitiesPack.then(function(activitiesPack) {
                return expect(activitiesPack).to.have.keys([ 'athleteInfo', 'activityInfos' ]);
            });
        });
    });
});