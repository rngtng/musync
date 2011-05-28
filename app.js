
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

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

app.get('/chat', function(req, res){
  res.render('chat', {
    title: 'Express'
  });
});

app.get('/counter', function(req, res){
  res.render('counter', {
    title: 'Express'
  });
});

app.listen(3000);

var everyone = require("now").initialize(app);

everyone.now.getTime = function(){
  this.now.receiveTime((new Date).getTime());
};

everyone.now.distribute = function(message){
  // this.now exposes caller's scope
  everyone.now.receive(message);
};

console.log("Express server listening on port %d", app.address().port);
