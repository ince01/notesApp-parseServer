var express = require('express');
var bodyParser = require('body-parser');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');

var databaseUri = 'mongodb://localhost:27017/notes-app';

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/notes-app',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'notesApp',
  masterKey: process.env.MASTER_KEY || '123',
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  liveQuery: {
    classNames: ["Posts", "Comments"]
  }
});

var options = { allowInsecureHTTP: false };

var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "notesApp",
      "masterKey": "123",
      "appName": "Notes App"
    }
  ]
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

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
  console.log('parse-server-example running on port ' + port + '.');
});

ParseServer.createLiveQueryServer(httpServer);