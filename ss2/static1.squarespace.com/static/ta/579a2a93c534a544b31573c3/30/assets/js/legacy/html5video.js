
/*
 * Basic HTML5 Video – with mp4 + WebM support
 */
Y.add('squarespace-html5-video', function (Y) {

  Y.Node.DOM_EVENTS.timeupdate = 1;
  Y.Node.DOM_EVENTS.canplaythrough = 1;
  Y.Node.DOM_EVENTS.ended = 1;

  Y.namespace('Squarespace.FrontSite').HTML5Video = Y.Base.create('HTML5Video', Y.Base, [], {

    initializer: function () {
      if (this._checkBasicSupport()) {
        this._checkForSD();

        this.HTML5VideoSupport = true;
        this.enableCallbacks = true;
        this.events = [];
        this.nextPause = null;
        this.pauses = [];
        this.pauseTimer;
        this.controlsTimer;
        this.playCheckTimer;
        this.ios = Y.UA.ios;
        this.android = Y.UA.android;

        if (this._prepareVideoPlayer()) {
          this._bindUI();
        }
      } else {
        this.HTML5VideoSupport = false;
      }
    },

    destructor: function () {
      if (this.HTML5VideoSupport) {
        this.get('controls') && this.get('controls').addClass('is--invisible');
        this.controlsTimer && this.controlsTimer.cancel();

        for (var e = 0; e < this.events.length; e++) {
          this.events[e].detach();
        }

        this.videoPlayer.detach('canplaythrough', this._playVideo);
        this.videoPlayer.detach('timeupdate', this._trackVideo);
        this.videoPlayer.detach('ended', this._pauseAndPlay);
        this.videoPlayer && this.videoPlayer.remove();
      }
    },

    _checkForSD: function () {
      var width = window.screen && window.screen.availWidth;
      this.sd = (width && width < 1280) ? true : false;
    },

    _checkBasicSupport: function () {
      return Modernizr.video !== false && Y.Node.create('<source type="video/mp4"></source>') ? true : false;
    },

    _supportsFormat: function (format) {
      return this.videoPlayer._node.canPlayType(format);
    },

    _appendSourceTag: function (src, label) {
      if (this._supportsFormat(label)) {
        var el = Y.Node.create('<source src="' + src + '" type="' + label + '"></source>');
        el.appendTo(this.videoPlayer);
      }
    },

    _loadSources: function (src) {
      function getSource(s, sd) {
        var output;

        if (typeof s === 'object') {
          output = sd ? s.sd : s.hd;
        } else {
          output = sd ? null : s;
        }

        return output;
      }

      src.webm && getSource(src.webm, this.sd) && this._appendSourceTag(getSource(src.webm, this.sd), 'video/webm');
      src.mp4 && getSource(src.mp4, this.sd) && this._appendSourceTag(getSource(src.mp4, this.sd), 'video/mp4');
    },

    _setDimensions: function () {
      if (this.ios || this.android) {
        this.videoPlayer.setStyles({
          'width': '100%',
          'height': '100%',
          'top': 0,
          'left': 0
        });
      } else {
        this.videoPlayer.setStyles({
          'top': 0,
          'left': 0,
          'width': null,
          'height': null
        });

        this.videoPlayer.setStyle('width', this.get('container').get('clientWidth'));

        var ch = this.get('container').get('clientHeight'),
            cw = this.get('container').get('clientWidth'),
            vh = this.videoPlayer.get('clientHeight'),
            r = vh / this.videoPlayer.get('clientWidth'),
            vw = vh < ch ? (ch / r) : this.videoPlayer.get('clientWidth');

        this.videoPlayer.setStyles({
          'width': vw,
          'top': Math.min(0, - (this.videoPlayer.get('clientHeight') - ch) / 2),
          'left': Math.min(0, - (vw - cw) / 2)
        });
      }

      if (this.bottom) {
        this.videoPlayer.setStyles({
          'top': null,
          'bottom': 0
        });
      } else {
        this.videoPlayer.setStyle('bottom', null);
      }
    },

    _toggleControls: function (mode, e) {
      var controls = this.get('controls');

      if (!Modernizr.touch && controls) {
        if (e && (e.target === this.get('controls') || this.get('controls').contains(e.target))) {
          controls.removeClass('is--invisible');
          this.controlsTimer && this.controlsTimer.cancel();
        } else {
          if (mode) {
            controls.removeClass('is--invisible');

            this.controlsTimer && this.controlsTimer.cancel();
            this.controlsTimer = Y.later(1000, this, function () {
              this._toggleControls(false);
            });
          } else {
            if (controls._node) {
              controls.addClass('is--invisible');
              this.controlsTimer.cancel();
            }
          }
        }
      } else if (controls) {
        controls.addClass('is--invisible');
      }
    },

    _playVideo: function (e) {
      if (this.videoPlayer.getAttribute('src') || this.videoPlayer.get('children').size() > 0) {
        this.videoPlayer._node.play();
        this.videoPlayer._node.volume = this.get('volume');
        this._toggleMode(true);
        this._setDimensions();
        !this.ios && this._toggleControls(true);
      } else {
        console.log('Something went wrong -- HTML5Video');
      }

      if (this.enableCallbacks) {
        this.videoPlayer.setStyle('visibility', 'visible');
        this.get('callback') && this.get('callback')('play');
      }
    },

    _toggleMode: function (mode) {
      var toggle = this.get('toggle');

      toggle.removeClass('sqs-html5-video--pause').removeClass('sqs-html5-video--play');

      if (mode) {
        toggle.addClass('sqs-html5-video--pause');
      } else {
        toggle.addClass('sqs-html5-video--play');
      }
    },

    _pauseAndPlay: function () {
      if (this.get('loop')) {
        this.pauseTimer = Y.later(this.get('pauseDelay'), this, function () {
          this.videoPlayer._node.play();
        });
      } else {
        this._toggleMode(false);
        this.get('callback') && this.get('callback')('end', this.interaction);
      }
    },

    _trackVideo: function (e) {
      var time = this.videoPlayer.get('currentTime');

      if (this.pauses && time < 1) {
        this.nextPause = 0;
        this.interaction = false;
      }

      if (this.pauses && (this.nextPause !== null) && time > this.pauses[this.nextPause]) {
        this.pause();
        this.nextPause = this.pauses[this.nextPause + 1] ? this.nextPause + 1 : null;
        this._pauseAndPlay();
      }

      this.progressBar && this.progressBar.setStyle('width', (time / this.videoPlayer._node.duration) * 100 + '%');
    },

    _prepareVideoPlayer: function () {
      var progress = this.get('progress'),
          controls = Modernizr.touch ? ' controls ' : '';

      this.videoPlayer = Y.Node.create('<video class="sqs-html5-video" preload="none"' + controls + '></video>');

      if (this.videoPlayer) {
        this.videoPlayer.setStyles({
          'position': 'absolute',
          'visibility': 'hidden'
        });

        this.videoPlayer.appendTo(this.get('container'));
      }

      if (progress) {
        progress.setStyles({
          'position': 'relative',
          'cursor': 'pointer'
        });

        this.progressBar = Y.Node.create('<span class="sqs-html5-video-progress-bar"></span>');
        this.progressBar.setStyles({
          'position': 'absolute',
          'top': 0,
          'left': 0,
          'height': '100%',
          'background': '#fff'
        });
        this.progressBar.appendTo(progress);
      }

      return this.videoPlayer;
    },

    _seekTime: function (e) {
      var seek;

      if (e.button === 1) {
        this.interaction = true;
        seek = e._event.offsetX / e.currentTarget.get('clientWidth');
        this.videoPlayer._node.currentTime = this.videoPlayer._node.duration * seek;
      }
    },

    _bindUI: function () {
      var progress = this.get('progress'),
          toggle = this.get('toggle');

      this.events.push(Y.one(Y.config.win).on('resize', function (e) {
        this._setDimensions();

        this.get('container').all('img').each(function (img) {
          ImageLoader.load(img, { load: 'viewport' });
        });
      }, this));

      this.videoPlayer.on('canplaythrough', this._playVideo, this);
      this.videoPlayer.on('load', this._playVideo, this);

      if (!this.ios) {
        this.videoPlayer.on('timeupdate', this._trackVideo, this);
        this.videoPlayer.on('ended', this._pauseAndPlay, this);

        if (progress) {
          this.get('progress').on('mousemove', this._seekTime, this);
          this.get('progress').on('click', this._seekTime, this);
        }

        if (toggle) {
          toggle.on('click', this._toggle, this);
        }

        this.get('controls') && this.get('container').on('mousemove', function (e) {
          this._toggleControls(true, e);
        }, this);
      }
    },

    getProgress: function () {
      return this.HTML5VideoSupport && Math.round((this.videoPlayer.get('currentTime') / this.videoPlayer._node.duration) * 100);
    },

    emptyVideoWrapper: function () {
      if (this.HTML5VideoSupport) {
        if (Y.UA.iphone) {
          // Destroy player - the only way to fix playback issue on iOS?
          // (video was starting playback from where the previous video stopped)
          this.destructor();
          this._prepareVideoPlayer();
          this.videoPlayer.on('canplaythrough', this._playVideo, this);
          this.videoPlayer.on('load', this._playVideo, this);
        } else {
          this.videoPlayer._node.pause();
          this.videoPlayer.empty();
          this.videoPlayer.setStyle('height', 0);
        }
      }
    },

    loadVideo: function (src, pauses, forceIOS, bottom) {
      if (this.HTML5VideoSupport) {
        // Reset
        this._cache = {
          src: src,
          pauses: pauses,
          forceIOS: forceIOS,
          bottom: bottom
        }

        // Since we don't have SD mp4 loops, determine if this is a loop
        this.isLoop = Y.one('.video-wrapper--loop') ? true : false;

        this.playCheckTimer && this.playCheckTimer.cancel();
        this.bottom = bottom;
        this.emptyVideoWrapper();

        if (this.ios && forceIOS) {
          this._toggleControls(false);
          this._loadSources(src);
          this.videoPlayer._node.load();
          this._playVideo();
        } else if (!this.ios) {
          this.pauseTimer && this.pauseTimer.cancel();
          this.pauses = pauses;
          this.progressBar && this.progressBar.setStyle('width', null);

          this.videoPlayer._node.volume = 0;
          this._loadSources(src);
          this.videoPlayer._node.load();
        }

        this.playCheckTimer = Y.later(2500, this, function () {
          // Don't fail down to SD quality on loop load issues
          if (!this.isLoop && this.videoPlayer._node.readyState !== 4) {

            // Video is too slow
            if (this.sd !== true && this.videoPlayer.get('children').size() > 0) {
              // TODO: .ogv are huge and this always fires -- remove when their size is reduced
              if (this.videoPlayer.get('children').item(0).getAttribute('src').indexOf('.ogv') === -1) {
                console.log('*** Use SD version');
                this.sd = true;
                this.loadVideo(this._cache.src, this._cache.pauses, this._cache.forceIOS, this._cache.bottom);
              }
            }

            this._playVideo();
          }
        });
      }
    },

    _getNode: function (value) {
      if (Y.Lang.isString(value)) {
        value = Y.one(value);
      }
      return value;
    },

    _toggle: function () {
      if (this.HTML5VideoSupport) {
        var toggle = this.get('toggle');

        if (!this.videoPlayer._node.paused) {
          this._toggleMode(false);
          this.videoPlayer._node.pause();
        } else {
          this.videoPlayer._node.play();
          this._toggleMode(true);
        }
      }
    },

    pause: function () {
      this.videoPlayer && this.videoPlayer._node.pause();
    },

    play: function () {
      this.videoPlayer && this.videoPlayer._node.play();
    }

  }, {
    ATTRS: {
      // Main video wrapper
      container: {
        getter: this._getNode
      },
      // Show progress
      progress: {
        getter: this._getNode
      },
      // Play/pause
      toggle: {
        getter: this._getNode
      },
      // Main overlay - used to auto show/hide controls on mouse move
      controls: {
        getter: this._getNode
      },
      // Volime
      volume: {
        value: 0.9
      },
      // Delay between individual pauses
      pauseDelay: {
        value: 0
      },
      // Loop
      loop: {
        value: false
      },
      // Called when video loads successfully and starts to play (canplaythrough event is fired)
      callback: {
        value: null
      }
    }
  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});
