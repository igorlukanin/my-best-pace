var compression = require('compression'),
    config      = require('config'),
    ejs         = require('ejs'),
    express     = require('express'),

    port        = config.get('server.port');


process.on('uncaughtException', function(err) {
    console.error(err.stack);
});

express()
    .use(express.static('public'))
    .use(compression())

    .get('/', function(req, res) {
        res.render('index');
    })

    .set('view engine', 'ejs')

    .listen(port, function() {
        console.log("my-best-pace-website started at port " + port);
    });
