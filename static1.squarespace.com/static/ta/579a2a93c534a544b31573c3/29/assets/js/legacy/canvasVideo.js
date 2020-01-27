Y.add('squarespace-canvas-video', function (Y) {
  Y.namespace('Squarespace.FrontSite').CanvasVideo = Y.Base.create('CanvasVideo', Y.Base, [], {
    initializer: function() {
      this.canvasNode = this._getNode(this.get('canvasNode'));
      this.videoNode = this._getNode(this.get('videoNode')) ? this._getNode(this.get('videoNode')) : (this.canvasNode && this._getNode(this.canvasNode.getAttribute('data-video-source')));

      if (!this.videoNode || !this.canvasNode) {
        console.warn('missing canvas or video node');
        return;
      }

      this._clearTimer();

      this.canvasContext = this.canvasNode.getContext('2d');

      var s = this.get('source');
      var d = this.get('destination');
      this.source = {
        x: (s && s.x) || 0,
        y: (s && s.y) || 0,
        width: (s && s.width) || this.videoNode.clientWidth,
        height: (s && s.height) || this.videoNode.clientHeight,
        focalPoint: this.videoNode.getAttribute('data-video-focal-point') || '0.5,0.5'
      }

      this.destination = {
        x: (d && d.x) || 0,
        y: (d && d.y) || 0,
        width: (d && d.width) || this.canvasNode.clientWidth,
        height: (d && d.height) || this.canvasNode.clientHeight
      }

      this.source.aspectRatio = this.source.width / this.source.height;
      this.destination.aspectRatio = this.destination.width / this.destination.height;

      //todo: check to make sure source area is not outside the bounds

      this.contentMode = this.canvasNode.getAttribute('data-content') || 'natural';
      if (this.contentMode === 'fit') {
        var tw = Math.min(this.source.width, this.destination.width);
        var th = Math.min(this.source.height, this.destination.height);

        if (this.source.aspectRatio > this.destination.aspectRatio) {
          this.source.height = this.videoNode.clientHeight;
          this.source.width = this.source.height * this.destination.aspectRatio;
        }
        else {

        }
      }

      else if (this.contentMode === 'natural') {
        //if source is larger than destination area, crop?
        /*if (this.source.width > this.destination.width) {
          this.source.width = this.destination.width;
        }

        if (this.source.height > this.destination.height) {
          this.source.height = this.destination.height;
        }*/

      }

      //I need this, but why?
      this.canvasNode.width = this.canvasNode.clientWidth;
      this.canvasNode.height = this.canvasNode.clientHeight;

      this.frameRate = Math.floor(1000/30);

      this.filter = this.get('filter');

      if (this.filter && this.filter.args) {
        if (this.filter.type === 'replaceColor') {
          var fromRGBA = this.normalizeRGBA(this.filter.args.fromRGBA);
          var toRGBA = this.normalizeRGBA(this.filter.args.toRGBA);
          var range = parseFloat(this.filter.args.range) || 0;

          if (fromRGBA && toRGBA) {
            this.filter.func = this.replaceColor.bind(this, fromRGBA, toRGBA, range);
          }
        }
      }

      Y.one(this.videoNode).on('canplaythrough', function(e) {
        e.currentTarget._node.play();
        this.draw();
      }, this);

      if (this.videoNode.readyState === 4) {
        this.videoNode.play();
        this.draw();
      }
    },

    destructor: function() {
      this.videoNode.pause();
      this._clearTimer();
      this.canvasContext.clearRect(this.destination.x, this.destination.y, this.destination.width, this.destination.height);
    },

    draw: function() {
      this._clearTimer();
      if(this.videoNode.paused || this.videoNode.ended) return false;
      this.canvasContext.drawImage(this.videoNode, this.source.x + 1, this.source.y + 1, this.source.width-2, this.source.height-2, this.destination.x, this.destination.y, this.destination.width, this.destination.height);
      this.filter && this.filter.func();
      this.canvasNode.timer = Y.later(this.frameRate, this, this.draw);
    },

    replaceColor: function(fromColor, toColor, range) {
      var imgd = this.canvasContext.getImageData(0, 0, this.destination.width, this.destination.height);
      var pix = imgd.data;
      var rangeFull = (range * 255);
      var limit = this.colorDistance([0,0,0],[255,255,255]) * range;

      for (var i = 0, n = pix.length; i <n; i += 4) {
        var r = pix[i],
            g = pix[i+1],
            b = pix[i+2];

        if(this.colorDistance([fromColor[0], fromColor[1], fromColor[2] ], [r,g,b]) < limit){
          /*REPLACE COLOR*/
          /*pix[i] = Math.abs(toColor[0] - rangeFull)/(fromColor[0] - rangeFull);
          pix[i+1] = Math.abs(toColor[1] - rangeFull)/(fromColor[1] - rangeFull);
          pix[i+2] = Math.abs(toColor[2] - rangeFull)/(fromColor[2] - rangeFull);
          pix[i+3] = toColor[3];*/

          /* REMOVE COLOR with range*/
          pix[i] = pix[i];
          pix[i+1] = pix[i+1];
          pix[i+2] = pix[i+2];
          pix[i+3] = 255 * (this.colorDistance([fromColor[0], fromColor[1], fromColor[2] ], [r,g,b]) / limit);
        }
      }
      this.canvasContext.putImageData(imgd,0,0);
    },

    normalizeRGBA: function (value) {
      if (!Array.isArray(value)) {
        return null;
      };
      if (value.length < 3) {
        return null;
      };

      for (var v = 0; v < value.length; v++) {
        if (isNaN(parseInt(value[v]))) {
          return null;
        }
        value[v] = Math.max(value[v], 0);
        value[v] = Math.min(value[v], 255);
      };

      if (value.length < 4) {
        (value[3] = 255);
      };

      return value;
    },

    colorDistance: function(v1, v2){
      var i,
          d = 0;

      for (i = 0; i < v1.length; i++) {
        d += (v1[i] - v2[i])*(v1[i] - v2[i]);
      }
      return Math.sqrt(d);
    },

    _getNode: function(value) {
      if (Y.Lang.isUndefined(value) || Y.Lang.isNull(value)) {
        return null;
      }

      if (Y.Lang.isString(value)) {
        value = Y.one(value);
      }

      return value._node;
    },

    _clearTimer: function() {
      this.canvasNode.timer && this.canvasNode.timer.cancel() && (this.canvasNode.timer = null);
    }

  }, {
    ATTRS: {
      videoNode: {
        getter: this._getNode
      },
      canvasNode: {
        getter: this._getNode
      },
      source: {},
      destination: {},
      filter: {}
    }
  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});

/*

var macbook = new Y.Squarespace.FrontSite.CanvasVideo({
  canvasNode: Y.one('.macbook-render canvas'),
  source
});

var iphone = new Y.Squarespace.FrontSite.CanvasVideo({
  canvasNode: Y.one('.iphone-render canvas'),
  source: {
    x: 400,
    y: 100,
    width: 320,
    height: 568
  },
  destination: {
    x: 0,
    y: 0,
    width: 320,
    height: 568
  }
});

*/