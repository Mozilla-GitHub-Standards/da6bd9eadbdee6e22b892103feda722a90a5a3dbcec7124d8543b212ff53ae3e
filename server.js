var express = require('express');
var habitat = require('habitat');
var path = require('path');
var fs = require('fs');

habitat.load();

var env = habitat();
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/components', express.static(path.join(__dirname, 'components')));

app.use(express.bodyParser());
app.use(express.logger());

app.get('/package/:components', function (req, res) {
  var components = req.params.components.split('+');

  function collectAndSendComponentData () {
    var packagedData = '';
    if (components.length) {
      var todo = components.length;
      components.forEach(function (name) {
        var componentPath = path.join(__dirname, 'components', name);
        fs.readFile(componentPath, 'utf-8', function (err, data) {
          if (!err) {
            packagedData += '\n' + data;
          }
          if (--todo === 0) {
            res.send(packagedData, 200);
          }
        });
      });
    }
    else {
      res.send('', 200);
    }
  }

  if (components.length === 1 && components[0] === 'all') {
    fs.readdir(path.join(__dirname, 'components'), function (err, files) {
      components = files;
      collectAndSendComponentData();
    });
  }
  else {
    components = components.map(function (name) {
      return name + '.html';
    });
    collectAndSendComponentData();
  }
});

var server = app.listen(env.get('PORT'), function (err) {
  console.log('Running on', server.address());
});
