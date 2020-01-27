
Y.add('squarespace-lazy', function (Y) {

  Y.namespace('Squarespace.FrontSite').Lazy = Y.Base.create('Lazy', Y.Base, [], {

    /*
     * Init
     */
    initializer: function () {
      this.images = [];
      this._bindEvents();
      this.timer = 0;
    },


    /*
     * Add image
     */
    push: function (img) {
      if (Y.UA.ie && Y.UA.ie < 9) {
        this._load(img);
      } else {
        this.images.push(img);
        this._placeholder(img);
        this._queueCheckImages(null, true);
      }
    },

    _queueCheckImages: function() {
      if (this._alreadyQueuedCheckImages) {
        clearTimeout(this._alreadyQueuedCheckImages);
        this._alreadyQueuedCheckImages = null;
      }

      var args = arguments;

      this._alreadyQueuedCheckImages = setTimeout(function() {
        this._checkImages.apply(this, args);
        this._alreadyQueuedCheckImages = null
      }.bind(this), 100);
    },


    /*
     * Kill queue
     */
    purge: function () {
      this.images = [];
    },


    /*
     * Prepare dimensions
     */
    _placeholder: function (img) {
      var ancestor = img.ancestor(),
          dims = img.getAttribute('data-image-dimensions'),
          preserveDims = img.getAttribute('data-preserve-dimensions');

      if (img.hasAttribute('skip-placeholder')) {
        return;
      }

      if (dims) {
        dims = dims.split('x');

        // Take into consideration image CSS
        dims[0] = Math.min(parseInt(dims[0]), parseInt(img.getComputedStyle('width')));
        dims[1] = Math.min(parseInt(dims[1]), parseInt(img.getComputedStyle('height')));

        img.setStyles({
          'width': dims[0],
          'height': dims[1],
          'display': 'inline-block'
        });
      }

      if (preserveDims !== 'true' && ancestor) {
        ancestor.setStyles({
          'height': ancestor.get('clientHeight') - parseInt(ancestor.getComputedStyle('paddingTop')) - parseInt(ancestor.getComputedStyle('paddingBottom'))
        });
      }
    },


    /*
     * Remove any styles added by LL
     */
    _clearStyles: function (img) {
      img.setStyles({
        'height': null,
        'width': null,
        'display': null
      });

      img.ancestor().setStyles({
        'height': null
      });
    },


    /*
     * Load image
     */
    _load: function (img) {
      //console.log('Loading -- alt: ' + img.getAttribute('alt') + ' src: ' + img.getAttribute('data-src'));
      img.addClass('lazy-loaded');
      ImageLoader.load(img, { load: true });
      img.removeAttribute('data-load');
      this._clearStyles(img);
    },


    _getCachedStartYAndViewport: function() {

      if (!this._storedValue || (Date.now() - this._storedValue.touched) > 1000) {

        // doing the pageYOffset, scrollTop causes repaints for some reason.

        this._storedValue = {
          startY: (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop),
          viewport: (window.innerHeight * 1.5),
          touched: Date.now()
        };
      }

      var startY = this._storedValue.startY;
      var viewport = this._storedValue.viewport;

      return {
        startY: startY,
        viewport: viewport
      };

    },


    /*
     * Process Images
     */
    _checkImages: function (e, last) {
      var result = this._getCachedStartYAndViewport();

      var startY = result.startY;
      var viewport = result.viewport;

      for (var i = last ? this.images.length - 1 : 0; i < this.images.length; i++) {
        if (this.images[i] && this.images[i].getY() <= (startY + viewport) && this.images[i].getY() >= (startY - viewport)) {
          this._load(this.images[i]);
          this.images[i] = null;
        }
      }
    },


    /*
     * Scrolling
     */
    _scroll: function () {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(Y.bind(this._checkImages, this), 100);
    },


    /*
     * Events
     */
    _bindEvents: function () {
      if (!Y.UA.ie || (Y.UA.ie && Y.UA.ie > 8)) {
        Y.one(window).on('scroll', this._scroll, this);

        Y.one(window).on(window.orientation !== undefined ? 'orientationchange' : 'resize', function () {
          for (var i = 0; i < this.images.length; i++) {
            if (this.images[i] && !this.images[i].hasClass('lazy-loaded')) {
              this._clearStyles(this.images[i]);
              this._placeholder(this.images[i]);
            }
          }
        }, this);
      }
    }

  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});
