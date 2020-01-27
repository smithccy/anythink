
/*
 * Stories
 */
Y.add('squarespace-stories', function(Y) {

  Y.namespace('Squarespace.FrontSite').Stories = Y.Base.create('Stories', Y.Base, [], {

    /*
     * Init
     */
    initializer: function() {
      /*      if (document.location.pathname === '/') {
        SQUARESPACE_IS_AWESOME.router.save('/stories/');
        document.location.pathname = '/stories/';
      }*/

      this._setSlides({'prevent': ['parts-and-labor', 'claire-mazur', 'paul-pope', 'justin-gignac']});
      this.urlAttribution = '';

      this.videoData = new Array();
      this.videoWrapper = Y.one('.video-wrapper');

      this.logo = Y.one('.logo');
      this.nav = Y.one('.navigation-actions');
      this.slides = Y.all('.slider-slide');
      this.totalSlides = this.slides.size();
      this.marketing = Y.one('.marketing');
      this.overlay = Y.one('.marketing-overlay');
      this.slider = Y.one('.slider');
      this.controls = Y.one('.video-controls');
      this.button = this.marketing.all('.button');

      this.arrows = Y.all('.slider-arrow');
      this.layout = Y.one('.layout');

      this.leftArrow = Y.one('.slider-arrow--left');
      this.rightArrow = Y.one('.slider-arrow--right');
      this.title = Y.one('.marketing-title-text');
      this.attribution = Y.one('.marketing-attribution');
      this.customer = Y.one('.marketing-attribution-name');
      this.customerTag = Y.one('.marketing-attribution-sub');
      this.closeVideo = Y.all('.video-close');

      this.video = new Y.Squarespace.FrontSite.HTML5Video({
        container: this.videoWrapper,
        pauseDelay: 3000,
        // G.V.L.P.D -- Global video loop pause duration
        callback: Y.bind(this._videoCallback, this),
        progress: Y.one('.video-progress'),
        toggle: Y.one('.video-toggle'),
        controls: this.controls
      });

      this.autoplayMode = 'advance';
      if (this.autoplayMode && typeof this.autoplayMode != 'undefined') {
        var interval = (!Y.UA.ios && !Y.one('.safari')) ? 7000 : 10000;
        this.autoplayTimer = Y.later(interval, this, this._autoplay, null, true);
      }

      if (!this.video.HTML5VideoSupport) {
        this.attribution.setStyle('display', 'none');
      }

      this.events = [];
      this.animTimers = [];

      SQUARESPACE_IS_AWESOME.tourLink(true);
      SQUARESPACE_IS_AWESOME.loginLink(true);

      this._parseSlides();
      this._render();
      this._bindEvents();
      this._setShareStory(0);

      this.detect = new Y.Squarespace.FrontSite.Detect({
        target: Y.all('.slider-arrow .icon, .slider-dot .icon, .marketing-video-play .icon, .marketing-attribution-name'),
        changeParent: true,
        accuracy: 100
      });

      var story = window.location.hash;
      if (story) {
        if (story.indexOf('?') >= 0) {
          this.urlAttribution = story.substring(story.indexOf('?'));
          story = story.substring(1, story.indexOf('?'));
        }
        else {
          story = story.substring(1);
        }

        this.slides.some(function(s, index) {
          if (s.getAttribute('data-slide-story') === story) {
            this._moveSlider(index, true);
            return true;
          }
        }, this);
      } else {
        this._colorDetect();
      }
    },


    /*
     * Destroy
     */
    destructor: function() {
      for (var e = 0; e < this.events.length; e++) {
        this.events[e].detach();
      }

      this.video.destroy();
      this.detect && this.detect.destroy();
    },


    /*
     * Randomize the order of the stories while displaying the "Space" text, attribution and video on the first slide regardless of persona.
     * preventedSlides: array, value of 'data-slide-story'. If present, this slide (or these slides) will be moved to the end of the series if it was (they were) randomized to the first position.
     */
    _setSlides: function(preventedSlides, preferredSlides) {
      var slider = Y.one('.slider');

      // give preventedSlides a class to easily retrieve them below
      if (preventedSlides) {
        for (var ii = 0; ii < preventedSlides.prevent.length; ii++) {
          slider.one('.slider-slide[data-slide-story="' + preventedSlides.prevent[ii] + '"]').addClass('tolast');
        }
      }

      // give preferredSlides a class to easily retrieve them below
      if (preferredSlides) {
        for (var ii = 0; ii < preferredSlides.prefer.length; ii++) {
          slider.one('.slider-slide[data-slide-story="' + preferredSlides.prefer[ii] + '"]').addClass('tofirst');
        }
      }

      Array.prototype.shuffle = function() {
        var s = [];
        while (this.length) s.push(this.splice(Math.random() * this.length, 1));
        while (s.length) this.push(s.pop());
        return this;
      }
      var allStories = slider.all('.slider-slide');
      var randomArray = new Array();
      for (var ii = 0; ii < allStories.size(); ii++) {
        randomArray[ii] = ii;
      }
      var holder = Y.Node.create('<div id="wrapper"></div>');

      randomArray = randomArray.shuffle();

      for (var ii = 0; ii < randomArray.length; ii++) {
        holder.append(allStories.item(randomArray[ii]));
      }

      // if any of the preventedSlides are in the first position, move it to the end. If the new first slide is also a preventedSlide, move it, etc.
      while (holder.one('.slider-slide').hasClass('tolast')) {
        console.log('Moved: ' + holder.one('.tolast').getAttribute('data-slide-story'));
        holder.append(holder.one('.tolast'));
      }

      // moved each preferredSlide to the beginning, in the order they are listed in _setSlides argument
      if (holder.one('.tofirst')) {
        console.log('Moved: ' + holder.one('.tofirst').getAttribute('data-slide-story'));
        holder.prepend(holder.one('.tofirst'));
      }

      var gignac = holder.one('.slider-slide[data-slide-story="justin-gignac"]');
      var pope = holder.one('.slider-slide[data-slide-story="paul-pope"]');
      var sandwichMeat = holder.one('.slider-slide:not([data-slide-story="paul-pope"]):not([data-slide-story="justin-gignac"]):not(:first-child)');

      if (gignac.next() && gignac.next() === pope) {
        gignac.insert(sandwichMeat, 'after');
        console.log('moved '+ sandwichMeat.getAttribute('data-slide-story') +' after gignac')
      }
      else if (gignac.previous() && gignac.previous() === pope) {
        gignac.insert(sandwichMeat, 'before');
        console.log('moved '+ sandwichMeat.getAttribute('data-slide-story') +' before gignac')
      }

      /*holder.one('.slider-slide').setAttribute('data-slide-title', 'Space')
                                 .setAttribute('data-slide-video-mp4', 'http://cf.squarespace.com/stories/anthem-60-1280x720.mp4')
                                 .setAttribute('data-slide-video-mp4-sd', 'http://cf.squarespace.com/stories/anthem-60-640x360.mp4')
                                 .setAttribute('data-slide-video-ogg', 'http://cf.squarespace.com/06172013/SQSP-60-lv.ogv')
                                 .setAttribute('data-slide-customer', 'Anthem');*/

      slider.prepend(holder.get('innerHTML'));
    },


    /*
     * Move the selected story/slide to the first position, leaving the remaining slides in their initial order
     */
    _setFirstSlide: function(num) {
      Y.one('.slider').prepend(Y.one('.slider').all('.slider-slide').item(num));
    },


    /*
     * Get slide data
     */
    _parsePauses: function(p) {
      if (p) {
        p = p.split(',');
        for (var i = 0; i < p.length; i++) {
          p[i] = parseFloat(p[i]);
        }
      }
      return p;
    },


    /*
     * Get slide data
     */
    _parseSlides: function() {
      this.slides.each(function(slide) {
        this.videoData.push({
          title: slide.getAttribute('data-slide-title'),
          customer: slide.getAttribute('data-slide-customer'),
          hashlink: slide.getAttribute('data-slide-story'),
          mp4: {
            loop: slide.getAttribute('data-slide-loop-mp4'),
            video: slide.getAttribute('data-slide-video-mp4'),
            videoSD: slide.getAttribute('data-slide-video-mp4-sd')
          },
          ogg: {
            loop: slide.getAttribute('data-slide-loop-ogg'),
            video: slide.getAttribute('data-slide-video-ogg')
          },
          context: slide.getAttribute('data-slide-context') || 'dark',
          pauses: this._parsePauses(slide.getAttribute('data-slide-pauses'))
        });
      }, this);
    },


    /*
     * Change slide title
     */
    _setText: function() {
      var index = this.get('slideIndex');

      this.button.removeClass('button--small').removeClass('button--mini');
      if (document.body.clientWidth <= 768 || window.innerHeight <= 500) {
        this.button.addClass('button--mini');
      } else if (document.body.clientWidth <= 1200) {
        this.button.addClass('button--small');
      }

      this.title.set('innerHTML', this.videoData[this.get('slideIndex')].title);
      this.customer.set('innerHTML', this.videoData[this.get('slideIndex')].customer.replace(' x ', ' &times; '));

      if (index === 0 || this.videoData[this.get('slideIndex')].hashlink === 'hide-x-stitch' || this.videoData[this.get('slideIndex')].customer === 'Anthem') {
        this.customerTag.set('innerHTML', 'Watch the Ad');
      } else {
        this.customerTag.set('innerHTML', 'Watch Customer Story');
      }

      /*      this.customerTag.set('innerHTML', 'Watch Our Big Game Ad');*/

      this.marketing.setStyle('marginTop', -this.marketing.get('clientHeight') / 2);

      this.dots.removeClass('slider-dot--active');
      this.dots.item(this.get('slideIndex')).addClass('slider-dot--active');

      this.videoWrapper.setStyles({
        'width': document.body.clientWidth,
        'height': window.innerHeight
      });

      this.overlay.setStyles({
        'width': document.body.clientWidth,
        'height': window.innerHeight
      });

      // Position attribution
      if (this.video.HTML5VideoSupport) {
        this.attribution.setStyle('bottom', -(window.innerHeight / 2) + (this.marketing.get('clientHeight') / 2) + this.attribution.get('clientHeight') - 10);
      }
    },


    /*
     * Light/dark slide
     */
    _changeContext: function(mode, animate) {
      if (this.videoData[this.get('slideIndex')].context === 'dark') {
        if (!mode || mode === 'header') {
          SQUARESPACE_IS_AWESOME.switchHeader('dark', animate !== undefined ? animate : true, true);

          this.arrows.addClass('is--transparent');
          this.animTimers.push(Y.later(600, this, function() {
            this.arrows.addClass('slider-arrow--dark');
            this.arrows.removeClass('is--transparent');
          }));
        }

        if (!mode || mode === 'text') {
          this.marketing.addClass('marketing--dark');
          this.button.addClass('button--dark');
        }
      } else {
        if (!mode || mode === 'header') {
          SQUARESPACE_IS_AWESOME.switchHeader('light', animate !== undefined ? animate : true, true);

          this.arrows.addClass('is--transparent');
          this.animTimers.push(Y.later(600, this, function() {
            this.arrows.removeClass('slider-arrow--dark');
            this.arrows.removeClass('is--transparent');
          }));
        }

        if (!mode || mode === 'text') {
          this.marketing.removeClass('marketing--dark');
          this.button.removeClass('button--dark');
        }
      }
    },


    _setShareStory: function(newIndex) {
      var sharedURL = encodeURIComponent(document.location.origin) + encodeURIComponent('stories/index.html#') + encodeURIComponent(this.videoData[newIndex].hashlink),
        twitterButton = Y.one('.video-share--twitter a'),
        tweetBaseURL = 'https://twitter.com/intent/tweet?',
        tweetShareURL = 'original_referer=' + sharedURL + '&text=' + encodeURIComponent('Watch the ' + this.videoData[newIndex].customer + " video on @Squarespace at") + '&tw_p=tweetbutton&url=' + sharedURL,
        facebookButton = Y.one('.video-share--facebook a'),
        fbBaseURL = 'https://www.facebook.com/sharer/sharer.php?u=';

      twitterButton && twitterButton.detach('click') && twitterButton.setAttribute('href', (tweetBaseURL + tweetShareURL)).on('click', function(e) {
        e.preventDefault();
        window.open((tweetBaseURL + tweetShareURL), 'tweet', 'width=650, height=480');
      });

      facebookButton && facebookButton.detach('click') && facebookButton.setAttribute('href', (fbBaseURL + sharedURL)).on('click', function(e) {
        e.preventDefault();
        window.open((fbBaseURL + sharedURL), 'facebook-share-dialog', 'width=626, height=436');
      });
    },


    /*
     * Animate slider
     */
    _moveSlider: function(newIndex, disableTimers) {
      var currentIndex = this.get('slideIndex'),
        delta = Math.abs(newIndex - this.get('slideIndex'));

      if (this.overlay.hasClass('marketing-overlay--visible') || this.slider.hasClass('slider--in-motion')) {
        return;
      }

      this.set('slideIndex', newIndex);

      if (currentIndex !== this.get('slideIndex')) {
        this.video.pause();
        this.video.enableCallbacks = false;

        while (this.animTimers.length > 0) {
          this.animTimers[0] && this.animTimers[0].cancel();
          this.animTimers.splice(0, 1);
        }

        SQUARESPACE_IS_AWESOME.router.save('stories/#' + this.videoData[newIndex].hashlink + this.urlAttribution);
        var metaNewURL = document.location.origin + '/stories/#' + this.videoData[newIndex].hashlink;
        var metaItemprop = Y.one('meta[itemprop="url"]'),
          metaOGURL = Y.one('meta[property="og:url"]');
        metaItemprop && metaItemprop.setAttribute('content', metaNewURL); // This one seems to matter for Facebook sharing link URL in user post.
        metaOGURL && metaOGURL.setAttribute('content', metaNewURL); // Even though this one is for the FB Open Graph. Weird.
        this._setShareStory(newIndex);

        this.marketing.removeClass('marketing--fadein');
        this.marketing.addClass('is--transparent');

        this.animTimers.push(Y.later(disableTimers ? 0 : 150, this, function() {
          this.slider.addClass('slider--in-motion');

          disableTimers && this.slider.addClass('no-transition');

          if (!disableTimers && delta > 2) {
            delta = (0.6 + (delta / 5)) + 's';

            this.slider.setStyles({
              'webkitTransitionDuration': delta,
              'mozTransitionDuration': delta,
              'msTransitionDuration': delta,
              'oTransitionDuration': delta,
              'transitionDuration': delta
            });
          }

          // TODO: ideally, the test should be Modernizr.csstransforms3d but it returns a false negative on firefox
          //       safari check -- disable 3d transforms to avoid flickering
          if (Y.one('html').hasClass('safari') || (Y.UA.ie && Y.UA.ie <= 9)) {
            this.slider.setStyle('left', (-100 * this.get('slideIndex')) + '%');
          } else {
            this.slider.setStyles({
              'webkitTransform': 'translate3d(' + (-this.get('slideIndex') * this.slideWidth + '%, 0, 0)'),
              'mozTransform': 'translate3d(' + (-this.get('slideIndex') * this.slideWidth + '%, 0, 0)'),
              'msTransform': 'translate3d(' + (-this.get('slideIndex') * this.slideWidth + '%, 0, 0)'),
              'oTransform': 'translate3d(' + (-this.get('slideIndex') * this.slideWidth + '%, 0, 0)'),
              'transform': 'translate3d(' + (-this.get('slideIndex') * this.slideWidth + '%, 0, 0)')
            });
          }

          disableTimers && this.slider.removeClass('no-transition');

          if (this.get('slideIndex') === 0) {
            this.leftArrow.addClass('slider-arrow--disabled');
          } else {
            this.leftArrow.removeClass('slider-arrow--disabled');
          }

          if (this.get('slideIndex') === this.totalSlides - 1) {
            this.rightArrow.addClass('slider-arrow--disabled');
          } else {
            this.rightArrow.removeClass('slider-arrow--disabled');
          }

          this._changeContext('header');

          this.animTimers.push(Y.later(disableTimers ? 0 : 700, this, function() {
            this._changeContext('text');
            this._setText();
            this._showVideo(false);
            this.marketing.addClass('marketing--fadein');
            this.marketing.removeClass('is--transparent');

            this.video.enableCallbacks = true;
            this._playLoop();

            this.animTimers.push(Y.later(disableTimers ? 0 : 400, this, function() {
              this.slider.setStyles({
                'webkitTransitionDuration': null,
                'mozTransitionDuration': null,
                'msTransitionDuration': null,
                'oTransitionDuration': null,
                'transitionDuration': null
              });

              this.slider.removeClass('slider--in-motion');
            }));
          }));
        }));
      }
    },


    /*
     * Color detection - el vs. current slide image
     */
    _colorDetect: function() {
      try {
        this.detect.updateImage(this.slides.item(this.get('slideIndex')).one('img'));
        this.detect.test();
      } catch (e) {
        console.log('#### Detection Error:');
        console.log(e);
      }
    },


    /*
     * Respond to dot clicks
     */
    _useDots: function(e) {
      if (e.currentTarget !== this.dots.item(this.get('slideIndex'))) {
        this.dots.some(function(dot, index) {
          if (e.currentTarget === dot) {
            this._moveSlider(index);

            SQUARESPACE_IS_AWESOME.trackEvent('frontsite_stories_submenu_click', {
              submenuName: this.videoData[index].customer
            });
            return true;
          }
        }, this);
      }
    },


    /*
     * Shortcuts
     */
    _keyEvents: function(e) {
      var code = e.keyCode,
        index = this.get('slideIndex');

      if (code === 37) {
        this.autoplayTimer.cancel();
        this._moveSlider(--index);

        SQUARESPACE_IS_AWESOME.trackEvent('frontsite_stories_arrow_click', {
          right: false
        });
      } else if (code === 39) {
        this.autoplayTimer.cancel();
        this._moveSlider(++index);

        SQUARESPACE_IS_AWESOME.trackEvent('frontsite_stories_arrow_click', {
          right: true
        });
      }
    },


    /*
     * Bring video and overlay in focus
     */
    _alignVideo: function() {
      this.videoWrapper.setStyle('left', this.get('slideIndex') * document.body.clientWidth);
      this.overlay.setStyle('left', this.get('slideIndex') * document.body.clientWidth);
    },


    /*
     * Recalculate stuff
     */
    _windowResize: function(e) {
      this._setText();
      this._alignVideo();
    },


    /*
     * Autoplay/bounce to indicate more stories are available
     */
    _autoplay: function() {
      var index = this.get('slideIndex');

      if (this.autoplayMode === 'advance') {
        if (index >= 0 && index != (this.totalSlides - 1)) {
          this._moveSlider(++index);
        } else {
          this._moveSlider(0);
        }
      } else if (this.autoplayMode === 'bounce') {
        if (index == this.totalSlides - 1) {
          this.slider.addClass('slider--peek-left');
        } else {
          this.slider.addClass('slider--peek-right');
        }
      } else {
        this.autoplayTimer.cancel();
      }
    },


    /*
     * Events
     */
    _bindEvents: function() {
      var gestureStart, gestureEnd, verticalDelta, horizontalDelta, index;

      this.events.push(Y.one('.customer-login').on('click', function(e) {
        SQUARESPACE_IS_AWESOME.trackEvent('frontsite_stories_login_click');
      }, this));

      this.events.push(Y.one('.navigation-trigger').on('click', function(e) {
        SQUARESPACE_IS_AWESOME.trackEvent('frontsite_stories_menu_click');
      }, this));

      this.leftArrow.on('click', function(e) {
        var index = this.get('slideIndex');
        this._moveSlider(--index);

        SQUARESPACE_IS_AWESOME.trackEvent('frontsite_stories_arrow_click', {
          right: false
        });
      }, this);

      this.rightArrow.on('click', function(e) {
        var index = this.get('slideIndex');
        this._moveSlider(++index);

        SQUARESPACE_IS_AWESOME.trackEvent('frontsite_stories_arrow_click', {
          right: true
        });
      }, this);

      this.marketing.delegate('click', this._useDots, '.slider-dot', this);

      this.events.push(
      Y.one('header .logo').on('click', function() {
        this._moveSlider(0);
      }, this));

      /*Y.one(document).once('click', function(e) {
        DetailsGallery.autoplayTimer.cancel();
        DetailsGallery.autoplay = false;
      }, this);*/

      this.events.push(Y.one(document).on('keydown', this._keyEvents, this));
      this.events.push(Y.one(window).on(window.orientation !== undefined ? 'orientationchange' : 'resize', this._windowResize, this));

      this.attribution.on('click', this._playVideo, this);
      //this.attribution.on();

      this.closeVideo.each(function (c) {
        c.on('click', this.close, this);
      }, this);

      this.videoWrapper.one('.button').on('click', function(e) {
        e.currentTarget.setStyle('display', 'none');

        this.logo.removeClass('is--invisible').removeClass('is--transparent');
        this.nav.removeClass('is--invisible').removeClass('is--transparent');
      }, this);

      /*Modernizr.touch && this.marketing.on('gesturemovestart', function (e) {
        e.stopPropagation();
        gestureStart = [e.pageX, e.pageY];

        e.currentTarget.once('gesturemoveend', function (e) {
          gestureEnd = [e.pageX, e.pageY];
          verticalDelta = Math.abs(gestureStart[1] - gestureEnd[1]);
          horizontalDelta = gestureStart[0] - gestureEnd[0];

          if (verticalDelta < 25 && Math.abs(horizontalDelta) > 75) {
            index = this.get('slideIndex');

            if (horizontalDelta > 0) {
              this._moveSlider(++index);
            } else {
              this._moveSlider(--index);
            }
          }
        }, null, this);
      }, null, this);*/

      this.slider.on('keyframeAnimationEnd', function(e, node) {
        node.removeClass('slider--bounce-left').removeClass('slider--bounce-right').removeClass('slider--peek-left').removeClass('slider--peek-right');
      });

      this.slider.on('transitionEnd', function(e, node) {
        node.removeClass('slider--bounce-left').removeClass('slider--bounce-right').removeClass('slider--peek-left').removeClass('slider--peek-right');

        if (e.propertyName && (e.propertyName.indexOf('transform') !== -1 || e.propertyName === 'left')) {
          this._colorDetect();
        }
      }, this);
    },


    /*
     * Show/hide video element
     */
    _showVideo: function(show, delay) {
      if (show) {
        this._alignVideo();

        Y.later(delay ? 600 : 0, this, function() {
          this.videoWrapper.addClass('video-wrapper--visible');
        });
      } else {
        this.videoWrapper.removeClass('video-wrapper--visible');
      }
    },


    /*
     * Callback - Video can play through
     */
    _videoCallback: function(mode, interaction) {
      if (mode === 'play') {
        this._showVideo(true, this.videoWrapper.hasClass('video-wrapper--video'));
        Loader.stop();

        if (this.videoWrapper.hasClass('video-wrapper--video')) {
          // Video
          this.videoWrapper.setStyle('zIndex', 3);
          this.controls.removeClass('is--hidden');
        } else {
          // Loop
          this.videoWrapper.setStyle('zIndex', null);
        }
      } else if (mode === 'end' && !interaction) {
        this.close();
      }
    },


    /*
     * Show loop for current slide
     */
    _playLoop: function() {
      var index = this.get('slideIndex');

      this.videoWrapper.removeClass('video-wrapper--video').addClass('video-wrapper--loop');

      if (!Y.UA.ios && !Y.UA.android) {
        this.videoWrapper.addClass('video-wrapper--visible');

        this.video.set('loop', true);
        this.video.loadVideo({
          mp4: this.videoData[index].mp4.loop,
          ogg: this.videoData[index].ogg.loop
        }, this.videoData[index].pauses, false, true);
      } else {
        // Don't even bother
        this.video.emptyVideoWrapper();
      }
    },


    /*
     * Hide overlay
     */
    close: function() {
      var index = this.get('slideIndex');

      SQUARESPACE_IS_AWESOME.trackEvent('frontsite_stories_video_close', {
        videoName: this.videoData[index].customer,
        progress: this.video.getProgress()
      });

      this.videoWrapper.removeClass('video-wrapper--visible');
      this.videoWrapper.setStyle('zIndex', null);
      this.overlay.removeClass('marketing-overlay--visible');

      Y.later(500, this, function() {
        this.logo.removeClass('is--invisible').removeClass('is--transparent');
        this.nav.removeClass('is--invisible').removeClass('is--transparent');

        this.marketing.removeClass('is--invisible').removeClass('marketing--text-scale');
        this.controls.addClass('is--hidden');
        this.arrows.removeClass('is--invisible').removeClass('is--transparent');

        SQUARESPACE_IS_AWESOME.escTarget('remove', 'video');
        this._playLoop();
      });
    },

    /*
     * Show video for current slide
     */
    _playVideo: function() {
      var index = this.get('slideIndex');

      this.videoWrapper.removeClass('video-wrapper--loop').addClass('video-wrapper--video');

      this.logo.addClass('is--transparent');
      this.nav.addClass('is--transparent');
      Y.later(300, this, function() {
        this.logo.addClass('is--invisible');
        this.nav.addClass('is--invisible');
      });

      this.overlay.addClass('marketing-overlay--visible');
      this.marketing.addClass('marketing--text-scale');
      this.video.pause();
      this.arrows.addClass('is--transparent');

      SQUARESPACE_IS_AWESOME.escTarget('add', 'video', this);

      Loader.play(this.overlay._node);

      Y.later(500, this, function() {
        this.marketing.addClass('is--invisible');
        this.arrows.addClass('is--invisible');

        this.video.set('loop', false);
        this.video.loadVideo({
          mp4: {
            hd: this.videoData[index].mp4.video,
            sd: this.videoData[index].mp4.videoSD
          },
          ogg: {
            hd: this.videoData[index].ogg.video,
            sd: this.videoData[index].ogg.video
          }
        }, null, true);

        SQUARESPACE_IS_AWESOME.trackEvent('frontsite_stories_video_begin', {
          videoName: this.videoData[index].customer
        });
      });
    },


    /*
     * Toggle visibility of certain elements (called on load)
     */
    _showElements: function() {
      this.marketing.removeClass('is--invisible').removeClass('is--transparent');
      this.arrows.removeClass('is--invisible').removeClass('is--transparent');
      this._playLoop();
    },


    /*
     * Prepare layout
     */
    _render: function() {
      var original = [1920, 1080],
        sizes = [640, 1280, 1680],
        controls = Y.one('.slider-controls');

      // Add dots
      for (var s = 0; s < this.totalSlides; s++) {
        controls.appendChild(Y.Node.create('<span class="slider-dot"><div class="icon"></div></span>'));
      }
      this.dots = Y.all('.slider-dot');

      //this.slideWidth = Y.UA.ios ? 14.286 : 100 / this.totalSlides; // Creepy
      this.slideWidth = parseFloat((100 / this.totalSlides).toFixed(3));
      this.slider.setStyle('width', 100 * this.totalSlides + '%');
      this.slides.setStyles({
        'width': this.slideWidth + '%'
      });

      // Load rest of images
      Y.all('img[data-load="false"]').each(function(img) {
        var parent = img.ancestor(),
          region = [parent.get('clientWidth'), parent.get('clientHeight')],
          height = region[1],
          width, required = original[0];

        /*if (window.orientation !== undefined) {
          height = Math.max(region[0], region[1]);
          console.log('orentation -- ' + height + ' vs ' + region[1]);
        }*/

        width = Math.floor((height / original[1]) * original[0]);
        for (var s = 0; s < sizes.length; s++) {
          if (width <= sizes[s]) {
            required = sizes[s];
            break;
          }
        }

        if (window.devicePixelRatio) {
          required *= window.devicePixelRatio;
        }

        required = Math.min(required, original[0]);
        img.setAttribute('data-src', img.getAttribute('data-src-custom') + '-' + required + '.jpg');

        ImageLoader.load(img, {
          load: true
        });
        img.removeAttribute('data-load');
      });

      this._setText();
      this._changeContext(null, false);
      this._showElements();
    }

  }, {

    ATTRS: {
      slideIndex: {
        value: 0,
        setter: function(newValue) {
          if (newValue < 0) {
            this.slider.addClass('slider--bounce-left');
            newValue = 0;
          } else if (newValue > this.totalSlides - 1) {
            this.slider.addClass('slider--bounce-right');
            newValue = this.totalSlides - 1;
          }
          return newValue;
        }
      }
    }
  });

}, '1.0', {
  requires: [
    'base-build',
    'squarespace-html5-video',
    'squarespace-detect'
  ]
});


