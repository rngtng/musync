(function(){
  var musync = window.musync = {
    socket: new io.Socket(),
    serverSongTime: 0,
    localTimeStartPing: 0,
    networkDelay: 0,
    clockDiff: 0,

    loaded: false,
    playing: false,
    player: null,
    code: null,

    fadeInTime: 100,
    fadeInSteps: 1.25,

    clientTime: function() {
      return (new Date).getTime();
    },

    getTime: function() {
      mu = musync;
      mu.localTimeStartPing = mu.clientTime();
      mu.socket.send({cmd: 'getTime', songCode: mu.code});
    },

    receiveTime: function(songTime, serverTime) {
      this.networkDelay = (this.clientTime() - this.localTimeStartPing) / 2;
      this.serverSongTime = songTime + this.networkDelay;
      this.clockDiff = serverTime + this.networkDelay - this.clientTime();
      this.setCounter();
      if(this.loaded) {
        this.player.api_seekTo(this.serverSongTime / 1000 );
        if(this.playing) {
          this.startPlay(150);
        }
      }
    },

    setCounter: function() {
      $("#counter").html('' + (this.serverSongTime / 1000) + ' + NwDelay: ' + this.networkDelay + ' ClockDiff:' + this.clockDiff);
    },

    startPlay: function(fadeInTime) {
      if(this.player) {
        this.player.api_play();
        if(this.player.api_getVolume() < 1) {
          this.turnUpVolume();
        }
      }
    },

    turnUpVolume: function() {
      mu = musync;
      vol = mu.player.api_getVolume();
      if(mu.fadeInTime && vol < 100) {
        mu.player.api_setVolume((1 + vol) * mu.fadeInSteps);
        setTimeout(mu.turnUpVolume, mu.fadeInTime);
      }
    },

    onPlayerReady: function(pl, data) {
      mu = musync;
      mu.player = soundcloud.getPlayer('scPlayer');
      mu.startPlay();
      mu.player.api_setVolume(0);
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
      mu.getTime();
      setInterval(mu.getTime, mu.interval);
    },

    onMediaPause: function(pl, data) {
      mu.player.api_setVolume(0);
      mu = musync;
      mu.playing = false;
    },

    onMessage: function(message) {
      mu = musync;
      if(message.cmd == 'getTime') {
        mu.receiveTime(parseInt(message.songtime), parseInt(message.servertime));
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
