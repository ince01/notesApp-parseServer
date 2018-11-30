var express = require('express');
var bodyParser = require('body-parser');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');

var databaseUri = 'mongodb://admin:admin123@ds119164.mlab.com:19164/notes-app';

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/notes-app',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'notesApp',
  masterKey: process.env.MASTER_KEY || '123',
  serverURL: process.env.SERVER_URL || 'http://localhost:3000/parse',
  liveQuery: {
    classNames: ["Posts", "Comments"]
  },
  verbose: true,
  
  verifyUserEmails: true,

  emailVerifyTokenValidityDuration: 2 * 60 * 60,
  preventLoginWithUnverifiedEmail: true,

  publicServerURL: 'http://localhost:3000/parse',
  appName: 'Notes App',
  emailAdapter: {
    module: '@parse/simple-mailgun-adapter',
    options: {
      fromAddress: 'parse@example.com',
      domain: 'sandbox8a3dc39562e147adbe440f1a6450f7b4.mailgun.org',
      apiKey: '537012b22b31e3da06882adefcd46863-059e099e-7a104fbc',
    }
  },

  accountLockout: {
    duration: 5,
    threshold: 3,
  },
  passwordPolicy: {
    validatorPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
    doNotAllowUsername: true,
    maxPasswordAge: 90,
    maxPasswordHistory: 5,
    resetTokenValidityDuration: 24 * 60 * 60,
  },

  
});

var options = { allowInsecureHTTP: false };
var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:3000/parse",
      "appId": "notesApp",
      "masterKey": "123",
      "appName": "Notes App"
    }
  ],
  "trustProxy": 1,
  "users": [
    {
      "user": "admin",
      "pass": "$2y$12$XyFlQNEODAsyBloL80SsgOK0IT9kz6rsEIyF6IX9qi0lRNXpzss76"
    }
  ],
  "useEncryptedPasswords": true
}, options);

var app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.use('/dashboard', dashboard);

app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.');
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
  console.log(`Notes App running on port ${app.get('port')}...`);
});

// var port = process.env.PORT || 3000;
// var httpServer = require('http').createServer(app);
// httpServer.listen(port, function () {
//   console.log('parse-server-example running on port ' + port + '.');
// });

ParseServer.createLiveQueryServer(app);