/*
 * Templates
 */
Y.add('squarespace-templates', function (Y) {

  Y.namespace('Squarespace.FrontSite').Templates = Y.Base.create('Templates', Y.Base, [], {

    /*
     * Init
     */
    initializer: function() {
      /*
       * Google Domains flow beta
       */
      if (Y.Squarespace.GoogleDomains.isGoogleDomainFlow()) {
        this.googleDomain = true;
        Y.one('body').addClass('google-domain');
        Y.one('.header h1').append('<img data-src="/assets/site/plusgoogle.png" data-hires="-2x" data-load="false" data-dimensions="105x26" alt="Google" class="logo-Google" />');
      }

      //if (Y.Cookie.get('SS_weddingtemplates') === 'true') {
      this.viewWedding = true;
      //}


      SQUARESPACE_IS_AWESOME.tourLink(true);

      this.steps = Y.one('.designs-steps');
      this.message = Y.one('.designs-message');
      this.title = Y.one('.designs-title');

      this.designs = Y.one('.designs');
      this.types = Y.one('.designs-type');
      this.intro = Y.one('.designs-intro');
      this.templates = Y.one('.designs-templates');
      this.details = Y.one('.designs-details');
      this.designsBody = Y.one('.designs-body');

      this.filtersLabel = Y.one('a.designs-filter--label');

      for (var filter in Y.Squarespace.FrontSite.TemplateFilters) {
        if (filter === 'weddings') {
          if (this.viewWedding === true) {
            Y.one('.designs-filter-group').appendChild(Y.Node.create('<a class="designs-filter designs-filter--recommended" data-filter="' + filter + '">' + filter + '</a>'));
          }
        }
        else {
          Y.one('.designs-filter-group').appendChild(Y.Node.create('<a class="designs-filter designs-filter--recommended" data-filter="' + filter + '">' + filter + '</a>'));
        }
      }

      this.filters = Y.one('.designs-filter-group');
      this.filterLinks = Y.all('.designs-filter');
      this.recommendedLinks = Y.all('.designs-filter--recommended');

      this.defaultActive = this.filtersLabel ? '' : this.recommendedLinks.item(0).getAttribute('data-filter');
      Y.Squarespace.FrontSite.ActiveTemplateFilters = Y.Squarespace.FrontSite.ActiveTemplateFilters || this.defaultActive;

      this.shotGallery;
      this.events = [];
      this.els = {};

      if (this.steps) {
        this.stepsSlider = new Y.Squarespace.FrontSite.ResponsiveSlider({
          container: this.steps.one('.container'),
          height: 130,
          breakpoint: 940
        });
      }

      if (this.message) {
        Y.one('.layout').addClass('simplemessage');
      }

      this._bindEvents();
      //this._processTypes();
      if (Y.UA.ie !== 8) {
        this.designsBody.setStyle('minHeight', window.innerHeight - this.designsBody.getY());
      }


      // Show top animations while sitefilter loads + keep unwanted elements hidden on template page
      if (!SQUARESPACE_IS_AWESOME.getURLQueryValue('q')) {
        this.message.removeClass('is--hidden');
        this.intro.removeClass('is--hidden');
      };

      (function(self) {
        SQUARESPACE_IS_AWESOME.siteFilter.load(function() {
          SQUARESPACE_IS_AWESOME.renderSiteFilter();

          self._prepareLayout();
        }, false);
      })(this);

      if (this.viewWedding) {
        Y.Squarespace.FrontSite.SiteFilter.viewWedding = true;
      }

      //this._livepersonChat();
    },


    /*
     * Destroy
     */
    destructor: function() {
      for (var e = 0; e < this.events.length; e++) {
        this.events[e].detach();
      }

      if (this.shotGallery) {
        this.shotGallery.detach('currentIndexChange', this._syncScreenshots);
      }

      this.stepsSlider && this.stepsSlider.destroy();

      if (this.googleDomain) {
        Y.one('body').removeClass('google-domain');
        Y.one('.logo-Google') && Y.one('.logo-Google').remove();
      }
    },

    /*
     * Testing LivePerson chat for template recommendation
     */
    _livepersonChat: function () {
      var LivePersonChatId = 'lpButDivID-1394123303';
      var chatTarget = Y.one('#LivePersonChat');
      chatTarget && chatTarget.setAttribute('id', LivePersonChatId);
      var chatEvent = 'frontsite_template_overview_livechat';

      Y.Get.js('https://server.iad.liveperson.net/hc/90256331/?' + 'cmd=mTagRepstate&site=90256331&buttonID=13&' + 'divID=' + LivePersonChatId + '&bt=1&c=1',
        function(err) {
          if (err) {
            chatTarget.setStyle('display', 'none');
            Y.Squarespace.FrontSite.Core.trackEvent(chatEvent, { state: 'scripterror'});
          }
          else {
            if (chatTarget) {
              if (chatTarget.one('a img[src*=reponline]')) {
                Y.one('.designs-intro') && Y.one('.designs-intro').addClass('chat');
                chatTarget.removeClass('is--transparent');
                Y.Squarespace.FrontSite.Core.trackEvent(chatEvent, { state: 'available'});
              }
              else {
                chatTarget.setStyle('display', 'none');
                if (chatTarget.one('a img[src*=repoffline]')) {
                  Y.Squarespace.FrontSite.Core.trackEvent(chatEvent, { state: 'offline'});
                }
                else if (chatTarget.one('a img[src*=repoccupied]')) {
                  Y.Squarespace.FrontSite.Core.trackEvent(chatEvent, { state: 'busy'});
                }

              }
              Y.Squarespace.FrontSite.Core.currentPage.events.push(chatTarget.on('click', function(e) {
                SQUARESPACE_IS_AWESOME.trackEvent(chatEvent, { state: 'clicked'});
              }, this));
            }
          }
        }
      );
    },


    /*
     * Prepare required thumbnail
     */
    _switchThumbnail: function(els, suffix) {
      els.each(function(img) {
        SQUARESPACE_IS_AWESOME.lazyLoader.push(img);
      });
    },


    /*
     * Load browser screenshots
     */
    _loadScreenshots: function() {
      //this._switchThumbnail(Y.all('.designs-template-image'), 'main');
      Y.all('.designs-template-image, .designs-details-screenshot').each(function(img) {
        SQUARESPACE_IS_AWESOME.lazyLoader.push(img);
        //ImageLoader.load(img, { load: true });
        //img.removeAttribute('data-load');
      });
    },


    /*
     * Sync browser/iphone screenshots
     */
    _syncScreenshots: function() {
      var index = this.shotGallery.get('currentIndex'),
        image = Y.all('.designs-details .iphone .designs-details-screenshot');

      switch (index) {
      case 0:
        this._switchThumbnail(image, 'main');
        break;
      case 1:
        this._switchThumbnail(image, 'blogs');
        break;
      case 2:
        this._switchThumbnail(image, 'galleries');
        break;
      case 3:
        this._switchThumbnail(image, 'pages');
        break;
      case 4:
        this._switchThumbnail(image, 'stores');
        break;
      }
    },


    /*
     * Checks if current page is a template item page
     */
    _isTemplatePage: function() {
      if (Modernizr.history) {
        return SQUARESPACE_IS_AWESOME.getURLQueryValue('q');
      } else {
        return (window.location.hash && window.location.hash.startsWith('#search=') && window.location.hash.length >= 9);
      }
    },


    /*
     * Render page
     */
    _prepareLayout: function() {
      SQUARESPACE_IS_AWESOME.lazyLoader.purge();

      this.details = Y.one('.designs-details');
      this.designsBody = Y.one('.designs-body');
      this.templates = Y.one('.designs-templates');

      var info = this.details && this.details.one('.designs-details-info');
      //filteredResults = SQUARESPACE_IS_AWESOME.siteFilter.isActiveFilter();
      Y.one('.designs-body').setStyle('minHeight', null);
      SQUARESPACE_IS_AWESOME.designsBackLink(false);

      this.templates.removeClass('designs-templates--customer');

      /*if (filteredResults) {
        if (SQUARESPACE_IS_AWESOME.designsPageViews > 1) {
          SQUARESPACE_IS_AWESOME.marketingEvents('hits');
        }

        this.steps.removeClass('is--hidden');
        this.intro.removeClass('is--hidden');

        this.templates.empty();
        for (var i = 0; i < filteredResults.length; i++) {
          this.templates.append(SQUARESPACE_IS_AWESOME.siteFilter.renderResult(filteredResults[i]));
        }

        if (!Y.one('.designs-templates .browser-bar')) {
          SQUARESPACE_IS_AWESOME.renderChromes(Y.one('.designs-templates'));
        }

        if (this.details) {
          this.details.remove();
        }

        SQUARESPACE_IS_AWESOME.switchHeader('dark');

        //var activeFilter = Y.one('[data-filter="' + SQUARESPACE_IS_AWESOME.getURLQueryValue('q') + '"]');
        //activeFilter && this._recommendTemplates(activeFilter, true);
      }
      else*/
      if (this._isTemplatePage()) {
        // Template
        SQUARESPACE_IS_AWESOME.designsBackLink(true);
        SQUARESPACE_IS_AWESOME.marketingEvents('hits');
        SQUARESPACE_IS_AWESOME.supressAnimations();

        this.steps && this.steps.addClass('is--hidden');
        this.message.addClass('is--hidden');
        this.intro.addClass('is--hidden');
        this.templates.addClass('designs-templates--customer');

        SQUARESPACE_IS_AWESOME.switchHeader('dark');

        if (this.details && !this.details.one('.browser-bar')) {
          SQUARESPACE_IS_AWESOME.renderChromes(this.details);
        }

        if (!Y.one('.designs-templates .browser-bar')) {
          SQUARESPACE_IS_AWESOME.renderChromes(Y.one('.designs-templates'));
        }

        if (info && !info.hasClass('designs-details-info--no-refresh')) {
          info.removeClass('designs-details-info--show');
          setTimeout(function() {
            if (info) {
              info.addClass('designs-details-info--show');
            }
          }, 100);
        }

        this.details.all('.iphone, .browser, a').each(function (t) {
          t.on('click', function (e) {
            SQUARESPACE_IS_AWESOME.animateMenu(false);
          }, this);
        }, this);

      } else {
        // Overview page
        SQUARESPACE_IS_AWESOME.trackEvent('frontsite_template_overview_view', {
          fromURL: oldReferrer
        });

        if (SQUARESPACE_IS_AWESOME.designsPageViews > 1) {
          SQUARESPACE_IS_AWESOME.marketingEvents('hits');
        }

        this.message.removeClass('is--hidden');
        this.intro.removeClass('is--hidden');

        SQUARESPACE_IS_AWESOME.resetSiteFilter();

        if (!Y.one('.designs-templates .browser-bar')) {
          SQUARESPACE_IS_AWESOME.renderChromes(Y.one('.designs-templates'));
        }

        if (this.details) {
          this.details.remove();
        }

        SQUARESPACE_IS_AWESOME.switchHeader('dark');
        this._switchFilter(this.filterLinks.item(0));

        if (this.templates.brickr) {
          this.templates.brickr.initializer();
        } else {
          this.templates.plug(Y.Squarespace.FrontSite.Brickr);
        }

        this._prepareTemplates();
        if (Y.Squarespace.FrontSite.ActiveTemplateFilters === '' || Y.Squarespace.FrontSite.ActiveTemplateFilters === this.defaultActive) {
          if (this.filtersLabel) {
            this._recommendTemplates(this.filtersLabel, true);
          }
          else {
            this._recommendTemplates(this.filters.one('a[data-filter]'), true);
          }
        }
        else {
          this._recommendTemplates(this.filters.one('a[data-filter='+Y.Squarespace.FrontSite.ActiveTemplateFilters+']'));
        }
      }


      this._stretchDetails(true);
      //Y.later(this._isTemplatePage() && info && !info.hasClass('designs-details-info--no-refresh') ? 1000 : 0, this, this._loadScreenshots);
      this._loadScreenshots();

      this.templates.delegate('click', function () {
        SQUARESPACE_IS_AWESOME.animateMenu(false);
        return false;
      }, '.browser', this);
    },


    /*
     * Tag Templates and prepare for rendering
     */
    _prepareTemplates: function() {
      var filters = Y.Squarespace.FrontSite.TemplateFilters,
        filter, template;

      for (var type in filters) {
        filter = filters[type];

        for (var t = 0; t < filter.length; t++) {
          template = this.templates.one('[data-name="' + filter[t] + '"]');
          template && template.addClass('filter--' + type);
        }
      }
    },


    /*
     * Expand the top details wrapper
     */
    _stretchDetails: function(createGallery) {
      this.details = Y.one('.designs-details');

      if (createGallery) {
        this.els.iphone = this.details && this.details.one('.iphone');
        this.els.signup = this.details && this.details.one('.designs-details-signup');
        this.els.container = this.details && this.details.one('.container');
        this.els.browser = this.details && this.details.one('.browser');
        this.els.liveOverlay = this.details && this.details.one('.designs-details-live');
        this.els.shots = this.details && this.details.one('.designs-details-shots');
        this.els.link = this.details && Y.one('.designs-details-overlay-link');
        this.els.overlaySignup = this.details && Y.one('.designs-details-overlay-signup');
      }

      // Common
      if (this.details) {
        SQUARESPACE_IS_AWESOME.disableTransitions(this.els.browser);
        SQUARESPACE_IS_AWESOME.disableTransitions(this.details);
        SQUARESPACE_IS_AWESOME.disableTransitions(this.els.iphone, 600);

        if (document.body.clientWidth <= 2000) {
          this.els.iphone.addClass('iphone--small');
          this.details.addClass('designs-details--short');
        } else {
          this.els.iphone.removeClass('iphone--small');
          this.details.removeClass('designs-details--short');
        }

        if (this.details.get('clientHeight') <= 720) {
          this.els.iphone.addClass('iphone--small');
        }
      }


      // Live demo not in progress
      if (this.details && !this.details.hasClass('designs-details--mobiledemo') && !this.details.hasClass('designs-details--browserdemo')) {
        var text = this.details.one('.designs-details-info'),
          shots = this.details.one('.designs-details-shots');

        if (document.body.clientWidth <= 1440) {
          this.els.signup.addClass('button--small');
        } else {
          this.els.signup.removeClass('button--small');
        }

        if (this.els.browser) {
          this.els.browser.setStyle('width', null) // Clear PX value -- thanks, safari
          if (document.body.clientWidth <= 600) {
            this.els.browser.addClass('browser--small');
          } else {
            this.els.browser.removeClass('browser--small');
          }

          if (createGallery) {
            if (this.shotGallery) {
              this.shotGallery.destroy();
            }

            this.shotGallery = new Y.Squarespace.Gallery2({
              container: this.els.browser,
              slides: '.browser-slide:first-of-type',
              design: 'stacked',
              elements: {
                controls: '.designs-details-shots-collections'
              },
              autoplay: false,
              loop: false,
              autoplayOptions: {
                timeout: 7000,
                pauseOnMouseover: ['.designs-details-shots-collections', '.designs-details-shots-collection']
              },
              designOptions: {
                autoHeight: false,
                speed: 0.3,
                transition: 'fade'
              }
            });

            this.shotGallery.after('currentIndexChange', this._syncScreenshots, this);
            this._syncScreenshots();
          }
        }

        // this.details.setStyle('height', this.els.container.get('clientHeight'));

        // if (this.els.iphone) {
        //   if (document.body.clientWidth > 1020) {
        //     this.els.iphone.setStyles({
        //       'left': this.els.browser.get('clientWidth') - (this.els.iphone.get('clientWidth') * 0.2),
        //       'top': this.els.browser.get('clientHeight') - (this.els.iphone.get('clientHeight') * 0.68)
        //     });
        //   } else {
        //     this.els.iphone.setStyles({
        //       'left': this.els.browser.get('clientWidth') - this.els.iphone.get('clientWidth'),
        //       'top': this.els.browser.get('clientHeight')
        //     });
        //   }
        // }


        // Browser demo in progress
      } else if (this.details && this.details.hasClass('designs-details--browserdemo')) {
        if (document.body.clientWidth > 1020) {
          this.els.browser.setStyles({
            'width': this.els.container.getComputedStyle('width'),
            'height': window.innerHeight - this.els.browser.getY()
          });

          this.els.browser.one('.browser-content').setStyle('height', window.innerHeight - this.els.browser.getY());
        } else {
          SQUARESPACE_IS_AWESOME.siteFilter.chromeDemo('reset');
        }


        // Mobile demo in progress
      } else if (this.details && this.details.hasClass('designs-details--mobiledemo')) {
        if (document.body.clientWidth > 1020) {
          this.els.iphone.setStyles({
            'left': document.body.clientWidth / 2,
            'marginLeft': -360 / 2,
            'top': (window.innerHeight / 2) - (750 / 2) - this.els.container.getY()
          })

          liveOverlay.setStyles({
            'left': (document.body.clientWidth / 2) + 250,
            'top': (window.innerHeight / 2) - (640 / 2) - this.els.container.getY() + 334
          });

          overlaySignup.setStyles({
            'left': (document.body.clientWidth / 2) - overlaySignup.get('clientWidth') - 230,
            'top': (window.innerHeight / 2) - (640 / 2) - this.els.container.getY() + 330
          });

          link.setStyles({
            'left': parseInt(overlaySignup.getComputedStyle('left')) + overlaySignup.get('clientWidth') - link.get('clientWidth'),
            'top': (window.innerHeight / 2) - (640 / 2) - this.els.container.getY() + 385,
            'marginLeft': -29
          });
        } else {
          SQUARESPACE_IS_AWESOME.siteFilter.chromeDemo('reset');
        }
      }

      // Reset
      if (this.details) {
        SQUARESPACE_IS_AWESOME.enableTransitions(this.els.browser);
        SQUARESPACE_IS_AWESOME.enableTransitions(this.details);
      }
    },


    /*
     * Show recommended templates
     */
    _recommendTemplates: function(filter, noFiltering) {
      var type = filter.getAttribute('data-filter');

      if (Y.Squarespace.FrontSite.ActiveTemplateFilters && noFiltering) {
        type = Y.Squarespace.FrontSite.ActiveTemplateFilters;
        noFiltering = false;
        filter = Y.one('[data-filter="' + type + '"]');
        filter.removeClass('designs-filter--active');
      }

      if (!filter.hasClass('designs-filter--active')) {
        this.recommendedLinks.removeClass('designs-filter--active');
        filter.addClass('designs-filter--active');

        this.designsBody.setStyle('minHeight', window.innerHeight);

        if (filter.hasClass('designs-filter--label')) {
          // Reset
          this.filtersLabel && this.filtersLabel.set('innerHTML', 'recommended for');

          if (!noFiltering) {
            SQUARESPACE_IS_AWESOME.trackEvent('frontsite_template_sort', {
              page: 'overview',
              filter: 'all'
            });

            this.templates.brickr.filter('');
            Y.Squarespace.FrontSite.ActiveTemplateFilters = '';
          }

        } else {
          // Use a filter
          this.filtersLabel && this.filtersLabel.set('innerHTML', 'all');

          if (!noFiltering) {
            SQUARESPACE_IS_AWESOME.trackEvent('frontsite_template_sort', {
              page: 'overview',
              filter: type
            });

            this.templates.brickr.filter('.filter--' + type);
            Y.Squarespace.FrontSite.ActiveTemplateFilters = type;
          }
        }

        if (!noFiltering) {
          setTimeout(function() {
            this, SQUARESPACE_IS_AWESOME.lazyLoader._checkImages();
          }, 1000);
        }
      }
    },


    /*
     * Switch filter
     */
    _switchFilter: function(filter) {
      var text = filter.get('text').toLowerCase();

      if (!filter.hasClass('designs-filter--active')) {
        this.filterLinks.removeClass('designs-filter--active');
        filter.addClass('designs-filter--active');

        // Clear previous stops
        //this.typesList.set('className', 'designs-type-list');

        //this.typesList.addClass('designs-type-list--' + text);
        this._switchThumbnail(Y.all('.designs-template-image'), text);
      }
    },


    /*
     * Events
     */
    _bindEvents: function() {
      this.events.push(Y.on('history:change', function(e) {
        if (((SQUARESPACE_IS_AWESOME.router.getPath() === 'templates/index.html') || (SQUARESPACE_IS_AWESOME.router.getPath() === '/templates')) && (e.newVal.search !== undefined || e.prevVal.search !== undefined)) {
          if (e.src === 'popstate' || e.src === 'hash') {
            SQUARESPACE_IS_AWESOME.siteFilter.close();

            if (e.newVal.search) {
              SQUARESPACE_IS_AWESOME.siteFilter.setValue(e.newVal.search);
            }
          }

          oldReferrer = 'templates/index.html';
          this._prepareLayout();
        }
      }, this));

      this.events.push(Y.one(window).on(window.orientation !== undefined ? 'orientationchange' : 'resize', function(e) {
        var trigger = Y.one('.designs-customers-trigger');
        if (!trigger || trigger && trigger.hasClass('is--hidden')) {
          this.designsBody.setStyle('minHeight', window.innerHeight);
        }

        this._stretchDetails(false);
      }, this));

      this.filters.delegate('click', function (e) {
        this._switchFilter(e.target);
      }, '.designs-filter', this);

      this.recommendedLinks.each(function (link) {
        link.on('click', function (e) {
          this._recommendTemplates(e.target);
        }, this);
      }, this);
    },


    /*
     * Convert comma delimeted types into an animation
     */
    _processTypes: function() {
      var items = ['It All'].concat(this.types.get('innerHTML').replace(/ /g, '').split(',')),
        list = Y.Node.create('<div class="designs-type-list"></div>'),
        height = 0;

      items.push('It All');

      for (var i = 0; i < items.length; i++) {
        var item = Y.Node.create('<div class="designs-type-item">' + items[i] + '</div>');
        item.appendTo(list);
      }

      // Keep track of views
      SQUARESPACE_IS_AWESOME.designsPageViews++;
      if (SQUARESPACE_IS_AWESOME.designsPageViews > 1) {
        SQUARESPACE_IS_AWESOME.supressAnimations();
      }

      // Clear, append and get ready
      this.types.set('innerHTML', '');
      list.appendTo(this.types);
      //Y.Node.create('<div class="designs-type-mask"></div>').appendTo(this.types);
      this.types.removeClass('is--hidden');

      this.typesList = list;
    }

  });

}, '1.0', {
  requires: [
    'base-build',
    'history',
    'squarespace-brickr'
  ]
});


