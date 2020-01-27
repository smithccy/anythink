
/*
 * Slideshow header
 * This will take a an object as an argument which contains all of the slide data.
 */
Y.add('squarespace-slideshow-header', function(Y) {
  Y.namespace('Squarespace.FrontSite').SlideshowHeader = Y.Base.create('SlideshowHeader', Y.Base, [], {

    /*
     * Init
     */
    initializer: function(args) {
      this.slideConfig = args.slideConfig;
      this.sectionConfig = args.sectionConfig;
      this.slider = Y.one('section.hero-slider');
      this.gallery = this.slider && this.slider.one('.gallery');
      this.slideText = this.gallery && this.gallery.one('.slide-text');

      this.slideNav = Y.one('.navigation-horizontal');
      this.slideIndicator = this.slideNav && this.slideNav.one('.navigation-horizontal-indicator');
      this.args = args;

      this.subpage = '';

      this._buildSlides();
      this._setSlideValues();
      this._buildHorizontalNav();
      this._navItemWidth();

      this.eventData = {
        from: oldReferrer || document.referrer,
        slider: false
      };

      this.windowEvents = new Array();
      this.galleries = new Array();
      this.canvasVideo = new Array();

      this.screenSizeEvent = typeof window.orientation === 'undefined' ? 'resize' : 'orientationchange';

      Y.Squarespace.FrontSite.Core.loginLink(true);

      this._bindEvents();
      this._setDeviceOrientation();
      this._setHeaderHeight();
      this._createHeaderSlider();
      this._sliderTextColor();
      this._setAttribution();

      // Can this be done globally on all pages?
      this._switchDeviceSizes('iphone', 1400, '--small');
      this._switchDeviceSizes('browser', 1024, '--small', '.marketing-tour article:not(.customers)');
      this._scaleDeviceSizes('ipadmini-landscape');
      this._scaleCustomerCareImage();

      Y.Squarespace.FrontSite.Core.siteFilter.load();

      // TODO: seems to only work with Y.later...?  Hook this up to an event maybe?
      Y.later(1, this, function() { Y.one('title').setHTML(Y.one(this.sectionConfig['data-content-target']).getAttribute('data-page-title')) });

      Y.later(100, this, this._pageModeFunctions);
    },


    /*
     * Destructor
     */
    destructor: function() {
      for (var e = 0; e < this.windowEvents.length; e++) {
        if (this.windowEvents[e]) {
          this.windowEvents[e].detach();
        }
      }

      if (!!this.canvasVideo) {
        for (var c = 0; c < this.canvasVideo.length; c++) {
          if (this.canvasVideo[c]) {
            this.canvasVideo[c].destroy();
          }
        }
        this.canvasVideo = null;
      }
    },


    /*
     * Get current mode ex: overview, artists etc. Used in event tracking.
     */
    _getActiveMode: function (i) {
      i = i ? i : this.headerGallery.get('currentIndex');
      return Y.all('.hero-slider .gallery .slide').item(i).getAttribute('data-section')
    },


    /*
     * If functionality for this particular page is defined, execute it.
     * Called in Initializer and Y.Squarespace.FrontSite.Core._switchContent
     */
    _pageModeFunctions: function () {
      var mode = this._getActiveMode();
      if (typeof this.pageFunction[mode] === 'function') {
        this.pageFunction[mode](this);
      }
    },


    /*
     * returns true if num is even, flase if it's odd
     */
    _isEven: function(num) {
      return (num % 2 == 0);
    },

    _buildSlides: function() {
      var slide = this.gallery.one('.slide');
      for (var ii = 0; ii < this.slideConfig.length - 1; ii++) {
        slide.insert(slide.cloneNode(true), 'before');
      }
      var heroClass = this.sectionConfig['hero-height'] ? this.sectionConfig['hero-height'] : 'tall';
      this.slider.addClass(heroClass);
    },

    _setSlideValues: function() {
      if (this.sectionConfig['hero-text-type']) {
        this.slider && this.slider.addClass(this.sectionConfig['hero-text-type']);
      }

      for (var ii = 0; ii < this.slideConfig.length; ii++) {
        var info = this.slideConfig[ii];
        if (info['data-section'] === 'divider') {
          continue;
        }
        var el = this.gallery.all('.slide').item(ii);
        el.one('img').setAttribute('data-src', info['image-data']['data-src']);
        el.one('img').setAttribute('dimensions', info['image-data']['dimensions']);
        el.one('img').setAttribute('data-image-focal-point', info['image-data']['focal-point']);
        el.setAttribute('data-section', info['data-section']);
        el.setAttribute('data-color', info['data-color']);
        if (info.slidetext) {
          for (var jj = 0; jj < info.slidetext.length; jj++) {
            var thisEl = el.one(info.slidetext[jj][0]);
            thisEl && thisEl.setHTML(info.slidetext[jj][1]) && thisEl.removeClass('is--hidden');
          }
        }
        if (info.addedClasses) {
          for (var kk = 0; kk < info.addedClasses.length; kk++) {
            el.one(info.addedClasses[kk][0]) && el.one(info.addedClasses[kk][0]).addClass(info.addedClasses[kk][1]);
          }
        }
      }
    },

    _buildHorizontalNav: function() {
      var navItem = this.slideNav.one('.nav-item');
      for (var ii = 0; ii < this.slideConfig.length - 1; ii++) {
        this._setNavValues(this.slideNav.all('.nav-item').item(ii), ii);
        navItem.insert(navItem.cloneNode(true), 'before');
      }
      this._setNavValues(this.slideNav.all('.nav-item').item(ii), ii);
    },

    _setNavValues: function(el, num) {
      var info = this.slideConfig[num];
      el.setAttribute('class', ('nav-item nav-item--' + info['data-section']));
      el.setAttribute('data-index', num);
      el.setAttribute('data-section', info['data-section']);
      el.one('a').setAttribute('href', (this.sectionConfig['base-url'] + info['data-section']));
      el.one('a').setAttribute('data-content-target', this.sectionConfig['data-content-target']);
      el.one('.text').set('innerHTML', info['data-section-title']);
      //el.one('.text').set('innerHTML', info['data-section'].replace('-', ' ').replace(' websites', '').replace(' website', ''));
    },


    /*
     *  This is a hack to fix a browser bug:
     *  Inside an container with an even width, nav items with an odd width will "wobble" during an opacity transition.
     *  This finds the odd width items and adds 1px to make them even.
     *  Remove this if the browser bug goes away.
     */
    _navItemWidth: function () {
      for (var ii = 0; ii < this.slideConfig.length; ii++) {
        Y.all('.nav-item').item(ii).setStyle('width', null);
        var info = this.slideConfig[ii];
        var w = parseInt(Y.all('.nav-item').item(ii).getComputedStyle('width'));
        if (!this._isEven(w)) {
          Y.all('.nav-item').item(ii).setStyle('width', (w + 1) + 'px');
        }
      }
    },

    /*
     *  BINDING EVENTS
     */
    _bindEvents: function () {

      /*** CORE:  Slider and Nav */
      this.slider.all('.slide-text .button').on('click', function () {
        if (!this.slider) {
          return;
        }
        // hiding slide text while gallery is destroyed
        if (this.slider.one('.sqs-active-slide .slide-text--light')) {
          this.slider.setStyle('background', '#222');
        } else {
          this.slider.setStyle('background', '#fafafa');
        }
        this.slider.all('.slide:not(.sqs-active-slide)').addClass('is--invisible');
      });

      Y.all('.slider-arrow, .nav-item a').each(function(s) {
        s.on('click', function (e) {
          this.eventData = {
            from: window.location.pathname,
            slider: e.currentTarget.ancestor('.navigation-items') ? false : true
          }
        }, this);
      }, this);

      Y.all('.watch-video').each(function(v) {
        v.on('click', function (e) {
          Y.Squarespace.FrontSite.Core.trackEvent('frontsite_tour_video_view', {
            tourSection: this._getActiveMode(),
            video_title: 'demo'
          });
        }, this);
      }, this);

      this.slideNav.all('.nav-item a').each( function (n) {
        n.on('click', function (e) {
          if (Y.one(e._currentTarget).ancestor('.sqs-active-slide')) {
            this._tapToScroll(e, {top: false});
          }
          else {
            this._tapToScroll(e, {top: true});
          }
        }, this);
      }, this);

      Y.one('.navigation-items').on('scroll', function (e) {
        this._moveSlideIndicator(e);
      }, this);

      this.windowEvents.push(Y.one(window).on(this.screenSizeEvent, function (e) {
        this._moveSlideIndicator(e);
        this._setHeaderHeight();
        this._navItemWidth();
      }, this));


      /*** Sticky Nav & Scroll Watcher */
      this.windowEvents.push(Y.one(window).on(this.screenSizeEvent, function (e) {
        this._stickyNav();
      }, this));

      this.windowEvents.push(Y.one(window).on('scroll', function (e) {
        this._stickyNav();
      }, this));

      Y.one('.navigation-sqsp-link').on('click', function(e) {
        this._tapToScroll(e, {top: true});
      }, this);

      if (!Y.one('html').hasClass('touch')) {
        var navIconsFade = Y.one(window).on('scroll', function (e) {
          this._scrollWatcher('.nav-item .icon', 'opacity', 0, this.slideIndicator.get('region').bottom - 42, this.slideNav.one('.icon').get('region').top -21);
        }, this);
        this.windowEvents.push(navIconsFade);

        var navButtons = Y.one(window).on('scroll', function (e) {
          this._scrollWatcher('.navigation-horizontal .navigation-extra', 'opacity', 1, Y.one('.inject-point--secondary').get('region').top - 121, Y.one('.inject-point--secondary').get('region').top + 42 - 121);
        }, this);
        this.windowEvents.push(navButtons);

        var navShadow = Y.one(window).on('scroll', function (e) {
          this._scrollWatcher('.navigation-shadow', 'opacity', 1, Y.one('.inject-point--secondary').get('region').top - 91, Y.one('.inject-point--secondary').get('region').top + 42 - 91);
        }, this);
        this.windowEvents.push(navShadow);

        if (Y.one('.layout--slideshow-header[data-page-label*="tour-"]')) {
          var endValue = 0;
          var nItem = this.slideNav.all('.nav-item');
          for(var ii = 0; ii < nItem.size(); ii++) {
            endValue += parseInt(nItem.item(ii).getComputedStyle('width'));
            endValue += parseInt(nItem.item(ii).getComputedStyle('margin-left'));
            endValue += parseInt(nItem.item(ii).getComputedStyle('margin-right'));
          }

          var navIconsLeft = Y.one(window).on('scroll', function (e) {
            this._moveSlideIndicator(e);
            this._scrollWatcher('.navigation-items', 'right', ((Y.one(window).get('winWidth') - endValue) / 2 - (Y.one(window).get('winWidth') * 0.05) + parseInt(this.slideNav.one('.nav-item').getComputedStyle('margin-left'))), this.slideIndicator.get('region').bottom - 42, this.slideNav.one('.icon').get('region').top - 21, true);
          }, this);
          this.windowEvents.push(navIconsLeft);
        }
      }
      else {
        var gestureStart,
            gestureEnd,
            verticalDelta,
            horizontalDelta;

        this.slider.one('.gallery').on('gesturemovestart', function (e) {
          e.stopPropagation();
          gestureStart = [e.pageX, e.pageY];

          e.currentTarget.once('gesturemoveend', function (e) {
            gestureEnd = [e.pageX, e.pageY];
            verticalDelta = Math.abs(gestureStart[1] - gestureEnd[1]);
            horizontalDelta = gestureStart[0] - gestureEnd[0];

            if (verticalDelta < 25 && Math.abs(horizontalDelta) > 75) {

              index = this.get('slideIndex');

              if (horizontalDelta > 0) {
                this.galleries[0].nextSlide();
              } else {
                this.galleries[0].previousSlide();
              }
            }
          }, null, this);
        }, null, this);
      }


      /*** Helpers */
      this.windowEvents.push(Y.one(window).on('orientationchange', function (e) {
        this._setDeviceOrientation();
      }, this));


      /*** Additional section-specific functionality */
      Y.all('.designs-template').each(function (example) {
        Y.one(example).one('.designs-template-info').on('click', function (e) {
          var info = e._currentTarget,
              identifier = info.getAttribute('data-identifier'),
              baseTemplate = info.getAttribute('data-base-template'),
              customDomain = info.getAttribute('data-url'),
              deepLink = info.getAttribute('data-deep-link');
              args = {'identifier': identifier, 'baseTemplate': baseTemplate, 'customDomain': customDomain, 'deepLink': deepLink};

          Y.Squarespace.FrontSite.Core.trackEvent('frontsite_tour_customer_example_click', {
            tourSection: this._getActiveMode(),
            exampleIdentifier: identifier
          });

          this._showProfile(args);
        }, this);
      }, this);
      this.windowEvents.push(Y.one(window).on(this.screenSizeEvent, function (e) {
        this._switchDeviceSizes('iphone', 1400, '--small');
        this._switchDeviceSizes('browser', 1024, '--small', '.marketing-tour article:not(.customers)');
        this._scaleDeviceSizes('ipadmini-landscape');
        this._scaleCustomerCareImage();
      }, this));
    },


    /*
     * Bind additional events after new content is loaded, since _bindEvents() is called from the initializer.
     * Called from Y.Squarespace.FrontSite.Core._switchContent
     */
    _bindMoreEvents: function() {
      this._switchDeviceSizes('browser', 1024, '--small', '.marketing-tour article:not(.customers)');
      this._scaleDeviceSizes('ipadmini-landscape');

      this._setActiveNav();

      Y.all('.designs-template:not(.ready)').each(function(example){
        Y.one(example).one('.designs-template-info').on('click', function (e) {
          var info = e._currentTarget,
              identifier = info.getAttribute('data-identifier'),
              baseTemplate = info.getAttribute('data-base-template'),
              customDomain = info.getAttribute('data-url'),
              deepLink = info.getAttribute('data-deep-link');
              args = {'identifier': identifier, 'baseTemplate': baseTemplate, 'customDomain': customDomain, 'deepLink': deepLink};

          Y.Squarespace.FrontSite.Core.trackEvent('frontsite_tour_customer_example_click', {
            tourSection: this._getActiveMode(),
            exampleIdentifier: identifier
          });

          this._showProfile(args);
        }, this);

        Y.one(example).addClass('ready');
      }, this);

      this._setAttribution();
    },


    /*
     * Update the active item in the main nav, if it exists
     */
    _setActiveNav: function() {
      var activeItem,
          url = document.location.pathname;

      this.mainNav = Y.one('.navigation--main');

      if (this.mainNav) {
        this.mainNav.all('.navigation-item--active').removeClass('navigation-item--active');

        if (url === 'index.html') {
          activeItem = this.mainNav.one('.navigation-item');
        }
        else if (url.indexOf('stories') != -1) {
          activeItem = this.mainNav.one('.navigation-item');
        } else {
          activeItem = this.mainNav.one('.navigation-item a[href="' + url + '"]');
          activeItem = activeItem && activeItem.ancestor();
        }
        if (activeItem) {
          activeItem.addClass('navigation-item--active');
        }
      }
    },

    /*
     * Append/remove orientation-specific classes
     */
    _setDeviceOrientation : function(){
      if(typeof window.orientation === 'undefined') {
        Y.one('html').addClass('orientation-unsupported');
        return;
      }
      var orientationClasses = new Array('orientation0', 'orientation90', 'orientation-90');

      for(var ii = 0; ii < orientationClasses.length; ii++) {
        Y.one('html').removeClass(orientationClasses[ii]);
      }

      Y.one('html').addClass('orientation' + window.orientation);

    },


    /*
     * Set the header height form the screen size
     */
    _setHeaderHeight : function () {
      if(this.slider.hasClass('tall')) {
        if (Y.one(window).get('winWidth') <= 600) {
          this.slider.setStyle('height', Y.one(window).get('winHeight') - 230);
        } else if (Y.one(window).get('winHeight') <= 900) {
          this.slider.setStyle('height', Y.one(window).get('winHeight') - 318);
        } else {
          this.slider.setStyle('height', (Y.one(window).get('winHeight') - 360)); //parseInt(Y.one('.navigation-horizontal').getComputedStyle('height'))) * .85 );
        }
      }

/*      else if (this.slider.hasClass('short')) {
        if (Y.one(window).get('winHeight') <= 600) {
          this.slider.setStyle('height', '280px');
        } else {
          this.slider.setStyle('height', '470px'); //parseInt(Y.one('.navigation-horizontal').getComputedStyle('height'))) * .85 );
        }
      }
*/
      if (Y.one(window).get('winWidth') <= 1024 || window.innerHeight <= 750) {
        this.slider.all('.button').addClass('button--mini');
      } else if (Y.one(window).get('winWidth') <= 1200) {
        this.slider.all('.button').addClass('button--small');
      } else {
        this.slider.all('.button').removeClass('button--small').removeClass('button--mini');
      }
    },


    /*
     * Create Gallery in the header
     */
    _createHeaderSlider : function () {
      this.headerGallery = new Y.Squarespace.Gallery2({
        container: this.slider.one('.gallery'),
        slides: '.slide',
        loaderOptions: {
          mode: 'fill'
        },
        design: 'stacked',
        designOptions: {
          autoHeight: false,
          speed: .5,
          transition: 'fade',
          clickBehavior: false
        },
        elements: {
          next: Y.all('.slider-arrow--right'),
          previous: Y.all('.slider-arrow--left'),
          controls: Y.one('.navigation-items')
        },
        refreshOnResize: true,
        refreshOnOrientationChange: true,
        loop: false
      });

      //Bind headerGallery events
      // set color info for active slide
      this.headerGallery.on('init', function (evt) {
        Y.later(500, this, function() { this._moveSlideIndicator(evt) });
        Y.Squarespace.FrontSite.Core.switchHeader(this.slider.one('.slide.sqs-active-slide').getAttribute('data-color'), false, true);
      }, this);

      // update colors, move indicator
      this.headerGallery.before('currentIndexChange', function (evt) {
        var color = this.slider.all('.slide').item(evt.newVal).getAttribute('data-color');
        this._moveSlideIndicator( evt, { 'activeNav' : evt.newVal });
        Y.Squarespace.FrontSite.Core.switchHeader(color, false, true);
        this._switchArrows(color);
        this._taglineColor(color);
      }, this);

      // change content when gallery index changes (for arrows, keypress, etc.)
      this.headerGallery.after('currentIndexChange', function (evt) {

        // Keyboard events?
        if (!this.eventData) {
          this.eventData = {
            from: window.location.pathname,
            slider: true
          }
        }

        var link = this.slideNav.all('.nav-item').item(evt.newVal).one('a');
        if(link.getAttribute('href') !== window.location.pathname) {
          if (!!this.canvasVideo) {
            for (var c = 0; c < this.canvasVideo.length; c++) {
              if (this.canvasVideo[c]) {
                this.canvasVideo[c].destroy();
              }
            }
            this.canvasVideo = null;
          }
          Y.Squarespace.FrontSite.Core._switchContent(link.getAttribute('data-content-target'), link.getAttribute('href'))
        }

        Y.Squarespace.FrontSite.Core.trackEvent('frontsite_tour_pageview', {
          tourSection: this._getActiveMode(evt.newVal),
          fromURL: this.eventData.from,
          slider: this.eventData.slider
        });

        this.eventData = null;
      }, this);

      // update the active slide based on the URL (when coming directly to a secondary vertical)
      slideIndex = this.slideNav.one('.nav-item--' + this.args.mode).getAttribute('data-index');
      this.headerGallery.set('currentIndex', slideIndex);
      this.slider.setStyle('opacity', 1);

      this.galleries.push(this.headerGallery);
    },


    /*
     * Update title and tagline color classes // must be extended to use short codes
     */
    _sliderTextColor: function () {
      this.slider.all('.slide').each(function (s) {
        var slide = Y.one(s),
            title = slide.one('.hero-title'),
            slideText = slide.one('.slide-text'),
            color = slide.getAttribute('data-color');

        if (color === 'dark') {
          slideText.addClass('slide-text--dark');
          slideText.one('.button').addClass('button-square-dark');
          slideText.one('.button').removeClass('button-square-light');
        } else {
          slideText.one('.button').addClass('button-square-light');
          slideText.one('.button').removeClass('button-square-dark');
        }
      });
    },


    /*
     * Move the slide indicator
     */
    _moveSlideIndicator : function (evt, args){
      var left = this.slideIndicator.one('.indicator--left')
          notch = this.slideIndicator.one('.indicator--notch'),
          activeNav = typeof args === 'object' && typeof args.activeNav === 'number' ? Y.all('.navigation-horizontal .nav-item').item(args.activeNav) : Y.one('.navigation-horizontal .sqs-active-slide'),
          leftWidth = activeNav.get('region').left + (parseInt(activeNav.get('clientWidth')) / 2) - (parseInt(notch.get('clientWidth')) / 2);

      if (evt.type !== 'scroll') {
        this._mobileNavScroll(activeNav);
      }

      if (typeof args === 'object' && typeof args.activeNav === 'number') {
        Y.one('.indicator--left').addClass('is--animated');
        Y.later(750, this, function() {
          Y.one('.indicator--left').removeClass('is--animated');
        });
      }
      left.setStyle('width', leftWidth);
      if (leftWidth <= 0) {
        this.slideIndicator.setStyles({
          'left': -50,
          'background-color': '#fff'
        });
      }
      else {
        this.slideIndicator.setStyles({
          'left': null,
          'background-color': null
        });
      }
    },


    /*
     * Scroll the active horizontal nav item into view
     */
    _mobileNavScroll: function(activeNav) {
      if (Y.one('.navigation-items').getStyle('overflow-x') !== 'scroll') {
        return;
      }
      var navigationItems = document.getElementsByClassName('navigation-items')[0],
          itemRegion = activeNav.get('region');
      if (Y.one(window).get('winWidth') < itemRegion.right) {
        navigationItems.scrollLeft += itemRegion.right + parseInt(activeNav.getComputedStyle('margin-right')) - Y.one(window).get('winWidth');
      }
      else if (itemRegion.left < 0) {
        navigationItems.scrollLeft -= Math.abs(itemRegion.left) + parseInt(activeNav.getComputedStyle('margin-left'));
      }
    },


    /*
     * sticky horizontal navigation
     */
    _stickyNav: function () {
      if (Y.one('html').hasClass('ios')) {
        return;
      }
      if (Y.one(window).get('winWidth') <= 767 || window.innerHeight <= 600) {
        if (this.slideNav.hasClass('navigation--sticky')) {
          this.slideNav.removeClass('navigation--sticky');
          this.slideNav.get('parentNode').removeClass('navigation-inside-is-sticky');
          if (this.slider) {
            this.slider.removeClass('sticky');
            this.slider.setStyle('top', null)
            Y.one('.inject-point--secondary').setStyle('margin-top', null);
          }
        }
        return;
      }

      var observedStickyHeaderHeight = 91;
      if (this.args.observedStickyHeaderHeight) {
        observedStickyHeaderHeight = this.args.observedStickyHeaderHeight;
      }

      if(Y.one('.inject-point--secondary').get('region').top - pageYOffset < observedStickyHeaderHeight) {
        this.slideNav.addClass('navigation--sticky');
        this.slideNav.get('parentNode').addClass('navigation-inside-is-sticky');

        if (this.slider) {
          this.slider.addClass('sticky');
          var marginOffset = this.slider.get('clientHeight') + (document.body.clientWidth > 800 ? 147 : 78);
          this.slider.setStyles({
            'top': 0 - marginOffset + 'px'
          });
          Y.one('.inject-point--secondary').setStyle('margin-top', marginOffset + 'px');
        }
      }

      else if(Y.one('.inject-point--secondary').get('region').top - pageYOffset >= observedStickyHeaderHeight && this.slideNav.hasClass('navigation--sticky')) {
        this.slideNav.removeClass('navigation--sticky');
        this.slideNav.get('parentNode').removeClass('navigation-inside-is-sticky');

        if (this.slider) {
          this.slider.removeClass('sticky');
          this.slider.setStyles({
            'top': null
          });
          Y.one('.inject-point--secondary').setStyle('margin-top', null);
        }
      }
      if(this.slideNav.one('.nav-item .icon').get('region').top - pageYOffset < 0 && !this.slideNav.hasClass('initial-animation')) {
        this.slideNav.addClass('initial-animation');
      }

      else if(this.slideNav.one('.nav-item .icon').get('region').top - pageYOffset >= 0 && this.slideNav.hasClass('initial-animation')) {
        this.slideNav.removeClass('initial-animation');
      }
    },

    /*
     * Change a style sttribute for an element to a specific value on scroll
     */
    _scrollWatcher : function ( el, property, endValue, offsetStart, offsetEnd, log ){
      // catch errors in arguments
      el = typeof el === "string" ? Y.all(el) : el;

      if (el.size() === 0 || el.item(0).getStyle(property) === 'undefined' || isNaN(parseInt(el.item(0).getStyle(property)))) {
        //TODO: detach this listener first
        return;
      }

      var offsetY = Y.Squarespace.FrontSite.Core._winY();
      offsetStart = parseInt(offsetStart);
      offsetEnd = parseInt(offsetEnd);
      endValue = parseInt(endValue);

      for(var ii = 0; ii < el.size(); ii++) {
        thisEl = el.item(ii);
        if (!thisEl.getAttribute('data-transition-start')) {
          thisEl.setAttribute('data-transition-start', thisEl.getStyle(property));
        }
        var startValue = parseInt(thisEl.getAttribute('data-transition-start'));
        var currentValue;

        //check Y.Squarespace.FrontSite.Core._winY()
        if (offsetY >= offsetStart && offsetY <= offsetEnd) {
          var percent = (offsetEnd - offsetY) / (offsetEnd - offsetStart);
          if (startValue > endValue) {
            currentValue = startValue * percent + endValue;
          }
          else {
            currentValue = endValue - (endValue * percent) + startValue;
          }
        }
        else if (offsetY < offsetStart) {
          currentValue = startValue;
        }
        else if (offsetY > offsetEnd) {
          currentValue = endValue;
        }

        thisEl.setStyle(property, currentValue);
      }
    },


    /*
     * Learn more scroll animation on click
     */
    _tapToScroll : function ( e, args ){
      var scrollY = (typeof args === 'object' && args.top === true) ? 0 : Y.one('.inject-point--secondary').get('region').top - 85; /* ok, so what is 85? */
      var windowScroll = new Y.Anim({
        node: Y.UA.gecko ? 'html' : 'body',
        to: {
          scroll: [0, scrollY]
        },
        duration: 1,
        easing: 'easeBoth'
      });

      var scrollTimer = setTimeout(function() {
        windowScroll.run();
      }, ((typeof args === 'object' && args.top === true) ? 200 : 0));
    },


    /*
     * Light/dark versions of the arrows
     */
    _switchArrows: function (mode, force) {
      var arrows = Y.all('.slider-arrow');

      if (mode === 'light' && (force || arrows.item(0).hasClass('slider-arrow--dark'))) {
        arrows.removeClass('slider-arrow--dark');
        arrows.removeClass('slider-arrow--dark');
      } else if (mode === 'dark' && (force || !arrows.item(0).hasClass('slider-arrow--dark'))) {
        arrows.addClass('slider-arrow--dark');
        arrows.addClass('slider-arrow--dark');
      }
    },


    /*
     * Light/dark versions of the tagline text
     */
    _taglineColor: function (mode, force) {
      var tagline = Y.all('.hero-tagline');

      if (mode === 'light' && (force || !tagline.item(0).hasClass('hero-tagline--light'))) {
        tagline.item(0).addClass('hero-tagline--light');
        tagline.item(1).addClass('hero-tagline--light');
      } else if (mode === 'dark' && (force || tagline.item(0).hasClass('hero-tagline--light'))) {
        tagline.item(0).removeClass('hero-tagline--light');
        tagline.item(1).removeClass('hero-tagline--light');
      }
    },

    /*
     * Update attribution text
     */
    _setAttribution: function () {
      Y.one('.attribution') && Y.one('.attribution').on('click', function (e) {
        var info = e.currentTarget.one('a'),
          identifier = info.getAttribute('data-identifier'),
          baseTemplate = info.getAttribute('data-base-template'),
          customDomain = info.getAttribute('data-url');

        var args = {'identifier': identifier, 'baseTemplate': baseTemplate, 'customDomain': customDomain};
        this._showProfile(args);
      }, this);
    },


    /*
     * Customer example lightbox
     */
    _showProfile : function (args) {
      if(typeof args === 'object' && typeof args.identifier === 'string' && typeof args.baseTemplate === 'string') {
        args.ctaButton = (args.baseTemplate === "Developer") ? 'hide' : 'view';

        Y.Squarespace.FrontSite.Core.siteFilter.showProfile({
          identifier: args.identifier,
          baseTemplate: args.baseTemplate,
          cta: args.ctaButton,
          customDomain: args.customDomain,
          deepLink: args.deepLink
        });
      }
    },


    /*
     * Change device sizes
     */
    _switchDeviceSizes: function (deviceName, breakpoint, subclass, container) {
      if (Y.all('.' + deviceName).size() === 0) {
        return;
      }
      var device = container ? Y.one(container).all('.' + deviceName) : Y.all('.' + deviceName),
          winWidth = Y.one(window).get('winWidth');

      if (device.size() > 0 && winWidth <= breakpoint && !device.item(0).hasClass(deviceName + subclass)) {
        for (var ii = 0; ii < device.size(); ii++) {
          device.item(ii).addClass(deviceName + subclass);
        }
      } else if (device.size() > 0 && winWidth > breakpoint && device.item(0).hasClass(deviceName + subclass)) {
        for (var ii = 0; ii < device.size(); ii++) {
          device.item(ii).removeClass(deviceName + subclass);
        }
      }
    },


    /*
     * Scale device sizes
     */
    _scaleDeviceSizes: function (deviceName) {
      var device = Y.all('.' + deviceName),
          winWidth = Y.one(window).get('winWidth');

      if (device.size() > 0) {
        for (var ii = 0; ii < device.size(); ii++) {
          var thisDevice = device.item(ii);
          if(!thisDevice.getAttribute('data-device-ratio')) {
            if (deviceName === 'ipadmini-landscape') {
              thisDevice.setAttribute('data-device-ratio', 0.675);
            }
            else {
              thisDevice.setAttribute('data-device-ratio', thisDevice.get('clientHeight')/thisDevice.get('clientWidth'));
            }
          }
          thisDevice.setStyle('width', '100%');
          thisDevice.setStyle('height', parseInt(thisDevice.getComputedStyle('width')) * thisDevice.getAttribute('data-device-ratio'));
          thisDevice.setStyle('border-radius', (parseInt(thisDevice.getComputedStyle('width')) * 0.045) + 'px');

          // TODO: activate via an option
          thisDevice.setStyle('margin-top', -thisDevice.get('clientHeight') / 2);
        }
      }
    },


    /*
     * Scale custom care image size
     */
    _scaleCustomerCareImage: function () {
      if (!Y.one('.support')) {
        return;
      }
      var imgs = Y.one('.support').all('img[data-load]'),
          winWidth = Y.one(window).get('winWidth');
      if (imgs.size() > 0) {
        if (Y.one('.hiDPI')) {
          Y.Squarespace.FrontSite.Core.retinaLoader._checkImages('hires');
        }
        else {
          Y.Squarespace.FrontSite.Core.retinaLoader._checkImages('load');
        }
      }
    },


    /*
     * Page specific modes
     */
     pageFunction: {
      'company': function(context) {
        console.log('company');
      },

      'values': function(context) {
        console.log('values');
      },

      'team': function(context) {
        console.log('team');
        context.subpage = new Y.Squarespace.FrontSite.AboutTeam();
      },

      'careers': function(context) {
        console.log('careers');
        context.subpage = new Y.Squarespace.FrontSite.Careers();
      },

      'contact': function(context) {
        console.log('contact');

        var contactform = Y.one('#contactForm');
        if(contactform) {
          contactform.detachAll();
          contactform.on('load', function(i) {
            if(i.target.getAttribute('src')) {
              window.scrollTo(0,0);
            }
          }, this)
          contactform.setAttribute('src', 'http://help.squarespace.com/customer/emails/new');
        }
        context.subpage = new Y.Squarespace.FrontSite.CustomMap();

        Y.later(300, this, function () {
          if (Y.one('.inject-point--secondary').hasClass('is--faded')) {
            Y.one('.inject-point--secondary').removeClass('is--faded');
          }
        });
      },

      'overview': function(context) {
        /*Y.all('canvas[data-video-source]').each(function(canvas) {
          Y.Squarespace.FrontSite.Core.setCanvasVideo({canvasNode: canvas});
        });*/


        /*Y.Squarespace.FrontSite.Core.setCanvasVideo({
          canvasNode: Y.one('.iphone-render canvas'),
          source: {
            x: 1441,
            y: 0,
            width: 320,
            height: 568
          }
        });*/

        // Y.Squarespace.FrontSite.Core.setCanvasVideo({
        //   canvasNode: Y.one('.macbook-render canvas'),
        //   source: {
        //     x: 0,
        //     y: 0,
        //     width: 1920,
        //     height: 1080
        //   },
        //   filter: {
        //     'type': 'replaceColor',
        //     'args': {
        //       'fromRGBA': [4, 255, 0, 255],
        //       'toRGBA': [0, 0, 0, 0],
        //       'range': 0.2
        //     }
        //   }
        // });

      }

     }


  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});
