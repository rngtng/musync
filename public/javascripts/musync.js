(function(){
  var musync = window.musync = window.ms = {
    socket: new io.Socket(),
    serverTime: 0,
    localTime: 0,
    timeDiff: 0,

    loaded: false,
    playing: false,
    player: null,
    code: null,

    clientTime: function() {
      return (new Date).getTime();
    },

    getTime: function() {
      mu = musync;
      mu.localTime = mu.clientTime();
      mu.socket.send({cmd: 'getTime', songCode: mu.code});
    },

    receiveTime: function(time) {
      this.timeDiff = (this.clientTime() - this.localTime) / 2;
      this.serverTime = time + this.timeDiff;
      this.setCounter();
      if(this.loaded) {
        this.player.api_seekTo(this.serverTime / 1000 );
        if(this.playing) {
          this.startPlay();
        }
      }
    },

    setCounter: function() {
      $("#counter").html('' + (this.serverTime / this.interval) + ' + ' + this.timeDiff);
    },

    startPlay: function() {
      if(this.player) {
        this.player.api_play();
      }
    },

    onPlayerReady: function(pl, data) {
      mu = musync;
      mu.player = soundcloud.getPlayer('scPlayer');
      mu.startPlay();
      mu.getTime();
      console.log(mu.interval);
      setInterval(mu.getTime, mu.interval);
    },

    onMediaPlay: function(pl, data) {
      mu = musync;
      mu.playing = true;
      if(!mu.loaded) {
        mu.player.api_stop();
      }
    },

    onMediaDoneBuffering: function(pl, data) {
      mu = musync;
      mu.loaded = true;
      mu.playing = true;
    },

    onMediaPause: function(pl, data) {
      mu = musync;
      mu.playing = false;
    },

    onMessage: function(message) {
      mu = musync;
      if(message.cmd == 'getTime') {
        mu.receiveTime(parseInt(message.songTime));
      }
    },

    init: function(code, interval) {
      this.code = code;
      this.interval = interval;

      soundcloud.addEventListener('onPlayerReady', this.onPlayerReady);
      soundcloud.addEventListener('onMediaPlay', this.onMediaPlay);
      soundcloud.addEventListener('onMediaDoneBuffering', this.onMediaDoneBuffering);
      soundcloud.addEventListener('onMediaPause', this.onMediaPause);

      this.socket.on('message', this.onMessage);
      this.socket.connect();
    }
  };
})();