/*
 * Pricing
 */
Y.add('squarespace-pricing', function(Y) {

  Y.namespace('Squarespace.FrontSite').Pricing = Y.Base.create('Pricing', Y.Base, [], {

    /*
     * Init
     */
    initializer: function() {
      this.currencySwitcher = new Y.Squarespace.FrontSite.CurrencySwitcher();
      this.currencySwitcher.setDefault();
      // this._getDynPricing('/api/global-products');
      Y.one('#pricing').removeClass('is--transparent');
      // Y.Squarespace.Lang.bindPricingPlanTooltips();
      this._animatePricing();
      this.windowEvents = new Array();
      var resizePricing = Y.one(window).on('resize', function() {
        this._switchPricing(Y.all('.price-plan-link'))
      }, this);
      this._additionalToolTips();
      this.windowEvents.push(resizePricing);
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
    },


    /*
     * Handle pricing info display
     */
    _switchPricing: function(trigger, mode) {
      if (trigger._nodes instanceof Array && Y.all('.info').size() > 0) {
        Y.all('.open').each(function(i) {
          i.one('.info').setStyle('height', i.one('.info-features-wrapper').get('clientHeight'));
        });
        return;
      }
      var pricePlan = trigger && Y.one(trigger).ancestor('.price-plan'),
        info = pricePlan && pricePlan.one('.info'),
        delta = info && (info.one('.info-features-wrapper').get('clientHeight') || info.one('ul').get('clientHeight'));

      if (mode && mode === 'close' && Y.one('.open') === null) {
        return;
      } else if (mode && mode === 'close' && Y.one('.open') != null) {
        Y.all('.info').each(function(i) {
          i.ancestor('.price-plan').removeClass('open');
          i.setStyle('height', null);
        });
      } else if (pricePlan.hasClass('open')) {
        pricePlan.removeClass('open');
        info.setStyle('height', null);
      } else {
        pricePlan.addClass('open');
        info.setStyle('height', delta);
      }
    },


    /*
     * Pricing info trigger
     */
    _animatePricing: function() {
      var pricePlanLink = Y.all('.price-plan-link');

      if (pricePlanLink) {
        pricePlanLink.each(function(a) {
          a.on('click', function(evt) {
            if (Y.one(window).get('winWidth') <= 600) {
              evt.preventDefault();
              this._switchPricing(evt._currentTarget, null);
            } else {
              SQUARESPACE_IS_AWESOME.changeUrl('templates/index.html');
            }
          }, this);

        }, this);
      }
    },

    _additionalToolTips: function() {

      var TIPS = [
        {
          target: ".feature-free-domain",
          title: "Custom Domain",
          body: "A custom domain gives your website a professional look. All Squarespace plans registered with an annual term include a one year of free domain registration on a new domain. This offer applies to .com, .org, .net, .biz, and .info domains. The domain will renew at $20/year (our standard rate) after the first year. Outside of this offer, you can attach any number of domains to any Squarespace plan, monthly or yearly."
        },
        {
          target: '.feature-one-product',
          title: '1 Product',
          body: 'Our entry level plan allows you to sell a single product.'
        },
        {
          target: '.feature-limited-products',
          title: '20 Products',
          body: 'Our business plan allows you to sell up to 20 products.'
        },
        {
          target: '.feature-unlimited-products',
          title: 'Unlimited Products',
          body: 'Squarespace\'s Commerce package does not place limits on the number of products on your site.'
        },
        {
          target: '.feature-carrier-shipping',
          title: 'Real-Time Carrier Shipping',
          body: 'Squarespace automatically calculates real-time carrier shipping rates for USPS. Additional features ' +
                'assist with accurate package size calculations.'
        },
        {
          target: '.feature-label-printing',
          title: 'Label Printing via ShipStation',
          body: 'Squarespace orders seamlessly sync with ShipStation, allowing labels to be printed in batch for all ' +
                'major carriers. Shipping status is synced between ShipStation and your Squarespace shop.'
        },
        {
          target: '.feature-xero',
          title: 'Integrated Accounting',
          body: 'Squarespace Commerce automatically syncs with Xero\'s cloud based accounting platform, allowing ' +
                'merchants to easily keep track of their revenue, expenses and tax liabilities'
        },
        {
          target: '.feature-ecommerce',
          title: 'Fully Integrated E-Commerce',
          body: 'Squarespace lets you sell digital and physical goods online. We provide inventory tracking, tax, ' +
                'shipping, coupon controls, and more. Squarespace never charges a transaction fee.'
        },
        {
          target: '.feature-adwords',
          title: '$100 Google AdWords Credit',
          body: 'Be seen by customers at the very moment that they\'re searching on Google for the things you offer. ' +
            'All Squarespace Business and Commerce accounts come with $100 in Google AdWords credits. Offer valid in US and Canada ' +
            'only.'
        },
        {
          target: '.feature-googleapps',
          title: 'Professional Email From Google',
          body: 'Sign up and get <strong>one (1)</strong> professional Gmail and Google Apps for Work account for your domain ' +
            'free for the first year when you purchase the Business or Commerce plan. This includes Google ' +
            'Calendar, Docs, Drive and more. The account will renew at $50 per year if you choose annual billing ' +
            'or $5 per month if you choose monthly.'
        },
        {
          target: ".feature-page-limit",
          title: "Page Limit",
          body: "Squarespace's personal package has a limit of 20 pages.  Note that adding entries to your blog does not count against your page limit, even though each entry will have its own page."
        },
        {
          target: ".feature-pages",
          title: "Unlimited Pages",
          body: "Squarespace's Business and Commerce packages do not place a limit on the number of pages on your site."
        },
        {
          target: ".feature-contributors",
          title: "Unlimited Contributors",
          body: "Squarespace's Business and Commerce plans allow you to invite multiple contributors to your site.  Contributors can be given individual permission levels, allowing them to optionally edit content, configure your website, manage billing, manage comments, or view your site's statistics."
        },
        {
          target: ".feature-contributors-limit",
          title: "Contributor Limit",
          body: "Squarespace's Personal plan allows you to invite one contributor to your site.  Contributors can be given individual permission levels, allowing them to optionally edit content, configure your website, manage billing, manage comments, or view your site's statistics."
        },
        {
          target: ".feature-support",
          title: "24/7 Premium Support",
          body: "All Squarespace packages include premium customer support from our award-winning customer care team."
        },
        {
          target: ".feature-physicalproducts",
          title: "Unlimited Physical Products",
          body: "Squarespace places no limits on the number of physical products you list for sale in your store."
        },
        {
          target: ".feature-digitalproducts",
          title: "Unlimited Digital Products",
          body: "Squarespace places no limits on the number of digital products you list for sale in your store."
        },
        {
          target: ".feature-mobilestore",
          title: "Mobile Store",
          body: "All Squarespace templates are mobile-ready with responsive designs, ensuring your customers can shop and checkout from your store on any device."
        },
        {
          target: ".feature-inventory",
          title: "Inventory Tracking",
          body: "View your shop inventory levels in real time. You can quickly sort items across your entire store by stock level, price, or title."
        },
        {
          target: ".feature-coupon",
          title: "Tax, Shipping, and Coupon Controls",
          body: "Squarespace allows you to create multiple types of coupons for your store. Full tax and shipping rules by region also help you run your store effectively."
        },
        {
          target: ".feature-mobilewebsite",
          title: "Mobile-Ready Website",
          body: "All Squarespace templates are mobile-ready with responsive designs, ensuring your visitors can see your website on any device."
        },
        {
          target: ".feature-limits",
          title: "Resource Limits",
          body: "Our entry level plan has generous limits on pages, bandwidth, and storage. It's a great fit for small sites."
        },
        {
          target: ".feature-nolimits",
          title: "Unlimited Pages, Bandwidth, Storage, and Contributors",
          body: "Scale with confidence. Squarespace's professional packages do not place any caps on your bandwidth and storage usage."
        },
        {
          target: ".feature-allproducts",
          title: "Unlimited Phsyical, Digital and Service Products",
          body: "Squarespace commerce allows you to sell physical products, digital goods, and services from a single platform. Squarespace does not impose any limits on SKUs &mdash; create as many products as you like."
        },
        {
          target: ".feature-developers",
          title: "Developer Platform",
          body: "The Squarespace Developer Platform includes full HTML and CSS code control over Git and SFTP. To take advantage of these features, sign up for a developer-enabled account via http://developers.squarespace.com/."
        }
      ];

      TIPS.map(function(tip){
        new Y.Squarespace.ToolTip({
          target: tip.target,
          title: tip.title,
          body: tip.body,
          dialogTooltip: true,
          width: 350,
          showTimeout: 200,
          clickToShow: true
        });
      });
    },

    /*
     * Get dynamic pricing
     */
    _getDynPricing: function(path) {
      Y.Data.get({
        url: path,
        responseFormat: 'raw',
        failure: Y.bind(function (data) {
          Y.one('#pricing').removeClass('is--transparent');
        }, this),
        success: Y.bind(function (data) {
        var pricingData = Y.JSON.parse(data);
        var priceInfo = Y.all('.price-plan');
        for (var ii = 0; ii < pricingData.results.length; ii++) {
          var result = pricingData.results[ii];
          var plan = result.plan.displayName.toLowerCase();
          var displayName = result.plan.displayName;
          var elem = Y.one('.price-plan-' + plan);
          var period = result.period.intervalDays;
          var periodName = period === 365 ? '.annual' : '.monthly';

          if (!elem) {
            continue;
          }

          if (period === 30) {
            var annualProduct = Y.Array.find(pricingData.results, function(prod) {
              return prod.period.intervalDays === 365 &&
                    prod.plan.plan === result.plan.plan;
            });

            if (annualProduct.price === result.price * 12) {
              elem.one('.price-breakdown').addClass('is--hidden');
              elem.one('.info-price-billing').addClass('is--hidden');
            }
          }

          elem.all(periodName).each(function(p) {
            if (period === 30) {
              p.setHTML(result.price)
            }
            else {
              p.setHTML(parseFloat(result.price) / 12);
            }
          }, this);

          elem.one('h2').setHTML(displayName);
        }

       Y.one('#pricing').removeClass('is--transparent');
      }, this)
    });
  }

  });

}, '1.0', {
  requires: [
    'base-build',
    'json-parse'
  ]
});


/*
 * About
 */
