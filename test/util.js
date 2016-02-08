var chai = require('chai'),
    chai_as_promised = require('chai-as-promised'),
    path = require('path'),
    Traceback = require('traceback'),

    db = require('../src/util/db'),

    dbConnectTimeout = 10000;


chai.use(chai_as_promised);
chai.should();


var getPath = function() {
    var stack = new Traceback(),
        callerPath = stack[1].path;

    return path.relative(__dirname, callerPath);
};


var connectToDatabase = function(mocha, done) {
    mocha.timeout(dbConnectTimeout);

    db.c.then(function() {
        done();
    });
};


module.exports = {
    expect: chai.expect,
    path: getPath,
    connect: connectToDatabase
};