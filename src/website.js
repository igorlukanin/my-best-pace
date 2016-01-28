var compression = require('compression'),
    config      = require('config'),
    ect         = require('ect'),
    express     = require('express'),

    controllers = require('./controllers'),
    log         = require('./util/log'),

    port        = config.get('server.port');


process.on('uncaughtException', function(err) {
    console.error(err.stack);
});

express()
    .use('/static', express.static('static'))
    .use('/static/js/d3', express.static('node_modules/d3'))

    .use(compression())
    .use(controllers)

    .set('view engine', 'ect')
    .engine('ect', ect({
        watch: true,
        root: __dirname + '/../views'
    }).render)

    .listen(port, function() {
        log.appState('website', 'started at port ' + port);
    });