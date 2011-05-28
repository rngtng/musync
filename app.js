
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

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.get('/counter/(:steps)?', function(req, res){
  res.render('counter_io', {
    title: 'Express',
    steps: (req.params.steps ? req.params.steps : 100 )
  });
});

app.listen(3000);


serverTime = function() {
  return (new Date).getTime() % 1306598990000;
}


var socket = require('socket.io').listen(app);
socket.on('connection', function(client){
  client.send(serverTime());
  //client.on('message', function(){ });
  //client.on('disconnect', function(){ … })
});


// var everyone = require("now").initialize(app);
// everyone.now.getTime = function(){
//   this.now.receiveTime(serverTime());
// };

console.log("Express server listening on port %d", app.address().port);
