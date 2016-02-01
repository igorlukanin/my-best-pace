var config = require('config'),
    runkeeper = require('runkeeper-js');


var client = new runkeeper.HealthGraph({
    client_id:     config.get("runkeeper.client_id"),
    client_secret: config.get("runkeeper.client_secret"),
    redirect_uri:  config.get("runkeeper.redirect_uri")
});

client.getRequestAccessURL = function() {
    return client.auth_url +
        '?client_id=' + client.client_id +
        '&response_type=code' +
        '&redirect_uri=' + client.redirect_uri;
};


module.exports = client;