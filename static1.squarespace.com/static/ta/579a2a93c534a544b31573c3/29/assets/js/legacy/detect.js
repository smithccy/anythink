
/*
 * Add a --light or --dark class to an element, depending on its position
 * in relation to an <img>
 *
 * Requires <canvas> support
 *
 */
Y.add('squarespace-detect', function (Y) {

  Y.namespace('Squarespace.FrontSite').Detect = Y.Base.create('Detect', Y.Base, [], {

    /*
     * Init
     */
    initializer: function () {
      this.supported = this._hasSupport();

      if (this.supported) {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';

        this.resizeTimer = null;
        this.events = [];

        this.events.push(Y.one(Y.config.win).on(window.orientation !== undefined ? 'orientationchange' : 'resize', function () {
          this.resizeTimer && this.resizeTimer.cancel();
          this.resizeTimer = Y.later(200, this, this.test);
        }, this));
      }
    },


    /*
     * Destroy
     */
    destructor: function () {
      this.canvas = null;
      this.context = null;
      this.events[0].detach();
    },


    /*
     * Check for Canvas and Context Support
     */
    _hasSupport: function () {
      this.canvas = document.createElement('canvas');

      if (this.canvas && this.canvas.getContext) {
        this.context = this.canvas.getContext('2d');
        return true;
      } else {
        return false;
      }
    },


    /*
     * Update dimensions of canvas
     */
    _updateCanvas: function () {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },


    /*
     * Render image on canvas
     */
    _drawImage: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(this.get('image')._node, this.get('image').getX(), this.get('image').getY(), this.get('image').get('clientWidth'), this.get('image').get('clientHeight'));
    },


    /*
     * Get position and dimensions of an element
     */
    _getBoundingBox: function (el) {
      return { 
        x: el.getX(),
        y: el.getY(),
        width: el.get('clientWidth'),
        height: el.get('clientHeight')
      }
    },


    /*
     * Check for Canvas and Context Support
     */
    _detectColors: function (el) {
      var dims = this._getBoundingBox(el),
          pixels,
          lum = 0,
          el,
          gap;

      if (dims.width > 0 && dims.height > 0) {
        pixels = this.context.getImageData(dims.x, dims.y, dims.width, dims.height).data;
        gap = dims.width / (dims.width * this.get('accuracy'));

        for (var p = 0; p < pixels.length; p += (4 * gap)) {
          lum += (0.2126 * pixels[p]) + (0.7152 * pixels[p + 1]) + (0.0722 * pixels[p + 2]);
        }

        lum = lum / ((pixels.length / (4 * gap)) + 1);
        lum = Math.floor((lum / 255) * 100);

        el = this.get('changeParent') ? el.ancestor() : el,
        el.removeClass(this.get('classPrefix') + '--light').removeClass(this.get('classPrefix') + '--dark');
        el.addClass(this.get('classPrefix') + '--' + (lum <= 60 ? 'light' : 'dark'));
      }
    },


    /*
     * Kill the detection process if it takes too long
     */
    _killDetection: function (duration) {
      if (duration > this.get('maxDuration')) {
        console.log('Detect Killed -- Process took ' + duration + 'ms');
        this.supported = false;

        this.get('target').each(function (t) {
          t = this.get('changeParent') ? t.ancestor() : t;
          t.removeClass(this.get('classPrefix') + '--light').removeClass(this.get('classPrefix') + '--dark');
        }, this);
      }
    },


    /*
     * Change the image that's being used for color detection
     */
    updateImage: function (img) {
      this.supported && this.set('image', img);
    },


    /*
     * Main function -- trigger the detection process
     */
    test: function () {
      var start,
          end;

      if (this.supported && this.get('image')) {
        if (this.get('image').hasClass('loading')) {
          this.get('image').on('load', this.test, this);
        } else {
          start = new Date().getTime();

          this._updateCanvas();
          this._drawImage();

          this.get('target').each(function (t) {
            this._detectColors(t);
          }, this);

          end = new Date().getTime();
          this._killDetection(end - start);
        }
      }
    }

  }, {
    ATTRS: {
      // Change the className of the target or its parent?
      changeParent: {
        value: false
      },
      // <img> to be used for color derection
      image: {
        value: null
      },
      // A list of elements that will be checked against the <img>
      target: {
        value: null
      },
      // Defaults: detect--light + detect--dark
      classPrefix: {
        value: 'detect'
      },
      // Percentage -- determines how many pixels are skipped when processing regions. 100% = no gaps
      accuracy: {
        value: 100,
        getter: function (val) {
          return val / 100;
        }
      },
      // The maximum allowed duration. If exceeded, the color detection process is not executed again
      maxDuration: {
        value: 500
      }
    }
  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});
