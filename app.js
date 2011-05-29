
/**
 * Module dependencies.
 */

var express = require('express'),
    app = module.exports = express.createServer();

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

pos = (new Date).getTime();
u = 'plainstudios%2Fshort-records-rock';

app.get('/counter/(:steps)?', function(req, res){
  res.render('counter_io', {
    title: 'Express',
    steps: req.param( 'steps', 100 )
  });
});

app.get('/(:steps)?', function(req, res){
  if(req.param('pos')) {
    pos = (new Date).getTime();
  }
  res.render('index', {
    title: 'Express',
    url: 'http%3A%2F%2Fsoundcloud.com%2F'+u+'&amp;enable_api=true&amp;object_id=scPlayer',
    steps: req.param( 'steps', 100 )
  });
});
app.listen(3000);

serverTime = function() {
  return (new Date).getTime();
}

songTime = function() {
  return serverTime() - pos;
}


var socket = require('socket.io').listen(app);
socket.on('connection', function(client){
  client.on('message', function(cmd){
    if( cmd == 'ping' ){
      client.send({cmd: cmd, data: songTime(), serverTime: serverTime()});
    }
  });
  //client.on('disconnect', function(){ … })
});


console.log("Express server listening on port %d", app.address().port);
