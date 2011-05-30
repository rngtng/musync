
/**
 * Module dependencies.
 */

var express   = require('express'),
    app       = module.exports = express.createServer()
    songs     = {}, // { code : { url: <url>, time: <time>}}
    serverUrl = 'normannenstrasse.mine.nu' //'localhost'
    interval  = 5000,
    port      = 3000;

// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// Routes
app.get('/show/:code', function(req, res) {
  url = (req.headers.referer.indexOf('localhost') > 0) ? 'localhost' : serverUrl;
  res.render('show', {
    code: req.param('code'),
    url: 'http://' + url + ':' + port
  });
});

app.get('/:code', function(req, res) {
  if( (song = songs[req.param('code')]) ) {
    if( req.param('reset') ) {
       songs[code].time = null
     }
     res.render('play', {
       url: encodeURIComponent(song.url) + '&enable_api=true&object_id=scPlayer',
       code: req.param('code'),
       interval: req.param('int', interval)
     });
  }
  else {
    res.redirect('/');
  }
});

app.get('/', function(req, res) {
  if( (url = req.param('url')) ) {

    code = req.param('code', getCode());
    while(songs[code]) { //try again if code exists
      code = getCode();
    }

    songs[code] = { url: url, time: null}
    res.redirect('/show/' + code);
  }
  else {
    res.render('index', {});
  }
});
app.listen(port);

serverTime = function(offset) {
  offset = offset ? offset : 0;
  return (new Date).getTime() - offset;
}

getCode = function() {
  var chars  = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      length = 4,
      code   = '';

  for(var i = 0; i < length; i++) {
    var index = Math.floor(Math.random() * chars.length);
    code = code + chars[index];
  }
  return code;
}

var socket = require('socket.io').listen(app);
socket.on('connection', function(client) {
  client.on('message', function(message) {
    if( message.cmd == 'getTime' && ( song = songs[message.songCode]) ) {
      if(!song.time) { //set timestamp when first time requested
        song.time = songs[message.songCode].time = serverTime();
      }
      client.send({cmd: message.cmd, songtime: serverTime(song.time), servertime: serverTime() });
    }
  });

  //client.on('disconnect', function() { … })
});


console.log("Express server listening on port %d", app.address().port);
