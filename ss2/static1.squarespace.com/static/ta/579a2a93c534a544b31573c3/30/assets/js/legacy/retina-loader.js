
Y.add('squarespace-retina', function (Y) {

  Y.namespace('Squarespace.FrontSite').Retina = Y.Base.create('Retina', Y.Base, [], {

    /*
     * Init
     */
    initializer: function () {
      this.images = [];
      this.hiresQuery = [
        'screen and (-webkit-min-device-pixel-ratio: 2)',
        'screen and (min--moz-device-pixel-ratio: 2)',
        'screen and (-moz-min-device-pixel-ratio: 2)',
        'screen and (-o-min-device-pixel-ratio: 2/1)',
        'screen and (min-device-pixel-ratio: 2)',
        'screen and (min-resolution: 192dpi)',
        'screen and (min-resolution: 2dppx)'
      ]
      this._bindEvents();
    },


    /*
     * Process Images
     */
    _checkImages: function (dataAttr) {
      Y.all('img[data-' + dataAttr + ']').each(function (img) {
        if (img.getComputedStyle('display') !== 'none'){
          if (dataAttr === 'hires') {
            var hiresSource = img.getAttribute('data-src');
            var hiresType = hiresSource.substring(hiresSource.lastIndexOf('.'));
            var hiresFilenameAddition = img.getAttribute('data-hires');
            hiresSource = hiresSource.substring(0, hiresSource.lastIndexOf('.')) + hiresFilenameAddition;
            img.setAttribute('data-src', (hiresSource + hiresType));
            img.removeAttribute('data-hires');
            img.addClass('hires-loaded');
          }

          ImageLoader.load(img, { load: true });
        }
      });

      if (!Y.one('img[data-hires]')) {
        this._unbindEvents();
      }
    },


    /*
     * Events
     */
    _bindEvents: function () {
      for(var ii = 0; ii <= this.hiresQuery.length; ii++) {
        this.hiresQuery[ii] && enquire.register(this.hiresQuery[ii], {

          deferSetup: false,

          context: this,

          setup: function() {
          },

          match: function() {
            Y.one('html').addClass('hiDPI');
            this.context._checkImages('hires');
          },

          unmatch: function() {
            Y.one('html').removeClass('hiDPI');
          }
        }, true, this);
        if(!this.hiresQuery[ii]) {
          //done registering
          Y.all('img[data-hires]').each(function(img){
            if (img.getComputedStyle('display') !== 'none'){
              ImageLoader.load(img, { load: true });
              img.removeAttribute('data-load');
            }
          });
        }
      }
    },

    
    _unbindEvents: function () {
      for(var ii = 0; ii < this.hiresQuery.length; ii++) {
        this.hiresQuery[ii] && enquire.unregister(this.hiresQuery[ii]);
      }
    }
  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


// trying out enquire.js (http://wicky.nillia.ms/enquire.js/)



