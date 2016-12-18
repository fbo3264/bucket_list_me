const express = require('express');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const path = require('path');
const Promise = require('bluebird');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();
app.use(cookieParser());
app.use(expressSession({
    secret: 'actJustATestyTest',
    resave: false,
    saveUninitialized: false,
    rolling: true
}));

// GLOBALS declarations
global.appdir = __dirname;
global.appSecret = process.env.NODE_APP_SECRET;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


var port = process.env.PORT || 8080;


// =============================================================================

// REGISTER ROUTES FOR OUR API  -------------------------------
// set public folder
app.use('/public', express.static(path.join(__dirname, 'public')))
// all of the routes performing backend calls will be prefixed with /api
app.use('/api', require('./controllers/user/userController'));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