Y.add('squarespace-about-team', function(Y) {

  Y.namespace('Squarespace.FrontSite').AboutTeam = Y.Base.create('AboutTeam', Y.Base, [], {

    /*
     * Init
     */
    initializer: function() {
      this._triggerAnimatePeople();
      this._displayBio();
      this._fetchEmployeeData();
      this.windowEvents = new Array();
      this.galleries = new Array();

      var resizeAbout = Y.one(window).on('resize', function(evt) {
        this._animatePeople(Y.all('.content-people h2'), evt)
      }, this);
      this.windowEvents.push(resizeAbout);
      var scrollAbout = Y.one(window).on('scroll', function(evt) {
        this._animatePeople(Y.all('.content-people h2'), evt);
      }, this);
      this.windowEvents.push(scrollAbout);
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

      for (var g = 0; g < this.galleries.length; g++) {
        if (this.galleries[g]) {
          this.galleries[g].destroy();
        }
      }
    },

    /*
     * Fetch current employee data
     */
     _fetchEmployeeData: function(){
       Y.Data.get({
         url: 'https://sqs-hub.s3.amazonaws.com/employee_photos/index.json',
         responseFormat: 'json',
         failure: Y.bind(function (data) {
           console.error('Error fetching employee data');
         }, this),
         success: this._onEmployeeDataLoaded.bind(this)
       });
     },

     /*
      * Handle rendering employees
      */
      _onEmployeeDataLoaded: function(employees){

        if (employees.shuffle) employees.shuffle();

        // // create the DOM elements for the person
        employees.map(this._renderPerson)

        // attach each rendered person to the dom
        .reduce(function(containerElement, renderedPerson){
          containerElement.appendChild(renderedPerson);
          return containerElement;

        // send the container element to the reduce function
        }, document.getElementById('people-container'));

        if (document.readyState === 'complete'){
          this._updateImageLoad();
        }
        else {
          var self;
          document.addEventListener('onreadystatechange', function(e){
            console.log('state change', e)
            self._updateImageLoad.bind(self)
          });
        }


        if (Y.UA.touchEnabled) {
          this.windowEvents.push(
            Y.all('.people').on('touchstart', function(e) {
              var person = (e.target.hasClass('person'))? e.target : e.target.ancestor('.person');
              person.addClass('show-text');
            }, this),

            Y.all('.people').on('touchend', function(e) {
              Y.all('.person.show-text').removeClass('show-text');
            }, this)
          )
        }
      },

    /*
     * Render DOM Node for one employee
     */
     _renderPerson: function(person){
       var innerHTML,
           photoUrl,
           img,
           personText,
           el;

       // the element we'll return
       el = document.createElement('div');
       el.classList.add('person');


       // grab the right url...will need to be updated when we can support retina
       // this may seem like overkill, but it will allow the people team to start generating the
       // retina assets and putting them in this folder without breaking this page
       photoUrl = person.photos.filter(

         // only grab the appropriately sized photo
         function(photo){ return photo.width === 174 || photo.width === 300; }

       // and get its photo
       )[0].url;

       img = document.createElement('img');
       img.setAttribute('data-load', 'false');
       // removing the alt cancels out ImageLoader _resetAlt logic
       // which causes a repaint, but ImageLoader does it because the alt
       // tag sometimes interferes with the dimensional analysis
       // ImageLoader does.

       // img.setAttribute('alt', person.displayName);
       img.setAttribute('data-image-dimensions', '174x237');
       img.setAttribute('skip-placeholder', true);
       img.setAttribute('data-src', photoUrl);
       img.setAttribute('data-preserve-dimensions', 'true');

       el.appendChild(img);

       personText = document.createElement('div');
       personText.classList.add('person-text');
       personText.innerHTML = '<span class="first-name">' + person.displayName + '</span></div>';
       el.appendChild(personText);

      //  SQUARESPACE_IS_AWESOME.lazyLoader.push(img);
      //  ImageLoader.load(img);

       return el;
     },

    /*
     * Handle headshot display
     */
    _animatePeople: function(trigger, mode) {
      if (mode && mode.type === 'resize') {
        this._updateImageLoad();
        Y.all('.open').each(function(i) {
          i.one('.people-wrapper').setStyle('height', i.one('.people').get('clientHeight'));
        });
      } else if (mode && mode.type === 'scroll') {
        Y.all('.open').each(function(i) {
          i.one('.people-wrapper').setStyle('height', i.one('.people').get('clientHeight'));
        });
      } else if (mode && mode.type === 'click') {
        var peopleContent = trigger && Y.one(trigger).ancestor('.content-people'),
          wrapper = peopleContent && peopleContent.one('.people-wrapper'),
          delta = wrapper && wrapper.one('.people').get('clientHeight');

        if (peopleContent.hasClass('open')) {
          peopleContent.removeClass('open');
          wrapper.setStyle('height', null);
        } else {
          peopleContent.all('img[data-load="false"]').each(function(img) {
            img.setAttribute('data-load', 'true');
            ImageLoader.load(img);
          });
          peopleContent.addClass('open');
          wrapper.setStyle('height', delta);
          window.scrollBy(0, 1);
        }
      }
    },


    _updateImageLoad: function() {
      if (Y.one(window).get('winWidth') > 600) {
        var elem = Y.one('.page-content.about').all('img[data-load="false"]');
        elem.each(function(img) {
          img.setAttribute('data-load', 'viewport');
          SQUARESPACE_IS_AWESOME.lazyLoader.push(img);
          // ImageLoader.load(img);
        });

        // ImageLoader causes reflows with the alt attribute, and calling it on
        // 500+ images immediately blocks too hard.

        elem.each(function(img, idx) {
          setTimeout(function() {
            ImageLoader.load(img);
          }, 10 * idx)
        });
      }
    },


    /*
     * headshot trigger
     */
    _triggerAnimatePeople: function() {
      var peopleLink = Y.all('.content-people h2');

      if (peopleLink.size() > 0) {
        this._updateImageLoad();
        peopleLink.each(function(a) {
          a.on('click', function(evt) {
            if (Y.one(window).get('winWidth') <= 600) {
              this._animatePeople(evt._currentTarget, evt);
            }
          }, this);

        }, this);
      }
    },


    /*
     * bio trigger
     */
    _displayBio: function() {
      var bioLink = Y.all('.info-panel');

      if (bioLink.size() > 0) {
        bioLink.each(function(a) {
          a.on('click', function(evt) {
            if (Y.one(window).get('winWidth') <= 767) {
              Y.one(evt._currentTarget).toggleClass('open');
            }
          }, this);
        }, this);
      }
    }
  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


/*
 * About - Legacy
 */
Y.add('squarespace-about-legacy', function(Y) {

  Y.namespace('Squarespace.FrontSite').About = Y.Base.create('About', Y.Base, [], {

    /*
     * Init
     */
    initializer: function() {
      this._triggerAnimatePeople();
      this._displayBio();
      this.windowEvents = new Array();
      this.galleries = new Array();

      var resizeAbout = Y.one(window).on('resize', function(evt) {
        this._animatePeople(Y.all('.content-people h2'), evt)
      }, this);
      this.windowEvents.push(resizeAbout);
      var scrollAbout = Y.one(window).on('scroll', function(evt) {
        this._animatePeople(Y.all('.content-people h2'), evt)
      }, this);
      this.windowEvents.push(scrollAbout);
      //this._officeGallery();
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

      for (var g = 0; g < this.galleries.length; g++) {
        if (this.galleries[g]) {
          this.galleries[g].destroy();
        }
      }
    },


    /*
     * Handle headshot display
     */
    _animatePeople: function(trigger, mode) {
      if (mode && mode.type === 'resize') {
        this._updateImageLoad();
        Y.all('.open').each(function(i) {
          i.one('.people-wrapper').setStyle('height', i.one('.people').get('clientHeight'));
        });
      } else if (mode && mode.type === 'scroll') {
        Y.all('.open').each(function(i) {
          i.one('.people-wrapper').setStyle('height', i.one('.people').get('clientHeight'));
        });
      } else if (mode && mode.type === 'click') {
        var peopleContent = trigger && Y.one(trigger).ancestor('.content-people'),
          wrapper = peopleContent && peopleContent.one('.people-wrapper'),
          delta = wrapper && wrapper.one('.people').get('clientHeight');

        if (peopleContent.hasClass('open')) {
          peopleContent.removeClass('open');
          wrapper.setStyle('height', null);
        } else {
          peopleContent.all('img[data-load="false"]').each(function(img) {
            img.setAttribute('data-load', 'true');
            ImageLoader.load(img);
          });
          peopleContent.addClass('open');
          wrapper.setStyle('height', delta);
          window.scrollBy(0, 1);
        }
      }
    },


    _updateImageLoad: function() {
      if (Y.one(window).get('winWidth') > 600) {
        Y.one('#about').all('img[data-load="false"]').each(function(img) {
          img.setAttribute('data-load', 'viewport');
          SQUARESPACE_IS_AWESOME.lazyLoader.push(img);
          ImageLoader.load(img);
        });
      }
    },


    /*
     * headshot trigger
     */
    _triggerAnimatePeople: function() {
      var peopleLink = Y.all('.content-people h2');

      if (peopleLink) {
        this._updateImageLoad();
        peopleLink.each(function(a) {
          a.on('click', function(evt) {
            if (Y.one(window).get('winWidth') <= 600) {
              this._animatePeople(evt._currentTarget, evt);
            }
          }, this);

        }, this);
      }
    },


    /*
     * bio trigger
     */
    _displayBio: function() {
      var bioLink = Y.all('.info-panel');

      if (bioLink) {
        bioLink.each(function(a) {
          a.on('click', function(evt) {
            console.log(evt);
            if (Y.one(window).get('winWidth') <= 767) {
              Y.one(evt._currentTarget).toggleClass('open');
            }
          }, this);
        }, this);
      }
    },

    /*
     * Office photo gallery
     */
    _officeGallery: function() {
      var officeGallery = new Y.Squarespace.Gallery2({
        autoplay: true,
        autoplayOptions: {
          timeout: 5000
        },
        container: Y.one('.office-gallery .slides'),
        loop: true,
        design: 'stacked',
        designOptions: {
          speed: 1,
          autoHeight: true
        },
        loaderOptions: {
          mode: 'fit'
        }
      });
      this.galleries.push(officeGallery);
    }

  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


/*
 * Mobile Apps
 */
Y.add('squarespace-mobile-apps', function(Y) {

  Y.namespace('Squarespace.FrontSite').MobileApps = Y.Base.create('MobileApps', Y.Base, [], {

    /*
     * Init
     */
    initializer: function(args) {
      var screenSizeEvent = typeof window.orientation === 'undefined' ? 'resize' : 'orientationchange';

      this.windowEvents = new Array();
      this.galleries = new Array();
      this._scaleDeviceSizes('ipadmini-landscape');

      this.windowEvents.push(Y.one(window).on(screenSizeEvent, function() {
        this._scaleDeviceSizes('ipadmini-landscape');
      }, this));

      this._setUp();
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

      for (var g = 0; g < this.galleries.length; g++) {
        if (this.galleries[g]) {
          this.galleries[g].destroy();
        }
      }
    },


    /*
     * Scale device sizes
     */
    _scaleDeviceSizes: function(deviceName) {
      var device = Y.all('.' + deviceName),
        winWidth = Y.one(window).get('winWidth');

      if (device.size() > 0) {
        for (var ii = 0; ii < device.size(); ii++) {
          var thisDevice = device.item(ii);
          if (!thisDevice.getAttribute('data-device-ratio')) {
            thisDevice.setAttribute('data-device-ratio', thisDevice.get('clientHeight') / thisDevice.get('clientWidth'));
          }
          thisDevice.setStyle('width', '100%');
          thisDevice.setStyle('height', parseInt(thisDevice.getComputedStyle('width')) * thisDevice.getAttribute('data-device-ratio'));
          thisDevice.setStyle('border-radius', (parseInt(thisDevice.getComputedStyle('width')) * 0.045) + 'px');
        }
      }
    },

    _setUp: function() {

      if (Y.one(window).get('winWidth') > 800) {
        var noteappGallery = new Y.Squarespace.Gallery2({
          container: '.note .slides',
          slides: '.slide',
          autoplay: true,
          autoplayOptions: {
            timeout: 5000,
            pauseOnMouseOver: ['.note', '.note .gallery-text']
          },
          elements: {
            next: '.note .slider-arrow--right',
            previous: '.note .slider-arrow--left'
          },
          loaderOptions: {
            mode: 'fill'
          },
          design: 'stacked',
          designOptions: {
            speed: 0.2,
            transition: 'fade',
            autoHeight: false
          },
          loop: true
        });
        Y.one('.note .image-wrapper').removeClass('loading');
        noteappGallery.after('currentIndexChange', function(e) {
          Y.one('.note .active-slide').removeClass('active-slide');
          Y.all('.note .gallery-text').item(this.get('currentIndex')).addClass('active-slide');
        });
        this.galleries.push(noteappGallery);

        var portfolioappGallery = new Y.Squarespace.Gallery2({
          container: '.portfolio .slides',
          slides: '.slide',
          autoplay: true,
          autoplayOptions: {
            timeout: 5000,
            pauseOnMouseOver: ['.portfolio']
          },
          elements: {
            next: '.portfolio .slider-arrow--right',
            previous: '.portfolio .slider-arrow--left'
          },
          loaderOptions: {
            mode: 'fill'
          },
          design: 'stacked',
          designOptions: {
            speed: 0.2,
            transition: 'fade'
          },
          loop: true
        });
        Y.one('.portfolio .image-wrapper').removeClass('loading');
        portfolioappGallery.after('currentIndexChange', function(e) {
          Y.one('.portfolio .active-slide').removeClass('active-slide');
          Y.all('.portfolio .gallery-text').item(this.get('currentIndex')).addClass('active-slide');
        });
        this.galleries.push(portfolioappGallery);

      }
    }
  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


/*
 * Tours
 */
Y.add('squarespace-customers', function(Y) {

  Y.namespace('Squarespace.FrontSite').Customers = Y.Base.create('Customers', Y.Base, [], {

    /*
     * Init
     */
    initializer: function(args) {
      this._bindEvents();
      this.windowEvents = [];
      SQUARESPACE_IS_AWESOME.siteFilter.load();
      this._sqsToolTip();
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
    },


    _sqsToolTip: function() {
      new Y.Squarespace.ToolTip({
        target: '.tooltip-sqsp',
        title: 'Built on the Same Infrastructure',
        body: 'Our front site, www.squarespace.com, is a regular Squarespace site built using our developer platform. We&#39;re hosted on the same servers that your site is hosted on. If your site goes down, so does ours. We think that using the same publishing tools and infrastructure as our users uniquely aligns our interests.',
        dialogTooltip: true,
        width: 350,
        showTimeout: 200,
        clickToShow: true
      });
    },


    _bindEvents: function() {
      Y.all('.customer-example:not(.no-lightbox)').each(function(example) {
        example.one('.designs-template-info') && example.one('.designs-template-info').on('click', function(e) {
          var info = e._currentTarget,
            identifier = info.getAttribute('data-identifier'),
            baseTemplate = info.getAttribute('data-base-template'),
            siteTitle = info.getAttribute('data-site-title'),
            customDomain = info.getAttribute('data-url'),
            deepLink = info.getAttribute('data-deep-link');
          args = {
            'identifier': identifier,
            'baseTemplate': baseTemplate,
            'customDomain': customDomain,
            'siteTitle': siteTitle,
            'deepLink': deepLink
          };

          // TODO: required?
          /*SQUARESPACE_IS_AWESOME.trackEvent('frontsite_tour_customer_example_click', {
                tourSection: this._getActiveMode(),
                exampleIdentifier: identifier
              });*/

          this._showProfile(args);
        }, this);
      }, this);

      Y.all('.customer-logo:not(.no-lightbox)').each(function (logo) {
        logo.on('click', function (e) {
          var info = e._currentTarget,
            identifier = info.getAttribute('data-identifier'),
            baseTemplate = info.getAttribute('data-base-template'),
            siteTitle = info.getAttribute('data-site-title'),
            customDomain = info.getAttribute('data-url'),
            deepLink = info.getAttribute('data-deep-link');
          args = {
            'identifier': identifier,
            'baseTemplate': baseTemplate,
            'customDomain': customDomain,
            'siteTitle': siteTitle,
            'deepLink': deepLink
          };

          /*SQUARESPACE_IS_AWESOME.trackEvent('frontsite_tour_customer_example_click', {
              tourSection: this._getActiveMode(),
              exampleIdentifier: identifier
            });*/

          this._showProfile(args);
        }, this);
      }, this);
    },



    /*
     * Customer example lightbox
     */
    _showProfile: function(args) {
      if (typeof args === 'object' && (typeof args.identifier === 'string' || typeof args.customDomain === 'string') && typeof args.baseTemplate === 'string') {
        args.ctaButton = (args.baseTemplate === "Developer") ? 'hide' : 'view';

        SQUARESPACE_IS_AWESOME.siteFilter.showProfile({
          identifier: args.identifier,
          baseTemplate: args.baseTemplate,
          cta: args.ctaButton,
          customDomain: args.customDomain,
          siteTitle: args.siteTitle,
          deepLink: args.deepLink
        });
      }
    }
  });

}, '1.0', {
  requires: [
    'base-build',
    'squarespace-ui-base'
  ]
});


/*
 * Students Page
 */
Y.add('squarespace-students', function(Y) {

  Y.namespace('Squarespace.FrontSite').Students = Y.Base.create('Students', Y.Base, [], {

    /*
     * Init
     */
    initializer: function(args) {
      this.schoolSearch = Y.one('.school-search');
      this.schoolSearchContainer = this.schoolSearch && this.schoolSearch.one('.container');
      this.schoolForm = this.schoolSearch && this.schoolSearch.one('.school-form');
      this.acSuccess = this.schoolSearch && this.schoolSearch.one('.success');
      this.data = null;
      this.cleanedNameData = [];
      this.cleanedEmailData = [];
      this.windowEvents = [];
      this._scaleDeviceSizes('ipadmini-landscape');
      this._resizeFormRow();
      this._bindEvents();
      this._getData();
      SQUARESPACE_IS_AWESOME.siteFilter.load();
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
    },

    _bindEvents: function() {
      var screenSizeEvent = typeof window.orientation === 'undefined' ? 'resize' : 'orientationchange';
      this.windowEvents.push(Y.one(window).on(screenSizeEvent, function() {
        this._scaleDeviceSizes('ipadmini-landscape');
        this._resizeFormRow();
      }, this));

      Y.one(window).on('superHeroDone', function(e){
        Y.one('.hero .button') && Y.one('.hero .button').set('href', null).on('click', function(e){
          this._tapToScroll('#students', -63);
        }, this)
      }, this);

      Y.all('.customer-example').each(function(example) {
        example.one('.designs-template-info') && example.one('.designs-template-info').on('click', function(e) {
          var info = e._currentTarget,
            identifier = info.getAttribute('data-identifier'),
            baseTemplate = info.getAttribute('data-base-template'),
            siteTitle = info.getAttribute('data-site-title'),
            customDomain = info.getAttribute('data-url'),
            deepLink = info.getAttribute('data-deep-link');
          args = {
            'identifier': identifier,
            'baseTemplate': baseTemplate,
            'customDomain': customDomain,
            'siteTitle': siteTitle,
            'deepLink': deepLink
          };

          this._showProfile(args);
        }, this);
      }, this);

      this.windowEvents.push(this.schoolSearch.one('.not-found .button').on('click', function(){
        this._showEducationForm('show');
      }, this));

      this.windowEvents.push(Y.one(window).on('dataCleaned', function(){
        this._autoComplete();
      }, this));
    },


    /*
     * Scale device sizes
     */
    _scaleDeviceSizes: function (deviceName) {
      var device = Y.all('.' + deviceName),
          winWidth = Y.one(window).get('winWidth');

      if (device.size() > 0) {
        for (var ii = 0; ii < device.size(); ii++) {
          var thisDevice = device.item(ii),
          styleString = '';
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

          styleString += 'border-radius: ' + (parseInt(thisDevice.getComputedStyle('width')) * 0.045) + 'px; ';
          styleString += 'margin-top: ' + (0 - (thisDevice.get('clientHeight') / 2)) + 'px;';
          thisDevice.setAttribute('style', thisDevice.getAttribute('style') + styleString);
        }
      }
    },


    /*
     * make sure the row doesn't collapse when the form is submitted
     */
    _resizeFormRow: function() {
      if (this.schoolSearch.hasClass('show--form')) {
        return;
      }
      var successHeight = parseInt(this.acSuccess.getComputedStyle('height'));
      this.schoolSearchContainer.setStyle('margin-bottom', -parseInt(this.schoolForm.getComputedStyle('height')) + successHeight);
    },


    /*
     * Customer example lightbox
     */
    _showProfile: function(args) {
      if (typeof args === 'object' && (typeof args.identifier === 'string' || typeof args.customDomain === 'string') && typeof args.baseTemplate === 'string') {
        args.ctaButton = (args.baseTemplate === "Developer") ? 'hide' : 'view';

        SQUARESPACE_IS_AWESOME.siteFilter.showProfile({
          identifier: args.identifier,
          baseTemplate: args.baseTemplate,
          cta: args.ctaButton,
          customDomain: args.customDomain,
          siteTitle: args.siteTitle,
          deepLink: args.deepLink
        });
      }
    },


    /*
     * Learn more scroll animation on click
     */
    _tapToScroll : function(selector, offset){
      if (!selector || !Y.one(selector)) {
        return;
      }
      offset = offset ? parseInt(offset) : 0;
      var windowScroll = new Y.Anim({
        node: (Y.UA.gecko || Y.UA.ie >= 10) ? 'html' : 'body',
        to: {
          scroll: [0, Y.one(selector).get('region').top + offset]
        },
        duration: 0.3,
        easing: 'easeBoth'
      });

      windowScroll.run();
    },


    /*
     * Swap image and form
     */
    _showEducationForm: function(force) {
      if (force && force === 'hide') {
        this.schoolSearch.removeClass('show--form');
        this._resizeFormRow();
      }
      else if (force && force === 'show') {
        this.schoolSearch.addClass('show--form');
        this.schoolSearch.one('.container').setStyle('margin-bottom', null);
      }
      else {
        this.schoolSearch.toggleClass('show--form');
      }
    },

    _getData: function() {
      var tdata = Y.JSON.parse(Y.Squarespace.FrontSite.StudentsData);
      if (!tdata.relationships) {
        return;
      }
      this.data = tdata;

      for (var ii = 0; ii < this.data.relationships.length; ii++) {
        this.cleanedNameData.push(this.data.relationships[ii].entity);
        var emails = this.data.relationships[ii].emailDomains;
        for (var ee = 0; ee < emails.length; ee++) {
          emails[ee] = emails[ee].toString().replace(/(^\s+|\s+$)/g,'');
          (emails[ee] != '') && this.cleanedEmailData.push(emails[ee]);
        }
      }
      this.cleanedNameData.sort();
      this.cleanedEmailData.sort();
      Y.one(window).fire('dataCleaned');
    },

    /*
     * Autocomplete
     */
    _autoComplete: function() {
      var schoolList = Y.one('#schools');

      var acInput = Y.one('#school_input'),
          defaultSearchText = acInput.get('value'),
          acSuccessSchool = this.acSuccess.one('.school-name'),
          acSuccessEmail = this.acSuccess.one('.email-domain'),
          acNotFound = this.schoolSearch.one('.not-found'),
          acHelp = this.schoolSearch.one('.students-get-started');

      var ac = new Y.AutoComplete({
        inputNode: acInput,
        resultFilters: ['subWordMatch'],
        source: this.cleanedNameData,
        render: true,
        maxResults: 10,
        activateFirstItem: true
      });

      ac.on('select', function (e) {
        var domains = null;
        for(var ii = 0; ii < this.data['relationships'].length; ii++) {
          if (this.data['relationships'][ii]['entity'] == e.result.text) {
            domains = this.data['relationships'][ii]['emailDomains'].toString();
            break;
          }
        }
        domains = domains.replace(/,\b(?!.*?,\b)/, ' or ');
        domains = domains.replace(/,\b(?!.*?,\b)/, ', ');

        this._showEducationForm('hide');
        acSuccessSchool.setHTML(e.result.text);
        acSuccessEmail.setHTML(domains);
        this.acSuccess.removeClass('is--hidden');
        this._resizeFormRow();
      }, this);

      ac.after('query', function (e) {
        acHelp.addClass('is--hidden');

        if (Y.all('.yui3-aclist-item').size() === 0) {
          acNotFound.removeClass('is--hidden');
          this.acSuccess.addClass('is--hidden');
        }
        else {
          acNotFound.addClass('is--hidden');
          this.acSuccess.addClass('is--hidden');
          this._showEducationForm('hide');
        }
      }, this);

      ac.on('clear', function (e) {
        this.acSuccess.addClass('is--hidden');
        acNotFound.addClass('is--hidden');
        this._showEducationForm('hide');
      }, this);

      acInput.set('value', defaultSearchText);

      acInput.on('focus', function (e) {
        SQUARESPACE_IS_AWESOME.escTarget('add', 'autocomplete');
        if (acInput.get('value') === defaultSearchText) {
          acInput.set('value', '');
        }
      });

      acInput.on('blur', function (e) {
        SQUARESPACE_IS_AWESOME.escTarget('remove', 'autocomplete');

        if (acInput.get('value') === '') {
          acInput.set('value', defaultSearchText);
          acHelp.removeClass('is--hidden');
        }
      }, this);

      acInput.on('keydown', function (e) {
        if (e.keyCode == 27) {
          e.currentTarget.set('value', '');
          ac.fire('clear');
        }
        if (e.keyCode == 13) {
          if (!acNotFound.hasClass('is--hidden')) {
            this._showEducationForm('show');
          }
        }
      }, this);
    }
  });

}, '1.0', {
  requires: [
    'base-build',
    'io-xdr',
    'json-parse',
    'autocomplete',
    'autocomplete-filters'
  ]
});


/*
 * Careers
 */
Y.add('squarespace-careers', function(Y) {

  Y.namespace('Squarespace.FrontSite').Careers = Y.Base.create('Careers', Y.Base, [], {

    /*
     * Init
     */
    initializer: function(args) {
      this.openings = Y.one('#openings');
      this.jobListContainer = this.openings.one('.jobs-list');
      this.jobDescriptionContainer = this.openings.one('.job-description');
      this.currentJob = null;
      this._GrnhseLoaded = false;

      this.ghSource = this._parseSource();

      this.windowEvents = [];
      this.resizeEvent = window.orientation !== undefined ? 'orientationchange' : 'resize';

      this._bindEvents();
      this._loadInclude();
      this._getData('https://api.greenhouse.io/v1/boards/squarespace/embed/offices?callback={callback}', this._buildJobList, this);
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
    },

    _bindEvents: function () {
      this.windowEvents.push(Y.one('.openings-back').on('click', function() {
        if (this.openings.hasClass('show-job')) {
          this._hideJob();
        }
      }, this));

      this.windowEvents.push(Y.one('window').on(this.resizeEvent), function () {
        this._sizeToIframe();
      }, this);

      this.windowEvents.push(Y.one('.jobs-list').on('JobsLoaded', function () {
        if (document.location.search.indexOf('gh_jid=') != -1) {
          this.ghSource = this._parseSource();
          this.currentJob = this._parseCurrentJob();
          Y.one('#JobId' + this.currentJob).simulate('click');
          Y.later(1000, this, function() {
            this.animateScroll(this.openings.get('region').top - 60);
          });
        }
      }, this));

      this.windowEvents.push(Y.one('window').on('popstate', function () {
        if (document.location.search.indexOf('gh_jid=') === -1) {
          this._hideJob();
        }
        else {
          this.ghSource = this._parseSource();
          this.currentJob = this._parseCurrentJob();
          Y.one('#JobId' + this.currentJob).simulate('click');
          Y.later(1000, this, function() {
            this.animateScroll(this.openings.get('region').top - 60);
          });
        }
      }, this));
    },

    _loadInclude: function () {
      if (!Y.one('#grnhse_iframe')) {
        if (Y.one('#GreenhouseScript')) {
          Y.one('#GreenhouseScript').remove();
        }
        var GreenhouseScript = document.createElement('script');
        GreenhouseScript.id = 'GreenhouseScript';
        GreenhouseScript.src = 'https://app.greenhouse.io/embed/job_board/js?for=squarespace';
        Y.one('head').append(GreenhouseScript);
        Y.one('#GreenhouseScript').on('load', function () {
          this._GrnhseLoaded = true;
          if (typeof _grnhse !== "undefined") {
            _grnhse.load();
            grnIframe = Y.one('#grnhse_iframe');
            grnIframe && grnIframe.setAttribute('onload', null);
          }
          else if (typeof Grnhse !== "undefined") {
            Grnhse.Iframe.load();
            grnIframe = Y.one('#grnhse_iframe');
            grnIframe && grnIframe.setAttribute('onload', null);
          }
        }, this);
      }
    },

    _parseCurrentJob: function () {
      return document.location.search.substring(document.location.search.indexOf('?gh_jid=') + 8, (document.location.search.indexOf('&gh_src=') !== -1 ? document.location.search.indexOf('&gh_src=') : document.location.search.length));
    },

    _parseSource: function () {
      if (document.location.search.indexOf('&gh_src=') != -1) {
        return document.location.search.substring(document.location.search.indexOf('&gh_src=') + 8);
      }
      else {
        return null;
      }
    },

    _getData: function(url, cb, context) {
      var url = url;
      var service = new Y.JSONPRequest( url, {
        on: {
          success: function (r, context, args) {
            if (typeof cb === 'function') {
              cb(r, context, args);
            }
          }
        },
        context: this,
        args: [context]
      })

      service.send();
    },

    _getJob: function (r, context) {
      Y.one('.job-description-content') && Y.one('.job-description-content').remove();
      var cJob = Y.one('#JobId' + r.id);
      var desc = document.createElement('div');
      desc.setAttribute('class', 'job-description-content');
      Y.one(desc).setHTML('<h2>' + r.title + '</h2>' + context.htmlDecode(r.content));

      context.jobDescriptionContainer.append(desc);

      if (context.openings.hasClass('show-job')) {
        context.openings.removeClass('show-job');
        if (Y.one('#grnhse_iframe')) {
          Y.one('#grnhse_iframe').setAttribute('src', '');
        }

      }
      else {
        if (context._GrnhseLoaded) {
          grnIframe = Y.one('#grnhse_iframe');
          if (grnIframe) {
            Y.later(300, context, function () {
              context.openings.addClass('show-job');
            });
            context.jobDescriptionContainer.append(Y.one('#grnhse_app'));
            grnIframe.setAttribute('onload', '');
            grnIframe.setAttribute('width', '100%');
            grnIframe.setAttribute('height', 'auto');
            grnIframe.setAttribute('scrolling', 'auto');
            grnIframe.setStyle('minHeight', '800px');
            grnIframe.on('load', function () {
              context._sizeToIframe();
            }, context);
            grnIframe.setAttribute('src', 'https://app.greenhouse.io/embed/job_app?token=' + context.currentJob + '&t=' + this.ghSource + '&b=' + document.location.origin + document.location.pathname);
            context.animateScroll(context.openings.get('region').top - 60);
          }
          else {
            if (typeof _grnhse !== "undefined") {
              _grnhse.load();
            }
            else if (typeof Grnhse !== "undefined") {
              Grnhse.Iframe.load();
            }
          }
        }
      }
    },

    _hideJob: function () {
      Y.Squarespace.FrontSite.Core.router.replace(Y.Squarespace.FrontSite.Core.router._getOrigin() + Y.Squarespace.FrontSite.Core.router._getPath());
      this.openings.removeClass('show-job');
      this.openings.one('.wrapper').setStyle('height', 'auto');
    },

    _buildJobList: function (data, context) {
      var offices = data.offices;
      for (var o = 0; o < offices.length; o++) {
        if (offices[o].id != '0') {
          var loc = document.createElement('div');
          loc.className = 'location';
          loc = Y.one(loc);
          loc.append('<h3 class="office">' + offices[o].name + '</h3>');
          if (offices[o].name === 'New York') {
            //NYC first
            context.jobListContainer.insert(loc, 0);
          }
          else {
            context.jobListContainer.append(loc);

          }
          context.currentOffice = loc;
          var departments = offices[o].departments;

          var numJobs = 0;
          for (var d = 0; d < departments.length; d++) {
            if (departments[d].jobs.length > 0) {
              context.currentOffice.append('<div class="department"><h4 class="department-name">' + departments[d].name + '</h4></div>');
              context.currentDepartment = context.currentOffice.all('.department');
              context.currentDepartment = context.currentDepartment.item(context.currentDepartment.size() - 1);
              for (var j in departments[d].jobs) {
                if (typeof departments[d].jobs[j] === 'object') {
                  numJobs++;
                  context.currentDepartment.append('<div class="job-posting job-posting--collapsed" id="JobId' + departments[d].jobs[j].id + '" data-job-id="' + departments[d].jobs[j].id + '"><a href="/about/careers?gh_jid=' + departments[d].jobs[j].id + (context.ghSource !== null ? ('&gh_src=' + context.ghSource) : '') + '">' + departments[d].jobs[j].title + '</a></div>');
                  context.currentJob = context.currentDepartment.all('.job-posting');
                  context.currentJob = context.currentJob.item(context.currentJob.size() - 1);
                  context.currentJob.on('click', function (event) {
                    event.preventDefault();
                    context.currentJob = event.currentTarget.getAttribute('data-job-id');
                    context._getData('https://api.greenhouse.io/v1/boards/squarespace/embed/job?id=' + context.currentJob + '&callback={callback}', function (response, context) {
                      context._getJob(response, context);
                    }, context);
                  }, context);
                }
              }
            }
          }
          if (numJobs < 1) {
            context.currentOffice.addClass('is--hidden');
          }
        }
      }
      context.jobListContainer.fire('JobsLoaded');
    },

    _sizeToIframe: function () {
      Y.one('#openings .wrapper').setStyle('height', (Y.one('.job-description > div').get('region').height + Y.one('#grnhse_app').get('region').height) + 150 + 'px');
    },

    animateScroll: function (yPos){
      var newY = yPos || 0;
      var windowScroll = new Y.Anim({
        node: (Y.UA.gecko || Y.UA.ie >= 10) ? 'html' : 'body',
        to: {
          scroll: [0, newY]
        },
        duration: 0.3,
        easing: 'easeBoth'
      });

      windowScroll.run();
    },

    htmlDecode: function (input){
      var e = document.createElement('div');
      e.innerHTML = input;
      return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    }
  });

}, '1.0', {
  requires: [
    'base-build',
    'jsonp',
    'json-parse'
  ]
});


/*
 * /about/contact map functionality
 */
Y.add('squarespace-custom-map', function(Y) {
  Y.namespace('Squarespace.FrontSite').CustomMap = Y.Base.create('CustomMap', Y.Base, [], {

    initializer: function(args) {
      if (typeof(google.maps.LatLng) !== 'function') {
        document.location.reload();
      }
      else {
        this.setLocations();
      }
    },

    destructor: function() {

    },

    setLocations: function () {
      this.soho = new google.maps.LatLng(40.7290071, -74.0057672);
      this.dublin = new google.maps.LatLng(53.341354, -6.267765);
      this.portland = new google.maps.LatLng(45.5198082, -122.6770901);
      this.markerSrc = 'assets/icon-map-marker-2x.png';

      google && Y.one(window).once('scroll', function() { this.doMap('map-nyc-canvas', this.soho) }, this);
      google && Y.one(window).once('scroll', function() { this.doMap('map-portland-canvas', this.portland) }, this);
      google && Y.one(window).once('scroll', function() { this.doMap('map-dublin-canvas', this.dublin) }, this);
    },

    doMap: function(id, location) {
      console.log('mapping');
      var MY_MAPTYPE_ID = 'custom_style';
      var map;

      var featureOptsNight = [
        {
          stylers: [
            { visibility: 'simplified' },
            { gamma: .2 },
            { weight: 0.5 }
          ]
        },
        {
          featureType: 'poi',
          stylers: [
            { visibility: 'off' }
          ]
        },
        {
          featureType: 'landscape',
          stylers: [
            { gamma: .2,
              saturation: -100 }
          ]
        },
        {
          featureType: 'all',
          stylers: [
            { saturation: -100 }
          ]
        },
        {
          featureType: 'water',
          stylers: [
            { color: '#222222' }
          ]
        },
        {
          featureType: 'road',
          stylers: [
            { color: '#222222' }
          ]
        },
        {
          elementType: 'labels',
          stylers: [
            { visibility: 'on',
              color: '#cc0000',
              saturation: 100 }
          ]
        }
      ];

      var featureOptsDark = [
        {
          stylers: [
            { visibility: 'simplified' },
            { gamma: 1 },
            { weight: 0.5 }
          ]
        },
        {
          featureType: 'poi',
          stylers: [
            { visibility: 'off' }
          ]
        },
        {
          featureType: 'landscape',
          stylers: [
            { gamma: 2,
              saturation: -100 }
          ]
        },
        {
          featureType: 'all',
          stylers: [
            { saturation: -100 }
          ]
        },
        {
          featureType: 'water',
          stylers: [
            { color: '#222222' }
          ]
        },
        {
          elementType: 'labels',
          stylers: [
            { visibility: 'on',
              color: '#cc0000',
              saturation: 100 }
          ]
        }
      ];

      var featureOptsLight = [
        {
          stylers: [
            { visibility: 'simplified' },
            { gamma: 1 },
            { weight: 0.5 }
          ]
        },
        {
          featureType: 'poi',
          stylers: [
            { visibility: 'off' }
          ]
        },
        {
          featureType: 'landscape',
          stylers: [
            { gamma: 2,
              saturation: -100 }
          ]
        },
        {
          featureType: 'all',
          stylers: [
            { saturation: -100 }
          ]
        },
        {
          featureType: 'water',
          stylers: [
            { color: '#b3b3b3' }
          ]
        },
        {
          elementType: 'labels',
          stylers: [
            { visibility: 'on',
              color: '#cc0000',
              saturation: 100 }
          ]
        }
      ];

      var styleArray = [
        {
          stylers: [
            { weight: 0.5 }
          ]
        },
        {
          featureType: 'administrative',
          stylers: [
            { gamma: .2,
              saturation: -100 }
          ]
        },
        {
          featureType: 'landscape',
          stylers: [
            { gamma: .2,
              saturation: -100 }
          ]
        },
        {
          featureType: 'poi',
          stylers: [
            { gamma: .2,
              saturation: -100,
              visibility: 'off' }
          ]
        },
        {
          featureType: 'road',
          stylers: [
            { gamma: .2,
              saturation: -100 }
          ]
        },
        {
          featureType: 'transit',
          stylers: [
            { gamma: .2,
              saturation: -100 }
          ]
        },
        {
          featureType: 'water',
          stylers: [
            { color: '#222222' }
          ]
        },
        {
          elementType: 'labels.icon',
          stylers: [
            { visibility: 'off',
              color: '#cc0000',
              saturation: 100 }
          ]
        },            {
          elementType: 'labels.text.fill',
          stylers: [
            { visibility: 'on',
              color: '#cc0000',
              saturation: 100 }
          ]
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [
            { visibility: 'on',
              color: '#cc0000',
              saturation: 100 }
          ]
        },
        {
          elementType: 'geometry.fill',
          stylers: [
            { visibility: 'on',
              gamma: .2,
              saturation: -100 }
          ]
        },
        {
          elementType: 'geometry.stroke',
          stylers: [
            { visibility: 'on',
              gamma: .2,
              saturation: -100 }
          ]
        }
      ];

      var mapOptions = {
        zoom: 12,
        center: location,
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
        },
        mapTypeId: MY_MAPTYPE_ID
      };

      map = new google.maps.Map(document.getElementById(id),
          mapOptions);
      console.log(map);

      var styledMapOptions = {
        name: 'Custom Style'
      };

      var customMapType = new google.maps.StyledMapType(featureOptsDark, styledMapOptions);

      map.mapTypes.set(MY_MAPTYPE_ID, customMapType);

      var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: {
          url: this.markerSrc,
          size: new google.maps.Size(52, 68),
          scaledSize: new google.maps.Size(26, 34),
          anchor: new google.maps.Point(13, 34)
        }
      });

      google.maps.event.addListener(map, 'click', function(i) {
        Y.Squarespace.myMap = this;
        //Y.Squarespace.myMap.mapTypes.set(Y.Squarespace.myMap.mapTypeId, new google.maps.StyledMapType(styleArray))
      })
    }
  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


/*
 * Mobile Apps -- November 2013
 */
Y.add('squarespace-mobile-apps-new', function (Y) {

  Y.namespace('Squarespace.FrontSite').MobileAppsNew = Y.Base.create('mobileAppsNew', Y.Base, [], {

    initializer: function () {
      var hash = window.location.hash;

      var header = document.getElementById('header-2016');
      if (header){
        header.classList.add('is--dark');
      }

      this.wrapper = Y.one('.apps-page');
      this.rows = this.wrapper.all('.apps-page-row');
      this.rowsContent = this.wrapper.all('.apps-page-row-content');

      this.iphone = this.wrapper.one('.apps-page-interactive.apps-page-iphone');
      this.ipad = this.wrapper.one('.apps-page-interactive.apps-page-ipad');

      this.iphoneGallery = this.iphone.one('.apps-page-device-gallery');
      this.ipadGallery = this.ipad.one('.apps-page-device-gallery');

      this.details = this.wrapper.one('.apps-page-row--app .apps-page-row-details');
      this.detailsTitle = this.details.one('.apps-page-row-title');
      this.detailsBody = this.details.one('.apps-page-row-body');
      this.detailsStore = this.details.one('.apps-page-row-store');

      this.hero = this.wrapper.one('.apps-page-hero');
      this.credits = this.wrapper.one('.apps-page-credits');
      this.logo = this.wrapper.one('.apps-page-logo');
      this.nav = this.wrapper.one('.apps-page-nav');
      this.navItems = this.nav.all('.apps-page-nav-link');

      this.currentSection = null;
      this.resizeDelay = null;
      this.events = [];
      this.scrollDelays = []
      this.galleries = [];

      this._parseRows();

      this.bindUI();
      this.syncUI();

      // Force to top as certain browsers 'remember' the page's previous Y pos
      Y.later(50, this, function () {
        window.scrollTo(1, 1); // Works better than 0, 0
        this._checkForHashes(hash);
        this._intro();

        // Force this on Chrome -- fix
        // issue when clicking on 'Apps'
        this._windowResize();
      });
    },


    destructor: function () {
      this._killDelays();

      Y.Array.each(this.events, function (e) {
        e.detach();
      });

      Y.Array.each(this.galleries, function (gallery) {
        gallery.destroy();
      });
    },


    bindUI: function () {
      var resizeEvent = window.orientation !== undefined ? 'orientationchange' : 'resize';

      this.events.push(Y.one(window).on(resizeEvent, this._windowResize, this));
      this.events.push(Y.one(window).on('scroll', this._windowScroll, this));

      this.iphone.on('click', this._focusIphone, this);

      this.logo.on('click', this._scrollToTop, this);

      this.navItems.each(function (item, index) {
        item.on('click', this._jumpToSection.bind(this, index));
      }, this);
    },


    syncUI: function () {
      this.isMobile = this._isSimplePage();

      if (!this.isMobile) {
        this._modifyRowPadding();
        this._calculateFixedNavCutoff();
        this._refreshElements();
        this._windowScroll();
      }
    },


    _intro: function () {
      this.logo.removeClass('is--hidden');
    },


    _isSimplePage: function () {
      var simple = false;

      if (Y.UA.ie && Y.UA.ie <= 9) {
        simple = true;
        Y.one(document.body).addClass('apps-page--simple');
      } else {
        simple = document.body.clientWidth <= 1024 ? true : false;
      }

      return simple;
    },


    _scrollToTop: function () {

      if (this.currentSection === 0) {

        var windowScroll = new Y.Anim({
          node: (Y.UA.gecko || Y.UA.ie >= 10) ? 'html' : 'body',
          to: {
            scroll: [0, 0]
          },
          duration: 1,
          easing: 'easeBoth'
        });

        windowScroll.run();

      } else {

        this.wrapper.addClass('apps-page--scrolling');

        Y.later(700, this, function () {
          window.scrollTo(0, 0);
          this._switchDetails(0);

          Y.later(200, this, function () {
            this.nav.addClass('apps-page-nav--all-active');
            this.wrapper.removeClass('apps-page--scrolling');
          });
        });
      }
    },


    _refreshElements: function () {
      var ratio = 0.32;

      if (document.body.clientWidth <= 1950) {
        ratio = 0.3;
      }

      if (document.body.clientWidth <= 1600) {

        if (window.innerHeight > 950) {
          ratio = 0.28;
        } else {
          ratio = 0.32;
        }
      }

      var detailsWidth = document.body.clientWidth * ratio;
      this.details.setStyle('width', detailsWidth);

      var detailsHeight = this.details.get('clientHeight');
      var midPoint = (window.innerHeight / 2);

      this.details.setStyles({
        'height': detailsHeight,
        'marginBottom': midPoint - (detailsHeight / 2),
        'bottom': -midPoint - (detailsHeight / 2)
      });

      this.scrollData = {
        sectionHeight: window.innerHeight * 1.5,
        rowCount: this.rowData.length + 1
      };

      this.scrollData.padding = this.scrollData.sectionHeight * this.scrollData.rowCount;
      this.wrapper.setStyle('paddingBottom', this.scrollData.padding);
      this.scrollData.cutoff = document.body.clientHeight - this.scrollData.padding;

      // Make first row shorter
      var delta = 0.7;
      this.scrollData.cutoff -= (this.scrollData.sectionHeight * delta);
      this.scrollData.cutoffDelta = (this.scrollData.sectionHeight * (1 - delta));

      // The Android section is empty right now -- let's make it quick
      var delta = this.scrollData.sectionHeight * 1.5;
      this.wrapper.setStyle('paddingBottom', this.scrollData.padding - delta);

      this.parallaxCoords = this._getCoordinates();
    },


    _focusIphone: function () {
      var bottom = this.iphone._node.getBoundingClientRect().bottom;

      if (bottom > window.innerHeight) {
        this._jumpToSection(0);
      }
    },


    _checkForHashes: function (hash) {
      if (hash) {
        hash = hash.substring(1);

        this.navItems.each(function (item, index) {
          if (item.getAttribute('data-link') === hash) {
            this._jumpToSection(index, true);
            return;
          }
        }, this);
      }
    },


    _parseRows: function () {
      this.rowData = [];

      var data;
      var title;
      var appleStore;

      this.rowsContent.each(function (row) {
        title = row.one('.apps-page-row-title').get('innerHTML');
        appleStore = row.one('.apps-page-row-store');

        data = {
          title: title,
          body: row.one('.apps-page-row-body').get('innerHTML'),

          iphoneWrapper: this.iphoneGallery.one('[data-gallery="' + title.toLowerCase() + '"]'),
          iphoneSlides: this.iphoneGallery.all('[data-gallery="' + title.toLowerCase() + '"] span'),
          iphoneImages: this.iphoneGallery.all('[data-gallery="' + title.toLowerCase() + '"] span img'),

          ipadWrapper: this.ipadGallery.one('[data-gallery="' + title.toLowerCase() + '"]'),
          ipadSlides: this.ipadGallery.all('[data-gallery="' + title.toLowerCase() + '"] span'),
          ipadImages: this.ipadGallery.all('[data-gallery="' + title.toLowerCase() + '"] span img'),

          appleStore: appleStore && appleStore.getAttribute('href'),

          // Implement this properly when we have android galleries
          android: row.getAttribute('data-android')
        };

        this.rowData.push(data);
      }, this);

      // Kill the first row
      this.rowData.shift();
    },


    _windowResize: function () {

      if (this.resizeDelay) {
        this.resizeDelay.cancel();
      }

      this.resizeDelay = Y.later(400, this, function () {
        this.syncUI();
        this._sizeCleanup();
      });
    },


    // Possible left overs when resizing below / above this.isMobile
    _sizeCleanup: function () {

      if (this.isMobile) {
        this.rowsContent.setStyles({
          'paddingTop': null,
          'paddingBottom': null
        });

        this.details.setStyles({
          'transform': 'translate3d(0, 0, 0)',
          'marginTop': null,
          'width': null,
          'height': null,
          'marginBottom': null,
          'bottom': null
        });

        this.wrapper.setStyle('paddingBottom', null);
      }
    },


    _windowScroll: function () {
      if (!this.isMobile) {
        this._styleElementsWithScroll();
        this._trackDetailsPosition();
        this._fixNav();
      }
    },


    _calculateFixedNavCutoff: function () {
      var fixedClass = 'apps-page-nav--fixed';

      if (!this.nav.hasClass(fixedClass)) {
        this.navFixedCutoff = this.nav.getY();
      } else {
        this.nav.removeClass(fixedClass);
        this.navFixedCutoff = this.nav.getY();
        this.nav.addClass(fixedClass);
      }

      this.navHeight = this.nav.get('clientHeight');
    },


    _fixNav: function () {
      var scrollY = Y.Squarespace.FrontSite.Core._winY();
      var switchToFix = window.innerHeight > 700 && scrollY >= this.navFixedCutoff;

      var fixedClass = 'apps-page-nav--fixed';

      if (switchToFix) {
        this.nav.addClass(fixedClass);
        this._setActiveStates(false);
      } else {
        this.nav.removeClass(fixedClass);
        this._setActiveStates(true);
      }
    },


    _styleElementsWithScroll: function () {
      var end = window.innerHeight;
      var frame = Y.Squarespace.FrontSite.Core._winY();
      var progress = (frame / end);

      // Normalize progress
      progress = Math.max(0, progress);
      progress = Math.min(1, progress);

      var coords = this.parallaxCoords;
      var iPhoneY = coords.iPhone;

      // Shift the iPhone upwards if the ipad is hidden
      if (this.iphone.hasClass('displace')) {
        iPhoneY -= (window.innerHeight * 0.07);
      }

      // Slide devices
      this._updatePosition(this.iphone, iPhoneY, progress);
      this._updatePosition(this.ipad, coords.iPad, progress);

      // Slide details
      this._updatePosition(this.details, coords.details, progress);

      // Fade hero
      var opacity = Math.max(0, 0.6 - progress);
      this.hero.setStyle('opacity', opacity);

      opacity = Math.max(0, 1 - ((progress / 0.2)));
      this.credits.setStyle('opacity', opacity);

      if (progress >= 0.2) {
        this.credits.addClass('is--hidden');
      } else {
        this.credits.removeClass('is--hidden');
      }

      // Enable/disable additional transitions
      if (progress === 1) {
        this.iphone.removeClass('no-transition');
      } else {
        this.iphone.addClass('no-transition');
      }
    },


    _updatePosition: function (el, target, progress, style) {
      var frame = target * progress;
      el.setStyle('transform', 'translate3d(0, ' + frame + 'px, 0)');
    },


    // TODO: CLEANUP!!
    _getCoordinates: function () {
      var end = window.innerHeight;

      // Calculate desired target positions
      var extraGap = 80;
      var ipadDelta = 40;

      // Clean up pls
      if (end <= 1280) {
        extraGap = 60;
      }

      if (end <= 1240) {
        extraGap = 30;
      }

      if (end <= 1200) {
        extraGap = 150;
        ipadDelta = 30;
      }

      if (end <= 1150) {
        extraGap = 120;
      }

      if (end <= 1100) {
        extraGap = 90;
      }

      if (end <= 1050) {
        extraGap = 60;
      }

      if (end <= 1000) {
        extraGap = 40;
      }

      if (end <= 950) {
        extraGap = 160;
      }

      if (end <= 900) {
        extraGap = 120;
      }

      if (end <= 850) {
        extraGap = 80;
      }

      if (end <= 780) {
        extraGap = 50;
      }

      if (end <= 700) {
        extraGap = 80;
      }

      if (end <= 650) {
        extraGap = 50;
      }

      var iphoneBottom = parseInt(this.iphone.getStyle('bottom'), 10) - extraGap;
      var ipadBottom = parseInt(this.ipad.getStyle('bottom'), 10) - extraGap - ipadDelta;
      var detailsBottom = parseInt(this.details.getStyle('bottom'), 10);

      return {
        iPhone: iphoneBottom,
        iPad: ipadBottom,
        details: detailsBottom
      }
    },


    _trackDetailsPosition: function () {
      var scrollY = Y.Squarespace.FrontSite.Core._winY() + window.innerHeight;

      if (scrollY >= this.scrollData.cutoff) {
        var delta = scrollY - this.scrollData.cutoff;
        var section = Math.floor(delta / this.scrollData.sectionHeight);

        if (section !== this.currentSection && section < this.scrollData.rowCount - 1) {
          this._switchDetails(section, true);
        }

      } else {

        if (this.currentSection === null) {
          this._switchDetails(0);
        }
      }
    },


    _setActiveStates: function (all) {
      var scrollY = Y.Squarespace.FrontSite.Core._winY();
      var index = this.currentSection;
      var activeClass = 'apps-page-nav--all-active';

      if (all) {
        this.nav.addClass(activeClass);
      } else {
        this.nav.removeClass(activeClass);
        index = Math.min(index, this.rowsContent.size() - 2);
        this.navItems.removeClass('apps-page-nav-link--active');
        this.navItems.item(index).addClass('apps-page-nav-link--active');
      }

      this._updateHash(all ? 'intro' : null);
    },


    _jumpToSection: function (index, skipAnimation) {

      this._killDelays();

      var pos = this.scrollData.cutoff + (this.scrollData.sectionHeight * index);
      pos += this.scrollData.cutoffDelta;

      var scrollY = Y.Squarespace.FrontSite.Core._winY();
      var firstRow = this.rows.item(1).getY();
      var count = this.rowData[index].ipadSlides.size();

      if (scrollY < firstRow) {

        // Focus on interaction row first...
        var windowScroll = new Y.Anim({
          node: (Y.UA.gecko || Y.UA.ie >= 10) ? 'html' : 'body',
          to: {
            scroll: [0, firstRow]
          },
          duration: skipAnimation === true ? 0 : 0.8,
          easing: 'easeBoth'
        });

        // ... then scroll to section
        windowScroll.on('end', function () {
          window.scrollTo(0, pos);
          this._translateLonelyIphone(count);
        }, this);

        windowScroll.run();

      } else {
        // We're focused -- just scroll
        window.scrollTo(0, pos);
        this._translateLonelyIphone(count);
      }

      if (index === 0) {
        this.details.removeClass('apps-page-row-details--hidden');
      }
    },


    _killDelays: function () {
      Y.Array.each(this.scrollDelays, function (delay) {
        delay.cancel();
      });

      this.scrollDelays = [];
    },


    _updateHash: function (hash) {

      if (!hash) {
        var item = this.navItems.item(this.currentSection);
        hash = item.getAttribute('data-link');
      }

      if (window.location.hash !== '#' + hash) {
        window.location.hash = hash;
      }
    },


    _switchDetails: function (index) {

      this._killDelays();

      var data = this.rowData[index];
      var scrollY = this.rows.item(1).getY();
      var hiddenClass = 'apps-page-row-details--hidden';
      var rightClass = 'apps-page-row-details--right';

      // Change Section
      this.currentSection = index;

      this.details.addClass(hiddenClass);

      this.scrollDelays.push(Y.later(450, this, function () {

        this.detailsTitle.set('innerHTML', data.title);
        this.detailsBody.set('innerHTML', data.body);

        if (!data.android && !data.ipadSlides.size()) {
          this.details.addClass(rightClass);
        } else {
          this.details.removeClass(rightClass);
        }

        // Add app types
        var typeIphone = Y.Node.create('<span class="apps-page-row-type">iPhone</span>');
        var typeIpad = Y.Node.create('<span class="apps-page-row-type">iPad</span>');
        var appleWatch = Y.Node.create('<span class="apps-page-row-type">Apple Watch</span>');

        if (data.iphoneSlides.size()) {
          this.detailsTitle.appendChild(typeIphone);
        }

        if (data.ipadSlides.size()) {
          this.detailsTitle.appendChild(typeIpad);
        }

        if (data.title === 'Metrics') {
          this.detailsTitle.appendChild(appleWatch);
        }

        // Show/hide link to apple store
        if (!data.appleStore) {
          this.details.addClass('apps-page-row--android');
          this.detailsStore.addClass('apps-page-row-store--hidden');
          this.iphone.addClass('is--hidden');
        } else {
          this.details.removeClass('apps-page-row--android');
          this.detailsStore.setAttribute('href', data.appleStore);
          this.detailsStore.removeClass('apps-page-row-store--hidden');
          this.iphone.removeClass('is--hidden');
        }

        // Wait for the right/android switch
        this.scrollDelays.push(Y.later(150, this, function () {
          this.details.removeClass(hiddenClass);
        }));
      }));

      // Show or hide devices
      var inactive = 'apps-page--inactive-device';

      if (data.ipadSlides.size() === 0) {
        this.ipad.addClass(inactive);
      } else {
        this.scrollDelays.push(Y.later(800, this, function () {
          this.ipad.removeClass(inactive);
        }));
      }

      if (data.iphoneSlides.size() === 0) {
        this.iphone.addClass(inactive);
      } else {
        this.scrollDelays.push(Y.later(600, this, function () {
          this.iphone.removeClass(inactive);
        }));
      }

      this._translateLonelyIphone(data.ipadSlides.size());

      this._initializeGalleries(this.currentSection);
    },


    _translateLonelyIphone: function (ipadCount) {
      if (ipadCount === 0) {
        this.iphone.addClass('displace');
      } else {
        this.iphone.removeClass('displace');
      }
    },


    _initializeGalleries: function (index) {
      var data = this.rowData[index];

      data.iphoneImages.each(function (img) {
        img.plug(Y.Squarespace.Loader2, { load: true });
        img.removeAttribute('data-load');
      });

      data.ipadImages.each(function (img) {
        img.plug(Y.Squarespace.Loader2, { load: true });
        img.removeAttribute('data-load');
      });

      this._renderGallery(0, data.iphoneWrapper, data.iphoneSlides);
      this._renderGallery(1, data.ipadWrapper, data.ipadSlides);
    },


    _createGallery: function (index, wrapper, slides) {

      if (!this.galleries[index]) {
        this.galleries[index] = new Y.Squarespace.Gallery2({
          container: wrapper,
          slides: slides,
          design: 'stacked',
          autoplay: index === 0 ? true: false,
          loop: true,
          designOptions: {
            autoHeight: false,
            speed: 0.3,
            transition: 'fade'
          },
          autoplayOptions: {
            timeout: 6000
          }
        });

        if (index === 0) {
          this.galleries[0].after('currentIndexChange', function (e) {
            this.galleries[1].set('currentIndex', e.newVal);
          }, this);
        }

      } else {
        this.galleries[index].set('container', wrapper);
        this.galleries[index].set('slides', slides);
        this.galleries[index].set('currentIndex', 0);

        // Dirty hacks
        if (index === 0) {
          this.galleries[0].set('autoplay', false);
          this.galleries[0].set('autoplay', true);

          if (this.galleryShift) {
            this.galleryShift.detach();
          }

          if (slides._query !== '[data-gallery="blog"] span') {
            this.galleryShift = this.iphone.on('click', function () {
              var current = this.galleries[0].get('currentIndex');
              this.galleries[0].set('currentIndex', current + 1);
            }, this);
          }
        }
      }
    },


    _renderGallery: function (index, wrapper, slides) {

      if (wrapper) {

        var gallery = this.galleries[index];
        var galleryWrapper = wrapper.ancestor();
        var hiddenClass = 'apps-page-device-gallery--hidden';

        if (gallery) {

          galleryWrapper.addClass(hiddenClass);

          this.scrollDelays.push(Y.later(index === 0 ? 450 : 0, this, function () {

            var oldSlides = gallery.get('slides');
            oldSlides.setStyle('display', 'none');

            slides.setStyle('display', null);

            this._createGallery(index, wrapper, slides);

            galleryWrapper.removeClass(hiddenClass);

          }));

        } else {
          this._createGallery(index, wrapper, slides);
        }
      }
    },


    _modifyRowPadding: function () {
      var contentHeight = 0;
      var padding = 0;
      var windowHeight = window.innerHeight;

      this.rowsContent.each(function (rowContent, index) {

        rowContent.setStyles({
          'paddingTop': null,
          'paddingBottom': null
        });

        contentHeight = rowContent.get('clientHeight');
        padding = (windowHeight - contentHeight) / 2;

        rowContent.setStyles({
          'paddingTop': padding,
          'paddingBottom': padding
        });
      });
    }

  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


/*
 * Logomark
 */
Y.add('squarespace-logomark', function(Y) {

  Y.namespace('Squarespace.FrontSite').Logomark = Y.Base.create('Logomark', Y.Base, [], {
    initializer: function () {
      LM.initialize();

      this.menu = Y.one('.navigation--main');
      this.menuTrigger = Y.one('.navigation-actions');

      // this.menuTrigger.removeClass('is--invisible');
      // this.menuTrigger.removeClass('navigation-actions--light');
      //
      // SQUARESPACE_IS_AWESOME.switchHeader('dark');

      this.header = Y.one('.header');
      this.header.setStyle('display', 'none');

      // this.menuTrigger.addClass('logomark-position');
    },

    destructor: function () {
      // this.menuTrigger.setStyle('visibility', 'hidden');
      // this.menuTrigger.removeClass('logomark-position');
      Y.later(600, this, function () {
        this.header.setStyle('display', null);
        // this.menuTrigger.setStyle('visibility', null);
      });

    }


  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


/*
 * /LOGIN
 */
Y.add('squarespace-login-page', function(Y) {

  Y.namespace('Squarespace.FrontSite').LoginPage = Y.Base.create('LoginPage', Y.Base, [], {

    initializer: function () {

      // Enssure secure connection...client-side
      // // http://squarespace.com/login
      // if (document.location.protocol !== 'https:' && document.location.hostname.indexOf('www') === -1) {
      //   document.location = 'https://www.' + document.location.hostname+'/login';
      // }
      //
      // // http://www.squarespace.com/login
      // else if (document.location.protocol !== 'https:'){
      //   document.location = 'https://' + document.location.hostname+'/login';
      // }
      //
      // // https://squarespace.com/login (AJAX only works from www.squarespace.com)
      // else if (document.location.hostname.indexOf('www') === -1){
      //   document.location = 'https://www.' + document.location.hostname+'/login';
      // }
      //
      // // https://www.squarespace.com/login (yay, we made it)
      // else {
        SQUARESPACE_IS_AWESOME.switchHeader('dark', false, true);
        SQUARESPACE_LOGIN.params.disableOverlayCancel = true;
        SQUARESPACE_LOGIN.params.overlayOpacity = false;
        SQUARESPACE_LOGIN.params.disableCreateAccount = false;
        SQUARESPACE_LOGIN.params.canSignup = true;

        SQUARESPACE_LOGIN._showLoginInIframe();
        Y.one('.dialog-login') && Y.one('.dialog-login').appendTo(Y.one('.layout'));
        Y.one('.sqs-widgets-login') && Y.one('.sqs-widgets-login').appendTo(Y.one('.layout'));
      // }
    },

    destructor: function () {
    }

  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


/*
 * Details
 */
Y.add('squarespace-details', function(Y) {

  Y.namespace('Squarespace.FrontSite').Details = Y.Base.create('Details', Y.Base, [], {

    initializer: function () {
      if (Y.Squarespace.FrontSite.Core.currentPage.name !== 'Details' && ((Y.Squarespace.FrontSite.Core.currentPage.name !== undefined) || (Y.Squarespace.FrontSite.Core.currentPage === 'otherpage'))){
        document.body.querySelector('.navigation').style.visibility = 'hidden';
        document.body.querySelector('.layout').style.visibility = 'hidden';
        document.body.querySelector('.layout').style.opacity = '0';

        Y.one('body').removeClass('ready');

        /*JS.addClass(JS.one('body'), 'abtest-setup');
        try {
          window.ABTest_Landing = new Y.Squarespace.ABTest
            .newTest('frontsite_landing_tagline')
            .variation('Tagline message service list', 'service_list')
            .variation('Tagline message free trial', 'free_trial')
            .conversionGoal('lifecycle_trial')
          .select();

          if (window.ABTest_Landing === 'service_list') {
            JS.one('.details-text-tagline').innerHTML = 'Websites<span class="bullet">&bull;</span>Domains<span class="bullet">&bull;</span>Commerce<span class="details-tagline--break"><span class="bullet">&bull;</span>Mobile<span class="bullet">&bull;</span>24/7 Support</span>'
          }
          else if (window.ABTest_Landing === 'free_trial') {
            JS.one('.details-text-tagline').innerHTML = 'Start your free trial today. <span class="marketing-tagline--break">No credit card required.</span>'
          }
        }
        catch (e) {
          console.log(e);
        }
        JS.removeClass(JS.one('body'), 'abtest-setup');*/

        if (DetailsGallery) {
          DetailsGallery.scenes = new Array();
          DetailsGallery.active = 0;
          DetailsGallery.playlists = null;
          DetailsGallery.plist = null;
          DetailsGallery.device = null;
        }
        DetailsGallery.init({'autoplay': true});
      }

      if (DetailsGallery.landingInfo) {
        Y.Squarespace.FrontSite.Core.trackEvent('frontsite_view', {
          'playlist_index': (DetailsGallery.landingInfo.plistIndex + '_' + DetailsGallery.landingInfo.plistFirstPersona),
          'landing_persona': DetailsGallery.plist[0]
        })
      }

      this.ctaButton = Y.one('.cta');
      this.ctaButton && this.ctaButton.removeClass('is--hidden');

      this.vids = {
        'stlucia' : '6KEVtTSOouE',
        'alex' : 'PmYl9gP2rK8'
      }


      var isDark = Y.one('.details-text-wrapper--dark');
      var style = isDark ? 'dark' : 'light';

      if (isDark) {
        this.ctaButton.addClass('cta--dark');
      }

      Y.Squarespace.FrontSite.Core.switchHeader(style);

      Y.later(100, this, function () {
        Y.one('body').addClass('cta--ready');
        this.ctaButton && this.ctaButton.removeClass('is--invisible');
      });

      Y.Squarespace.FrontSite.Core.tourLink(true);
      Y.Squarespace.FrontSite.Core.loginLink(true);

      this.events = [];
      this.navevents = [];

      Y.one('.header').removeClass('is--hidden');

      setTimeout(function () {
        Y.one('body').addClass('navigation--ready');
      }, 5);

      this._bindUI();

      DetailsGallery.updateUI();

      DetailsGallery.preloadInterval = 600;

      DetailsGallery.preloadTimer = setTimeout(function () {
        this.preload();
      }.bind(DetailsGallery), DetailsGallery.preloadInterval);


      DetailsGallery.displayTimerA = setTimeout(function() {
        document.body.querySelector('.layout').style.visibility = '';
        document.body.querySelector('.layout').style.opacity = '';
      }, 250);
      DetailsGallery.displayTimerB = setTimeout(function() {
        document.body.querySelector('.navigation').style.visibility = '';
      }, 750);
    },


    destructor: function () {
      Y.one('.navigation-actions').removeClass('is--hidden');

      for (var e = 0; e < this.events.length; e++) {
        this.events[e].detach();
      }

      if (this._bwYUI) {
        this._bwYUI.destroy();
      }

      if (DetailsGallery) {
        for (var ii = 0; ii < DetailsGallery.scenes.length; ii++) {
          DetailsGallery.scenes[ii].destructor();
        }
      }
      Y.one('body').removeClass('ready');
    },

    _bindUI: function () {
      Y.later(500, this, function () {
        var isDark = Y.one('.details-text-wrapper--dark');
        var style = isDark ? 'dark' : 'light';

        if (isDark) {
          Y.one('.cta').addClass('cta--dark');
        }

        SQUARESPACE_IS_AWESOME.switchHeader(style);
      });

      this.events.push(Y.one('.customer-login').on('click', function(e) {
        Y.Squarespace.FrontSite.Core.trackEvent('frontsite_login_click');
        (DetailsGallery.autoplay === true) && DetailsGallery.stopAutoplay();
      }, this));

      this.events.push(Y.one('.details-text-wrapper .button').on('click', function (e) {
        Y.Squarespace.FrontSite.Core.trackEvent('frontsite_get_started_click', {
          'persona': DetailsGallery.scenes[DetailsGallery.getActive()].sceneName
        })
      }, this));

      this.ctaText = this.ctaButton.one('.cta-text');
      this.ctaContentElement = this.ctaButton.getAttribute('data-content-element');

      this.events.push(
        Y.one('.attribution-button').on('click', function(e) {
          (DetailsGallery.autoplay === true) && DetailsGallery.stopAutoplay();
          if (this.vids[DetailsGallery.scenes[DetailsGallery.active].sceneName]) {
            e.preventDefault();
            e.halt();
            this._customerVideo('show', DetailsGallery.scenes[DetailsGallery.active].sceneName);
          }
        }, this),

        Y.one('document').on('keydown', function(e) {
          if (e.keyCode === 27 && Y.one('.layout.lights-down')) {
            this._customerVideo('hide');
          }
        }, this)
      )
      /*
      this.ctaButton && this.ctaButton.on('click', function (event) {
        event.preventDefault();

        (DetailsGallery.autoplay === true) && DetailsGallery.stopAutoplay();

        this.ctaButton.addClass('loading');

        this.ctaText.setHTML('Loading<span class="break"> </span>video');

        var path = event.currentTarget.getAttribute('data-href');

        Y.Data.get({
          url: path, //this.router.getPath(),
          responseFormat: 'raw',
          failure: Y.bind(function (data) {
            this.changeUrl('/moved/');
          }, this),
          success: Y.bind(function (data) {
            var dom = Y.DOM.create(data);
            Y.one('.layout').prepend(Y.Selector.query(this.ctaContentElement, dom, true));

            // Update this for new ads
            this._bwYUI = this.currentPage = new Y.Squarespace.FrontSite.DetailsCommercial();

            Y.one('.header').addClass('transparent');
            Y.one('.navigation-actions').addClass('transparent');
            Y.one('.cta').addClass('transparent');

            this.ctaButton.detach('click');

            this.ctaButton.on('click', function(e) {
              e.preventDefault();

              Y.one('.header').addClass('transparent');
              Y.one('.navigation-actions').addClass('transparent');
              Y.one('.cta').addClass('transparent');

              Y.one(this.ctaContentElement).removeClass('hidden');

              // Update this for new ads
              DetailsCommercial.renderUI();
            }, this);

            // Update this for new ads
            DetailsCommercial.init();
          }, this)
        });

      }, this);
      */

      this.events.push(Y.one('document').on('click', function (e) {
        (DetailsGallery.autoplay === true) && DetailsGallery.stopAutoplay();
      }, this));

      this._navigationControls();
    },

    _navigationControls: function () {
      this.navevents.push(Y.one(DetailsGallery.nav.left).on('click', function () {
        this._detachNavEvents();
        DetailsGallery.stopAutoplay();
        DetailsGallery.navScene('prev');
      }, this));

      this.navevents.push(Y.one(DetailsGallery.nav.right).on('click', function () {
        this._detachNavEvents();
        DetailsGallery.stopAutoplay();
        DetailsGallery.navScene('next');
      }, this));

      this.navevents.push(Y.one('document').on('keydown', function (e) {
        DetailsGallery.stopAutoplay();

        if (Y.one('body').hasClass('detailsCommercial-ready')) {
          return false;
        }

        var code = e.keyCode;

        // left
        if (code === 37) {
          this._detachNavEvents();
          DetailsGallery.navScene('prev');

          /*Y.Squarespace.FrontSite.Core.trackEvent('frontsite_details_arrow_click', {
            right: false
          });*/
        }
        // right
        else if (code === 39) {
          this._detachNavEvents();
          DetailsGallery.navScene('next');

          /*Y.Squarespace.FrontSite.Core.trackEvent('frontsite_details_arrow_click', {
            right: true
          });*/
        }
      }, this));
    },

    _detachNavEvents: function () {
      for (var e = 0; e < this.navevents.length; e++) {
        this.navevents[e].detach();
      }
      this.navevents = [];
    },

    _customerVideo: function (mode, video) {
      Y.one('.header').toggleClass('fade-out');
      Y.one('.navigation-actions').toggleClass('fade-out');
      Y.one('.details-text-wrapper').toggleClass('fade-out');
      Y.one('.attribution-button').toggleClass('fade-out');
      Y.one('.cta').toggleClass('fade-out');
      Y.one('.cta-mobile').toggleClass('fade-out');
      Y.one('.viz .attribution').toggleClass('fade-out');
      Y.all('.slider-arrow').toggleClass('is--hidden');
      Y.one('.layout').toggleClass('lights-down');

      if (mode === 'show') {
        var videoPath = document.location.protocol + '//www.youtube.com/embed/' + this.vids[video] + '?rel=0';

        Y.one('.layout').append('<div class="video-player"><iframe width="1280" height="720" src="' + videoPath + '" frameborder="0" allowfullscreen></iframe></div>');
        Y.one('.layout').append('<span class="video-close"><span class="icon"></span></span>');
        Y.one('.video-player iframe').on('load', function() {
          this.setStyle('opacity', 1);
        }, Y.one('.video-player'));
        Y.one('.layout .video-close').once('click', function() {
          this._customerVideo('hide');
        }, this);

        SQUARESPACE_IS_AWESOME.escTarget('add','customervideo', this);

      }

      else {
        var vPlayer = Y.one('.video-player');
        if (vPlayer) {
          vPlayer.remove(true);
          Y.one('.layout .video-close').remove(true);
        }
        Y.later(200, this, function() {
          SQUARESPACE_IS_AWESOME.escTarget('remove','customervideo', this);
        });
      }
    }
  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


/*
 * A Better Web
 */
Y.add('squarespace-betterweb', function(Y) {

  Y.namespace('Squarespace.FrontSite').BetterWeb = Y.Base.create('BetterWeb', Y.Base, [], {

    initializer: function () {
      //console.log('Better web YUI module. init () ...');
      this.details = Y.one('.layout.details');
      this.betterweb = Y.one('.betterweb');

      this._renderUI();
      this._bindUI();
    },

    destructor: function () {
      Betterweb.destructor();
      Y.one('.navigation-actions').removeClass('is--hidden');
    },

    _renderUI: function () {
      Y.Squarespace.FrontSite.Core.switchHeader('light');
      Y.Squarespace.FrontSite.Core.tourLink(true);
      Y.Squarespace.FrontSite.Core.loginLink(true);

      Y.one('.header').removeClass('is--hidden');

      Y.one('.adblitz') && Y.one('.adblitz').removeClass('is--invisible');

      Y.one('body').addClass('navigation--ready');
      this._setFullHeight();
    },

    _bindUI: function () {
      Y.one(window).on('resize', function () {
        this._setFullHeight();
      }, this);
    },

    _setFullHeight: function () {
      if (this.details) {
        this.betterweb.setStyle('height', this.details.getComputedStyle('height'));
      }
      else {

      }
    }
  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


/*
 * Details commercial
 */
Y.add('squarespace-detailscommercial', function(Y) {

  Y.namespace('Squarespace.FrontSite').DetailsCommercial = Y.Base.create('DetailsCommercial', Y.Base, [], {

    initializer: function () {
      //console.log('Details Commercial web YUI module. init () ...');
      this.details = Y.one('.layout.details');
      this.detailscomm = Y.one('.detailsCommercial');

      this._renderUI();
      this._bindUI();
    },

    destructor: function () {
      Y.one('.navigation-actions').removeClass('is--hidden');
    },

    _renderUI: function () {
      //Y.Squarespace.FrontSite.Core.switchHeader('light');
      Y.Squarespace.FrontSite.Core.tourLink(true);
      Y.Squarespace.FrontSite.Core.loginLink(true);

      Y.one('.header').removeClass('is--hidden');

      Y.one('body').addClass('navigation--ready');
      this._setFullHeight();
    },

    _bindUI: function () {
      Y.one(window).on('resize', function () {
        this._setFullHeight();
      }, this);
    },

    _setFullHeight: function () {
      if (this.details) {
        this.detailscomm.setStyle('height', this.details.getComputedStyle('height'));
      }
      else {

      }
    }
  });

}, '1.0', {
  requires: [
    'base-build'
  ]
});


/*
 * WeddingWire Partnership
 */
Y.add('squarespace-weddings', function(Y) {

  Y.namespace('Squarespace.FrontSite').Weddings = Y.Base.create('Weddings', Y.Base, [], {

    initializer: function () {
      this.events = [];
      Y.Cookie.set('SS_weddingtemplates', "true", {path: '/', domain: 'squarespace.com', expires: new Date("January 12, 2025")});
      Y.Squarespace.FrontSite.Core.siteFilter.load();
      this.resizeEvent = window.orientation !== undefined ? 'orientationchange' : 'resize';

      this.ref = Y.Squarespace.FrontSite.Core.getURLQueryValue('source');
      if (this.ref) {
        this.ref = this.ref.toLowerCase();
      }

      this.hero = Y.one('.hero');
      this.hero.addClass('hero-calculated-height');
      this._bindUI();
      this._renderUI();
    },

    destructor: function () {
      for (var e = 0; e < this.events.length; e++) {
        this.events[e].detach();
      }

      Y.one('.header .weddingwirelogo') && Y.one('.header .weddingwirelogo').remove();
    },

    _bindUI: function () {
      this.events.push(Y.one(window).on(this.resizeEvent, function () {
        this._setHeroHeight();
      }, this));
      Y.one('window').simulate('resize');

      this.events.push(Y.on('superherocomplete', function (e) {
        if (Y.one('.hero .button')) {
          this.events.push(Y.one('.hero .button').on('click', function (e) {
            e.preventDefault();
            e.halt();

            this._tapToScroll('#examples', '1', '0', function () {
              document.location.hash = 'examples';
            });
          }, this));
        }
      }, this));


      Y.all('.designs-template').each(function (example) {
        Y.one(example).one('.designs-template-info').on('click', function (e) {
          var info = e._currentTarget,
              identifier = info.getAttribute('data-identifier'),
              baseTemplate = info.getAttribute('data-base-template'),
              customDomain = info.getAttribute('data-url');
              args = {'identifier': identifier, 'baseTemplate': baseTemplate, 'customDomain': customDomain};

          this._viewWeddingTemplates(args);
        }, this);
      }, this);
    },

    _renderUI: function () {
      var wrapper = this.hero.appendChild('<div class="hero-text-wrapper"></div>');
      this.hero.one('.hero-title') && wrapper.append(this.hero.one('.hero-title'));
      this.hero.one('.hero-tagline') && wrapper.append(this.hero.one('.hero-tagline'));
      this.hero.one('.hero-more-arrow') && wrapper.append(this.hero.one('.hero-more-arrow'));
      if (this.ref === 'weddingwire') {
        this.wwlogo = Y.one('.header').appendChild('<span class="weddingwirelogo is--transparent"><img data-load="false" data-hires="-2x" data-src="https://www.squarespace.com/assets/pages/mobile-apps/tour/marketing/wedding-wire-logo-dark.png" data-image-dimensions="206x22" /></span>');
        this.wwlogo.one('img').on('load', function () {
          this.wwlogo.removeClass('is--transparent');
        }, this);
      }
      this._setHeroHeight();
    },

    _setHeroHeight: function () {
      if (Y.one(window).get('winWidth') <= 600) {
        if (Y.one(window).get('winHeight') <= 599) {
          this.hero.setStyle('height', Y.one(window).get('winHeight') - 100);
        }
        else {
          this.hero.setStyle('height', Y.one(window).get('winHeight') - 230);
        }
      } else if (Y.one(window).get('winHeight') <= 900) {
        this.hero.setStyle('height', Y.one(window).get('winHeight') - 200);
      } else {
        this.hero.setStyle('height', (Y.one(window).get('winHeight') - 360)); //parseInt(Y.one('.navigation-horizontal').getComputedStyle('height'))) * .85 );
      }

      if (this.hero.one('.button')) {
        if (Y.one(window).get('winWidth') <= 1024 || window.innerHeight <= 750) {
          this.hero.one('.button').addClass('button--mini');
        } else if (Y.one(window).get('winWidth') <= 1200) {
          this.hero.one('.button').addClass('button--small');
        } else {
          this.hero.one('.button').removeClass('button--small').removeClass('button--mini');
        }
      }
    },


    /*
     * Learn more scroll animation on click
     */
    _tapToScroll : function(selector, speed, offset, callback){
      if (!selector || !Y.one(selector)) {
        return;
      }
      _offset = offset ? parseInt(offset) : 0;
      _speed = speed ? parseFloat(speed) : 0.3;

      var windowScroll = new Y.Anim({
        node: (Y.UA.gecko || Y.UA.ie >= 10) ? 'html' : 'body',
        to: {
          scroll: [0, Y.one(selector).get('region').top + _offset]
        },
        duration: _speed,
        easing: 'easeBoth'
      });

      if (typeof(callback) === 'function') {
        windowScroll.on('end', callback);
      }
      windowScroll.run();
    },


    /*
     * Customer example lightbox
     */
    _showProfile : function (args) {
      if(typeof args === 'object' && typeof args.identifier === 'string' && typeof args.baseTemplate === 'string') {
        args.ctaButton = (args.baseTemplate === "Developer") ? 'hide' : ''; // change 'view' to '' to make button "start with this template"

        SQUARESPACE_IS_AWESOME.siteFilter.showProfile({
          identifier: args.identifier,
          baseTemplate: args.baseTemplate,
          cta: args.ctaButton,
          customDomain: args.customDomain
        });
      }
    },

    _viewWeddingTemplates : function (args) {
      // console.log('/templates/?q=' + args.baseTemplate);
      Y.Squarespace.FrontSite.ActiveTemplateFilters = 'weddings';
      document.location = '/websites/templates/' + args.baseTemplate.toLowerCase();
      // Y.Squarespace.FrontSite.Core.router.save('/websites/templates/' + args.baseTemplate.toLowerCase());
    }
  });

}, '1.0', {
  requires: [
    'base-build',
    'node-event-simulate'
  ]
});


/*
 * Home sliders
 */
Y.add('squarespace-fullscreen-slider', function(Y) {

  Y.namespace('Squarespace.FrontSite').FullscreenSlider = Y.Base.create('FullscreenSlider', Y.Base, [], {

    initializer: function () {
      //Y.Squarespace.FrontSite.Core.tourLink(true);
      Y.Squarespace.FrontSite.Core.loginLink(true);
      this.navigationActions =Y.one('.navigation-actions');
      Y.one('.navigation--main').addClass('is--invisible');

      this.scrollInfo = {};
      this.scrollTimeout = null;
      this.events = [];
      this.cases = ['yield', 'greater-goods', 'apothecary'];


      if (!LandingSlider.initialized) {
        if (Y && !Y.one('.footer')) {
          var footer = '<div class="footer container container--fluid is--invisible"><a class="footer-link" href="/customers"><span class="footer-logo"><span class="icon"></span></span><span class="footer-logo--text">Powered by Squarespace</span></a><div class="footer-cta"><span class="footer-cta--copy">Free 14-day trial.<span class="footer-cta--card"> No credit card required.</span></span><a class="button button-square" href="templates/index.html">Get Started</a></div></div>';
          Y.one('.inject-point').insert(footer, 'after');
        }
        LandingSlider.init();
        JS.removeClass(JS.one('.layout'), 'no-transition');
        window.setTimeout(function() {
          JS.removeClass(LandingSlider.active.module.section.querySelector('.text-wrapper'), 'is--invisible');
          Y.one('.video-play-wrapper') && Y.one('.video-play-wrapper').removeClass('is--invisible');
        }, 500);
      }
      else {
        Y.one('.header') && Y.one('.header').removeClass('is--invisible');
        this.navigationActions && this.navigationActions.removeClass('is--invisible') && this.navigationActions.removeClass('no-transition');

      }

      if (LandingSlider.active.index === 0) {

        // if they already have an active case, choose that one (disables)
        // if (window.sessionStorage && sessionStorage['SQS_cci']) this.activeCase = this.cases[sessionStorage['SQS_cci']];

        // else {
          var activeCaseIndex = Math.floor(Math.random()*this.cases.length);
          this.activeCase = this.cases[activeCaseIndex];
          // if (window.sessionStorage) sessionStorage['SQS_cci'] = activeCaseIndex;
        // }
        Y.Squarespace.FrontSite.Core.trackEvent('frontsite_persona_load', {
          persona: this.activeCase
        });
        this.setActiveCase(this.activeCase);
      }

      window.navigatingWithinSection = null;

      this.layout = LandingSlider.layout;
      this.slider  = LandingSlider.slider;
      this.section  = LandingSlider.section;
      this.active  = LandingSlider.active;
      this.module = LandingSlider.active.module;
      this.pages = LandingSlider.pages;
      this.buttonConstant = Y.one('.button-constant');
      this.mobileNavTrigger = Y.one('.section-navigation-mobile-trigger');

      this.createArticle = Y.one('article.create')

      this.trackerWrapper = Y.one('.tracker-wrapper');
      if (this.trackerWrapper) {
        this.trackedChildren = this.trackerWrapper.get('children');
        this.starfield = Y.one('.starfield');
      }

      this.pulseWrapper = Y.one('.pulse-wrapper');

      this.events = [];
      if (EventsHandler) {
        this.vanillaJSevents = new EventsHandler();
      }

      this.completeUI();
      this.bindUI();
      this.windowResize();

      Y.later(600, null, function() {
        LandingSlider.active.module.completeUI();
      });

      // currency switcher only on certain pages
      switch (LandingSlider.active.index) {
        case 0:                               // /home/overview
        case 1:                               // /home/commerce
        case 2:                               // /home/coverpages
          this.currencySwitcher = new Y.Squarespace.FrontSite.CurrencySwitcher();
          this.currencySwitcher.setDefault();
          break;
      }
    },

    destructor: function () {


      //Y.one('.navigation--main') && Y.one('.navigation--main').addClass('is--invisible');
      //Y.one('.layout') && Y.one('.layout').addClass('is--invisible');
      Y.one('.footer') && Y.one('.footer').addClass('is--invisible');
      for (var e = 0; e < this.events.length; e++) {
        this.events[e].detach();
      }
      this.vanillaJSevents.detachEvents();
      this.module.destroy();
      LandingSlider.initialized = false;

      this.navigationActions.setStyles({
        'top': null,
        'pointer-events': null
      });
      this.navigationActions.removeClass('no-transition');
      //todo: improve to rely on DOM
      if (!window.navigatingWithinSection) {
        Y.one('.section-navigation-wrapper') && Y.one('.section-navigation-wrapper').remove();
        Y.one('body').setAttribute('data-page-type', null);
        Y.one('body').setAttribute('style', null);
        Y.one('body').removeClass('changing-slides');
        Y.one('.section-navigation-mobile-trigger').remove();
        Y.one('.inject-point + .footer') && Y.one('.inject-point + .footer').remove();
      }

      // overview page animations
      if (LandingSlider.active.index === 0) {
        var heroContentWrapper = Y.one('.hero-content-wrapper');
        heroContentWrapper.addClass('fade-out-ready');
        heroContentWrapper.addClass('is-fading-out');
        setTimeout(function(){
          Y.one('.hero-content-wrapper .is-fading-out')
            .removeClass('is-fading-out')
            .removeClass('fade-out-ready')
        }, 1000);
      }
    },

    bindUI: function () {
      this.events.push(Y.one('window').on(JS.resizeEvent, this.windowResize, this));

      Y.all('.section-navigation .nav-item').each(function(n) {
        this.events.push(
          n.on('click', function(e) {
            e.preventDefault();
            if (!e.currentTarget.ancestor('.active-nav') && !e.currentTarget.hasClass('active-nav')) {
              this.changeSlide(e);
            }
          }, this)
        );
      }, this);

      Y.all('.button-learn').each(function(n) {
        this.events.push(
          n.on('click', function(e) {
            e.preventDefault();
            this.changeSlide(e);
          }, this)
        );
      }, this);

      this.navigationActions.on('click', function() {
        if (Y.one('.is--pushed-left')) {
          Y.one('.navigation--main').removeClass('is--invisible')
        }
        else {
          Y.later(500, this, function() {
            Y.one('.navigation--main').addClass('is--invisible')
          })
        }
      })

      Y.all('section .learnmore').each(function(l) {
        this.events.push(
          l.on('click', function(e) {
            e.currentTarget.blur();
            if (this.active.element.getAttribute('data-type') === 'ParallaxScroll') {
              var node = null;
            }
            else {
              var node = this.active.element;
            }
            if (Y.UA.mobile) {
              var targetTop = Y.one('article').get('region').top;
            }
            else {
              var targetTop = Y.one('article .article-content').get('region').top;
            }
            this.animateScroll(0, targetTop, (window.innerHeight/1000), null, node);
          }, this)
        );
      }, this);

      Y.all('section .more-arrow').each(function(l) {
        this.events.push(
          l.on('click', function(e) {
            e.currentTarget.blur();
            if (this.active.element.getAttribute('data-type') === 'ParallaxScroll') {
              var node = null;
            }
            else {
              var node = this.active.element;
            }
            this.animateScroll(0, window.innerHeight, (window.innerHeight/1000), null, node);
          }, this)
        );
      }, this);

      Y.all('section').each(function(s) {
        !Y.one('.touch') && this.events.push(
          s.on('scroll', function(e) {
            var element = e.currentTarget._node;
            if (element.scrollTop > 0) {
              element.querySelector('.video-wrapper') && (element.querySelector('.video-wrapper').style.position = 'fixed');
              element.querySelector('.text-wrapper').style.transition = 'none';
              element.querySelector('.text-wrapper').style.opacity = Math.max(1.1 - (element.scrollTop) / window.innerHeight * 5, 0);
            }
            else {
              element.querySelector('.video-wrapper') && (element.querySelector('.video-wrapper').style.position = '');
              element.querySelector('.text-wrapper').style.transition = '';
              element.querySelector('.text-wrapper').style.top = '';
              element.querySelector('.text-wrapper').style.opacity = '';
            }
            if (element.scrollTop > window.innerHeight * 0.67) {
              if (this.module instanceof FullScreenVideo && this.module.video.videoPlayer._node.paused === false) {
                this.module.pauseLoop();
              }
            }
            else {
              if (this.module instanceof FullScreenVideo && this.module.video && this.module.video.videoPlayer._node.paused === true) {
                this.module.resumeLoop();
              }
            }
          }, this)
        );
      }, this);

      !Y.one('html.mobile') && this.events.push(
        Y.one('window').on('scroll', function() {
          this.navigationActions.addClass('no-transition');
          if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            this.navigationActions.setStyles({
              'top': '-100px',
              'pointer-events': 'none'
            });
            this.buttonConstant && this.buttonConstant.removeClass('is--transparent');
          }
          else {
            this.navigationActions.setStyles({
              'top': null,
              'pointer-events': null
            });
            this.buttonConstant && this.buttonConstant.addClass('is--transparent');
            Y.later(200, this, function() {
              this.navigationActions.removeClass('no-transition');
            })
          }
        }, this)
      );


      if (this.trackerWrapper && !Y.one('html.mobile')) {
        this.events.push(
          Y.one('section.active').on('mousemove', function(e) {
            this.trackedChildren.each(function(c, i) {
              var moved = this._mouseMove(e).x;
              var x = (moved * 0.5 * i) + '%';
              c.setStyle('left', x);
            }, this)
          }, this),

          this.starfield && Y.one('section.active').on('mousemove', function(e) {
            var moved = this._mouseMove(e);
            var x = 0 - (5 - (moved.x * 4)) + '%';
            this.starfield.setStyle('left', x);

            var y = 0 - (5 - (moved.y * 4)) + '%';
            this.starfield.setStyle('top', y);
          }, this)
        )
      };

      if (this.mobileNavTrigger) {
        this.events.push(
          this.mobileNavTrigger.on('click', function() {
            this.toggleNav();
          }, this),
          Y.one('.mobile-nav-close').on('click', function() {
            this.toggleNav('up');
          }, this)
        )
      };

      if (window.DeviceOrientationEvent && window.orientation !== undefined && this.trackerWrapper) {
        if (this._isIOS()) {
          this.vanillaJSevents.registerEvent(window, 'deviceorientation', this._moveWithOrientation, this);
        }
      }

      // Marketing event tracking
      this.events.push(Y.one('.customer-login').on('click', function(e) {
        Y.Squarespace.FrontSite.Core.trackEvent('frontsite_login_click');
      }, this));

      Y.all('.learnmore').each(function (l) {
        this.events.push(
          l.on('click', function (e) {
            Y.Squarespace.FrontSite.Core.trackEvent('frontsite_learn_more_click');
          })
        )
      }, this);

      Y.all('.button-square').each(function (b) {
        this.events.push(
          b.on('click', function (e) {
            this.trackEvent('frontsite_get_started_click', {
              'scrolledPercentage': ((this._winY() / (this.currentPage.active.element.clientHeight - window.innerHeight)).toFixed(3) * 100)
            });
          }, Y.Squarespace.FrontSite.Core)
        )
      }, this);

      Y.all('.section-navigation .nav-item').each(function (n) {
        this.events.push(
          n.on('click', function (e) {
            var navText = e.currentTarget.getAttribute('data-title');
            this.trackEvent('frontsite_landing_top_nav_click', {
              'navItem': navText
            });
          }, Y.Squarespace.FrontSite.Core)
        )
      }, this);

      // "Watch our latest campaign"
      Y.all('.campaign-cta a .link-event-trap').each(function (n) {
        var changeSlide = this.changeSlide;
        this.events.push(
          n.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            Y.one(e.currentTarget).ancestor().simulate('click');

          }, Y.Squarespace.FrontSite.Core)
        )
      }, this);
    },

    completeUI: function() {
      Y.all('img[data-load="false"]:not(.case-device)').each(function(img) {
        img.setAttribute('data-load', 'true');
        ImageLoader.load(img);
      });

      this.buildNav();
      if (LandingSlider.active.index === 0) {
        this.elements = {
          script:   JS.one('.text-wrapper svg'),
          nav:      JS.one('.section-navigation-wrapper'),
          button:   JS.one('.text-wrapper .button-square'),
          logo:     JS.one('header.header h1'),
          tagline:  JS.one('.text-wrapper .text-tagline'),
          menu:     JS.one('.navigation-actions'),
          herobg:   JS.one('.hero-content-wrapper'),
          campaignCopy: JS.one('.campaign-cta span span'),
          campaignButton: JS.one('.campaign-cta svg')
        };
        switch (this.activeCase) {
          case 'yield':
            JS.one('.hero-content-wrapper').style.backgroundColor ='#DCDDDE';
            this.changeColorScheme({
              script:  '#000000',
              tagline: '#000000',
              herobg:  'rgb(220, 221, 222)',
              campaignCopy: 'rgba(62, 62, 62, 1)',
              campaignButton: 'rgba(0, 0, 0, 1)',
              nav:     'dark',
              button:  'dark',
              logo:    'dark',
              menu:    'dark'
            });
            break;
          case 'greater-goods':
            JS.one('.hero-content-wrapper').style.backgroundColor ='#FFFFFF';
            this.changeColorScheme({
              script:  '#000000',
              tagline: '#000000',
              herobg:  'rgb(255, 255, 255)',
              campaignCopy: 'rgba(62, 62, 62, 1)',
              campaignButton: 'rgba(0, 0, 0, 1)',
              nav:     'dark',
              button:  'dark',
              logo:    'dark',
              menu:    'dark'
            });
            break;
            case 'apothecary':
              JS.one('.hero-content-wrapper').style.backgroundColor ='#0F0F0F';
              this.changeColorScheme({
                script:  'rgba(200, 200, 200, 1)',
                tagline: 'rgba(200, 200, 200, 1)',
                herobg:  'rgb(15,15,15)',
                campaignCopy: 'rgba(200, 200, 200, 1)',
                campaignButton: 'rgba(200, 200, 200, 1)',
                nav:     'light',
                button:  'light',
                logo:    'light',
                menu:    'light'
              });
              break;
          default:
            this.setUIColors();
            break;
        }
      }
      else this.setUIColors();

      Y.one('.section-navigation-mobile-trigger') && Y.one('.section-navigation-mobile-trigger').removeClass('is--hidden');
      Y.one('.grid-item') && this.setFloatedHeights(Y.all('.grid-item'));
      Y.all('.video-play').removeClass('is--invisible');
      Y.all('.learnmore').removeClass('is--invisible');

      if (this.pulseWrapper) {
        var c = this.pulseWrapper.get('children');
        for(var i = 0; i < c.size(); i++) {
          Y.later(i * 333, c.item(i), function() {
            this.addClass('do-pulse-scale');
          })
          this.pulseWrapper.removeClass('is--invisible');
        }
      }

      this.trackerWrapper && this.trackerWrapper.removeClass('is--transparent') && this._cachePoints();
      Y.later(750, this, function() {
        Y.one('.layout-content') && Y.one('.layout-content').setStyle('height', Y.one('section').get('region').height);
        Y.one('.footer') && Y.one('.footer').removeClass('is--invisible') && Y.one('.footer').removeClass('is--hidden');
        Y.one('body').removeClass('changing-slides');
      });
    },

    buildNav: function() {
      if (Y.one('.section-navigation-wrapper')) {
        if (LandingSlider.mobile) {
          this.toggleNav('up');
        }
        return;
      }
      var bullets = '';
      var rootPath = LandingSlider.rootPath;
      var navWrapper = "<div class='section-navigation-wrapper is--invisible'><ul class='section-navigation nav-list'></ul></div>";
      Y.one('header').insert(navWrapper, 'after');
      for (var p = 0; p < this.pages.length; p++) {
        bullets += '<li class="nav-item' + (p === this.active.index ? ' active-nav' : '') + '" data-index="' + p + '" data-title="' + this.pages[p].displayTitle + '"><a class="nav-link" href="' + rootPath + this.pages[p].subpath + '"><div class="nav-text-wrapper"><span class="nav-title">' + this.pages[p].displayTitle + '</span></div></a></li>';
      }
      bullets += '<li class="mobile-nav-close">close</li>';
      Y.one('.section-navigation').appendChild(bullets);
      Y.one('.section-navigation-wrapper').insert('<div class="section-navigation-mobile-trigger is--hidden">tour</div>', 'after');
      this.mobileNavTrigger = Y.one('.section-navigation-mobile-trigger');
      if (this.pages.length > 1) {
        this.toggleNav('up');
        Y.later(100, this, function() {
          Y.one('.section-navigation-wrapper').removeClass('is--invisible');
        });
      }
    },

    toggleNav: function(force) {
      if (!Y.one('.section-navigation-wrapper')) {
        return;
      }
      if (force) {
        if (force === 'up') {
          Y.one('.section-navigation-wrapper').addClass('pulled-up');
        }
        else {
          Y.one('.section-navigation-wrapper').removeClass('pulled-up');
        }
      }
      else {
        Y.one('.section-navigation-wrapper').toggleClass('pulled-up');
      }
    },

    windowResize: function() {
      LandingSlider.setSectionLayout();
      this.trackerWrapper && this._cachePoints();

      Y.one('.grid-item') && this.setFloatedHeights(Y.all('.grid-item'));

      if (window.innerWidth > 1024 && this.active.element.querySelector("[data-background]") && this.active.element.querySelector('[data-background]').getAttribute('data-loaded') !== 'true') {
        LandingSlider.loadBackground(this.active.element.querySelector('[data-background]'));
      }

      if (Y.one('.section-navigation-wrapper')) {
        if (window.innerWidth > 1024) {
          Y.one('.section-navigation-wrapper').removeClass('pulled-up');
          this.mobileNavTrigger.addClass('is--invisible');
          Y.one('.mobile-nav-close').addClass('is--hidden');
        }
        else {
          Y.one('.section-navigation-wrapper').addClass('pulled-up');
          this.mobileNavTrigger.removeClass('is--invisible');
          Y.one('.mobile-nav-close').removeClass('is--hidden');
        }
      }

      Y.later(1000, this, function() {
        this.createSectionGallery();
        LandingSlider.setSectionLayout();
      });
    },

    replaceWithGallery: function(galleryElement) {
      var gallery = galleryElement;
      galleryElement.ancestor('.article-device-wrapper').insert('<div class="gallery-buttons"></div>', 'after');
      var galleryButtons = this.createArticle.one('.gallery-buttons');
      var galleryContent = gallery.one('.slideshow-slides');
      var imgEl = "<img data-src=' data-image-dimensions=' data-image-focal-point='0.5,0.5' data-load='true' />";
      var imgWrapper = "<div class='content-fill'></div>";

      var dimensions = {};
      Y.all('.create .device:not(.iphone) .screen').each(function(s, i) {
        if (!s.hasClass('gallery')) {
          !dimensions.width && (dimensions.width = s._node.clientWidth);
          !dimensions.height && (dimensions.height = s._node.clientHeight);
          s.addClass('is--invisible');
          var _w = galleryContent.appendChild(imgWrapper);
          var _i = _w.appendChild(imgEl);
          _i.setAttribute('data-image-dimensions', dimensions.width + 'x' + dimensions.height);
          _i.setAttribute('data-src', s.getStyle('backgroundImage').replace('url(', '').replace(')',''));
          galleryButtons.append('<span class="gallery-slide-indicator' + (i === 0 ? ' current' : '') + '" data-index="' + i + '">&#x25cf;</span>');
        }
      });
      var temporaryGallery = this.module.setupGallery(galleryContent, false, 'fade', 4000, 0.5, true);
      gallery.addClass('ready');
      return temporaryGallery;
    },

    createSectionGallery: function() {
      if (this.createArticle && this.createArticle.one('.gallery')) {
        this.createArticleGalleryElement = this.createArticle.one('.gallery');
        var bodyTextArray = this.createArticle.all('.article-text-wrapper > div');

        if (window.innerWidth <= 1024) {
          bodyTextArray.removeClass('is--transparent');
          bodyTextArray.setStyle('minHeight', null);
          this.createArticle.setStyle('minHeight', null);
          this.createArticle.one('.article-text-wrapper').setStyle('minHeight', null);
          var minH = 0;
          bodyTextArray.each(function(d, i) {
            minH = d._node.clientHeight > minH ? d._node.clientHeight : minH;
            (i !== 0) && d.addClass('is--transparent');
          });
          bodyTextArray.setStyle('minHeight', minH * 1.2 + 'px');
          this.createArticle.one('.article-text-wrapper').setStyle('minHeight', minH * 1.2 + 'px');

          if (!this.createArticleGalleryElement.hasClass('ready')) {

            if (!this.createArticleGalleryObj) {
              this.createArticleGalleryObj = this.replaceWithGallery(this.createArticleGalleryElement);
              this.createArticleGalleryObj.set('name', 'create');

              Y.later(100, this.createArticleGalleryObj, function() {
                this.set('autoplay', false);
              });

              this.createArticleGalleryObj.after('currentIndexChange', function(e) {
                bodyTextArray.addClass('is--transparent');
                bodyTextArray.item(e.newVal).removeClass('is--transparent');
                this.createArticle.one('.gallery-slide-indicator.current').removeClass('current');
                this.createArticle.all('.gallery-slide-indicator').item(this.createArticleGalleryObj.get('currentIndex')).addClass('current');
              }, this);

              Y.Squarespace.FrontSite.Core._registerGestures(this.createArticle);

              this.createArticle.on('swipeLeft', function() {
                this.setAttrs({autoplay: false})
                this.previousSlide();
              }, this.createArticleGalleryObj);

              this.createArticle.on('swipeRight', function() {
                this.setAttrs({autoplay: false})
                this.nextSlide();
              }, this.createArticleGalleryObj);

              this.createArticle.all('.gallery-slide-indicator').each(function(b, i) {
                b.on('click', function(e) {
                  this.createArticleGalleryObj.set('currentIndex', parseInt(event.currentTarget.getAttribute('data-index')) % this.createArticleGalleryObj.get('numberOfSlides'), {direction: 1});
                }, this);

              }, this);
            }
          }
        }
        else {
          this.createArticleGalleryObj && this.createArticle.detachAll() && this.createArticleGalleryObj.destroy() && (this.createArticleGalleryObj = null);
          Y.one('.create .gallery .slideshow-slides').empty();
          this.createArticle.one('.gallery-buttons') && this.createArticle.one('.gallery-buttons').remove();
          this.createArticleGalleryElement.removeClass('ready');
          Y.all('.create .screen').removeClass('is--invisible');
          bodyTextArray.removeClass('is--transparent');
        }
      }
    },

    _cachePoints: function() {
      this._midpoint = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      };

      this._range = {
        x: window.innerWidth - this._midpoint.x,
        y: window.innerHeight - this._midpoint.y
      };
    },

    _mouseMove: function(e) {
      var x = e.x || e.pageX;
      var y = e.y || e.pageY;

      var nx = ((x - this._midpoint.x) / this._range.x).toFixed(3);
      var ny = ((y - this._midpoint.y) / this._range.y).toFixed(3);

      return {
        x: nx,
        y: ny
      }
    },

    /*
     * Check for IOS
     */
    _isIOS: function () {
      return (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
    },

    /*
     * Accelerometer event
     */
    _moveWithOrientation: function (e) {
      var angle = window.orientation;
      var landscape = angle === 90 || angle === -90;

      var horizontal = landscape ? e.beta : e.gamma;
      horizontal *= (angle === 180 || angle === -90) ? -1 : 1;

      var neutral = 60; // deg

      var vertical = (landscape ? e.gamma : e.beta) + (angle > 0 ? neutral : -neutral);
      vertical *= (angle <= 0) ? 1 : -1;

      // Max values
      var x = horizontal / 20;
      var y = vertical / 30;

      var h = (-7 - x).toFixed(4) + '%';
      this.starfield.setStyle('left', h);

      var v = (-7 - y).toFixed(4) + '%';
      this.starfield.setStyle('top', v);

      this.trackedChildren.each(function(c, i) {
        var h = (x * 1 * i) + '%';
        c.setStyle('left', h);
      }, this)
    },

    changeSlide: function(e) {
      if (Y.one('.changing-slides')) {
        return;
      }
      Y.one('body').addClass('changing-slides');

      Y.one('.navigation--main') && Y.one('.navigation--main').addClass('is--invisible');
      Y.one('.footer') && Y.one('.footer').addClass('is--invisible');


      Y.later(250, this, function() {
        if (e.currentTarget._node.nodeName === "A") {
          var link = a.currentTarget;
        }
        else {
          var link = e.currentTarget.one('a');
        }
        var path = link.get('href');
        if (Y.Squarespace.FrontSite.Core.router.hasRoute(path)) {
          e.preventDefault();
          window.navigatingWithinSection = true;
          Y.Squarespace.FrontSite.Core.changeUrl(Y.Squarespace.FrontSite.Core.router.removeRoot(path));
        }

        Y.one('.nav-item.active-nav') && Y.one('.nav-item.active-nav').removeClass('active-nav');
        e.currentTarget && e.currentTarget.addClass('active-nav');
        link.blur()
      });
    },

    setActive: function(arg) {
      // todo: redo based on dynamic loading

      /*this.active.index = parseInt(arg, 10);
      this.active.index.element = this.sections[this.active.index];
      var navitems = JS.all('.section-navigation .nav-item');
      for(var s = 0; s < this.sectionsTotal; s++) {
        JS.removeClass(this.sections[s], 'active');
        JS.removeClass(navitems[s], 'active-nav');
      }
      JS.addClass(this.sections[arg], 'active');
      JS.addClass(navitems[arg], 'active-nav');*/
    },

    setFloatedHeights: function(group) {
      var h = 0;
      group.each(function(g) {
        var gh = parseFloat(g.getComputedStyle('height'));
        h = h < gh ? gh : h;
      });
      group.setStyle('height', h + 'px');
    },

    setUIColors: function(_scheme) {
      // default scheme to finding from this.section's data-color,
      // functional paramter is an override
      var scheme;
      if (typeof _scheme === 'undefined') {
        if (this.section.getAttribute('data-color') === 'dark') scheme = "dark";
        else scheme = 'light';
      }
      else scheme = _scheme;

      switch (scheme) {
        case 'dark':
          //todo: automate switching text-wrapper and button
          setTimeout(function () {
            JS.one('.section-navigation-wrapper') && JS.removeClass(JS.one('.section-navigation-wrapper'), 'dark');
            JS.one('.section-navigation-wrapper') && JS.addClass(JS.one('.section-navigation-wrapper'), 'light');
            JS.addClass(JS.one('.header .logo'), 'logo--light');
            JS.addClass(JS.one('.navigation-actions'), 'navigation-actions--light');
          }.bind(this), 250);
          break;
        case 'grey':     // used for Yield case on homepage
        case 'white':    // used for Greater Goods case on homepage
        default:         // also 'light'
          setTimeout(function () {
            JS.one('.section-navigation-wrapper') && JS.addClass(JS.one('.section-navigation-wrapper'), 'dark');
            JS.one('.section-navigation-wrapper') && JS.removeClass(JS.one('.section-navigation-wrapper'), 'light');
            JS.removeClass(JS.one('.header .logo'), 'logo--light');
            JS.removeClass(JS.one('.navigation-actions'), 'navigation-actions--light');
          }.bind(this), 250);
          break;
        }
      },

    animateScroll: function(xPos, yPos, dur, cb, node){
      var newX = xPos || 0;
      var newY = yPos || 0;
      if (node) {
        var nodeEl = node;
      }
      else {
        var nodeEl = (Y.UA.gecko || Y.UA.ie >= 10) ? 'html' : 'body';
      }
      var windowScroll = new Y.Anim({
        node: nodeEl,
        to: {
          scroll: [newX, newY]
        },
        duration: dur || 0.3,
        easing: 'easeBoth'
      });

      windowScroll.run();
      windowScroll.once('end', function() {
        typeof(this.cb) === 'function' && this.cb();
      }, {'y': newY, 'x': newX, 'el': nodeEl, 'cb': cb})
    },

    setActiveCase: function(_case){
      // load the device image
      var image = Y.one('.case-device[data-case='+_case+']');
      image.addClass('is-loading');
      image.on('load', function(e){
        image.removeClass('is-loading').addClass('is-loaded');
      });
      ImageLoader.load(image.setAttribute('data-load', true));
    },

    changeColorScheme: function(colorScheme){
      this.elements.script.style.fill = colorScheme.script;
      this.elements.tagline.style.color = colorScheme.tagline;
      this.elements.campaignCopy.style.color = colorScheme.campaignCopy;
      this.elements.campaignButton.style.fill = colorScheme.campaignButton;

      JS.removeClass(this.elements.nav, 'dark');
      JS.removeClass(this.elements.nav, 'light');
      JS.addClass(this.elements.nav, colorScheme.nav);

      JS.removeClass(this.elements.button, 'button-square-dark');
      JS.removeClass(this.elements.button, 'button-square-light');
      JS.addClass(this.elements.button, colorScheme.button === 'dark'? 'button-square-dark' : 'button-square-light' );

      SQUARESPACE_IS_AWESOME.switchHeader(colorScheme.logo, false, true);
    }
  });

}, '1.0', {
  requires: [
    'base-build',
    'node-event-simulate',
  ]
});
