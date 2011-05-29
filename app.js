
/**
 * Module dependencies.
 */

var express = require('express'),
    app     = module.exports = express.createServer()
    songs   = {}; // { code : { url: <url>, time: <time>}}

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/(:code)?', function(req, res){
  if( (url = req.param('url')) ) {
    code = 'MHD' // TODO make dynamic code
    songs[code] = { url: url, time: serverTime()}
    res.redirect('/' + code);
  }
  else {
    if( !(song = songs[req.param('code')]) ) {
      res.render('index', {});
    }
    else {
      if( req.param('reset') ) {
        songs[code] = { url: song.url, time: serverTime()}
      }
      res.render('play', {
        url: encodeURIComponent(song.url ) + '&enable_api=true&object_id=scPlayer',
        code: req.param('code'),
        interval: req.param('int', 1000)
      });
    }
  }
});
app.listen(3000);

serverTime = function(offset) {
  offset = offset ? offset : 0;
  return (new Date).getTime() - offset;
}

var socket = require('socket.io').listen(app);
socket.on('connection', function(client){
  client.on('message', function(message){
    if( message.cmd == 'getTime' && ( song = songs[message.songCode]) ){
      client.send({cmd: message.cmd, songtime: serverTime(song.time), servertime: serverTime() });
    }
  });

  //client.on('disconnect', function(){ … })
});


console.log("Express server listening on port %d", app.address().port);
