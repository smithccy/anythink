window.disableAnalytics = false;

if (document.location.pathname === '/search' || document.location.pathname === 'search/index.html') {
  document.location.pathname = 'index.html';
}

/*
 * Y.Squarespace.Marketing.trackLanding
 */
var oldReferrer = null;

/* Equivalent of Y.QueryString.parse */
var __sqsp_mktg = {};

__sqsp_mktg.trackLanding = function() {

  // only track once per session... if they have already been tracked in this session, bail
  if (window.sessionStorage && sessionStorage.getItem('sqsp_l') !== null){
    return;
  }

  // SUPER BOWL: DISABLE CENSUS AND ANALYTICS
  if (window.disableAnalytics === true) {
    return;
  }

  var location = document.location.toString();
  location = location.substring(location.indexOf('?')+1);
  var urlArray = location.split("&"),
      urlParams = {},
      param;
  for (var i = 0; i < urlArray.length; i++ ) {
    param = urlArray[i].split('=');
    urlParams[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
  }

  var validParams = ["source", "campaign", "subcampaign", "channel", "subchannel", "refer", "variation", "mkwid"];

  var data = {
    "landing" : document.location.href,
    "refer" : oldReferrer || document.referrer,
    "rk" : parseInt(Math.random() * 99999999, 10)
  };

  var path = document.location.pathname;
  if (path && path[path.length - 1] !== 'index.html') {
    data.landing = data.landing.replace(path, path + '/');
  }

  if (navigator.language) {
    data["lang"] = navigator.language.toLowerCase();
  } else if (navigator.browserLanguage) {
    data["lang"] = navigator.browserLanguage.toLowerCase();
  }

  if (self.screen) {
    data["screen"] = screen.width + "x" + screen.height;
  }

  for (var i = 0; i < validParams.length; ++i) {
    var p = validParams[i];
    if (p in urlParams) { data[p] = urlParams[p]; }
  }

  if (window.__templateVersion){
    data["templateVersion"] = window.__templateVersion;
  }

  /* Equivalent of JSON.stringify(data) */
  var dataStr = '';
  var pastFirst = false;
  for (var d in data) {
    dataStr += (pastFirst ? "&" : "" ) + encodeURIComponent(d) + "=" + encodeURIComponent(data[d]);
    pastFirst = true;
  }

  var image = new Image(1, 1);
  image.src = "/api/track/Track?" + dataStr;

  try {
    if (window.sessionStorage) sessionStorage.setItem('sqsp_l', true);
  }
  catch(e){
    console.error('Error writing to session storage');
  }
}

__sqsp_mktg.trackLanding();



/*
 * ...
 */
var Loader = (function () {
  var canvas,
      context,
      r,
      s = 0,
      l = 2,
      w = 1.6,
      inverted = false,
      spinning = false,
      requestFrame = window.requestAnimationFrame       ||
                     window.webkitRequestAnimationFrame ||
                     window.mozRequestAnimationFrame    ||
                     window.oRequestAnimationFrame      ||
                     window.msRequestAnimationFrame     ||
                     function(callback) {
                       window.setTimeout(callback, 1000 / 60);
                     };

  function update() {
    s += .11;
    s = s > 2 ? 0 : s;
    s *= .965;
  }

  function draw() {
    context.beginPath();
    context.arc(r + l / 2, r + l / 2, r, 0, 2 * Math.PI, false);
    context.strokeStyle = inverted ? '#dadada' : '#333';
    context.stroke();
    context.closePath();

    context.beginPath();
    context.arc(r + l / 2, r + l / 2, r, s * Math.PI, (s + w) * Math.PI, true);
    context.strokeStyle = inverted ? '#222' : '#fff';
    context.stroke();
    context.closePath();
  }


  function loop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    update();
    draw();
    spinning && requestFrame(loop);
  }

  return {
    init: function (w) {
      canvas = document.createElement('canvas');

      if (canvas && canvas.getContext) {
        canvas.className = 'loader';
        canvas.width = w;
        canvas.height = w;

        context = canvas.getContext('2d');
        context.lineWidth = l;

        r = w / 2 - l / 2;
      }
    },

    play: function (el, i) {
      if (canvas && el && !spinning) {
        inverted = i;
        el.appendChild(canvas);
        spinning = true;
        loop();
      }
    },

    stop: function () {
      if (canvas && spinning) {
        spinning = false;
        s = 0;
        canvas.parentNode && canvas.parentNode.removeChild(canvas);
      }
    }
  }
}());

SQUARESPACE_LANG = {
	TEMPLATE_CALL_TO_ACTION: 'Start with this design'
};

// SUPER BOWL: DISABLE CENSUS AND ANALYTICS
if (window.disableAnalytics === true) {
  try {
    if (Y.Squarespace && Y.Squarespace.Census) {
      Y.Squarespace.Census.track = function() {};
      Y.Squarespace.Analytics.trackInternal = function() {};
    } else {
      Y.use('squarespace-census', function(Y) {
        Y.Squarespace.Census.track = function() {};
        Y.Squarespace.Analytics.trackInternal = function() {};
      });
    }
  } catch (e) {
    // disabled
  }
}


Y.use('node', 'router', 'event-simulate',
      'squarespace-login', 'squarespace-lazy', 'squarespace-retina', 'squarespace-sitefilter', 'squarespace-responsive-slider', 'squarespace-slideshow-header', 'squarespace-slide-rendering-ie-svg-loader', 'squarespace-responsive-font-size',
      'squarespace-fullscreen-slider', 'squarespace-details', 'squarespace-betterweb', 'squarespace-detailscommercial', 'squarespace-stories', 'squarespace-about-team', 'squarespace-about-legacy', 'squarespace-templates', 'squarespace-pricing', 'squarespace-mobile-apps', 'squarespace-customers', 'squarespace-students', 'squarespace-careers', 'squarespace-custom-map', 'squarespace-mobile-apps-new', 'squarespace-logomark', 'squarespace-login-page', 'squarespace-weddings',
      'squarespace-gallery-ng', 'squarespace-signup', 'squarespace-product-selector',
      function (Y) {

  /*
   * Custom Events
   */
  Y.Event.define('keyframeAnimationEnd', {
    on: function (node, subscription, notifier) {
          var n = node._node;
              evt = ['webkitAnimationEnd', 'animationend', 'onanimationend', 'MSAnimationEnd', 'oAnimationEnd'];

          n._notifier = notifier;

          for (var i = 0; i < evt.length; i++) {
            n.addEventListener(evt[i], function (e) {
              // Improve -- bind Node and avoid passind 2nd parrameter
              this._notifier.fire(e, this._notifier.handle.sub.node);
            });
          }
        }
  });

  Y.Event.define('transitionEnd', {
    on: function (node, subscription, notifier) {
          var n = node._node;
              evt = ['webkitTransitionEnd', 'transitionend', 'ontransitionend', 'MSTransitionEnd', 'oTransitionEnd'];

          n._notifier = notifier;

          for (var i = 0; i < evt.length; i++) {
            n.addEventListener(evt[i], function (e) {
              // Improve -- bind Node and avoid passind 2nd parrameter
              this._notifier.fire(e, this._notifier.handle.sub.node);
            });
          }
        }
  });

  function createDefaultLandingDescription (partner) {
    return 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                 'website, blog, portfolio or online store. We\'ve teamed up with ' + partner + ' to bring you a ' +
                 'special offer - try Squarespace free for 14 days and receive 10% off your first purchase.';
  }

  /**
   * Tracking bindings
   */
  Y.Global.on('queuedSignup', function(e) {
    if (!window._gaq) {
      console.warn('Could not find _gaq!');
      return;
    }

    var evt = ['_trackEvent', 'signup', 'new_trial', 'template', e.data.cloneIdentifier];

    window._gaq.push(evt);
    console.log('Firing ga event', evt);
  });

  // deprecated, but may be used elsewhere
  var MARKETING_LANDINGS = {};


  Y.use('squarespace-utils-yui');

  Y.namespace('Squarespace.FrontSite').Core = SQUARESPACE_IS_AWESOME = Singleton.create({

    ready: function() {
      Y.on('domready', this.domReady, this);
    },

    /*
     * Init
     */
    domReady: function (force) {

     if (force === true) {
        window.DomReadyForced = true;
      }

      console.log('domReady()');

      // try {
      //    SQUARESPACE_IS_AWESOME.cookieBanner.init();
      // }
      // catch(e) {
      //   console.error('Issue initializing cookie banner');
      // }

      if (YUI.Env.windowLoaded === true && window.DomReadyForced === true) {
        console.log('Skipping domReady()')
        return;
      }

      if(Y.UA.ios === 7) {
        Y.one('html').addClass('ios-7');
      }

      /*
      * ?mode=template-install
      */
      if (this.getURLQueryValue('mode') == 'template-install') {
        if (window.top != window) {
          Y.Squarespace.FrontSite.templateInstall = true;
          Y.use('squarespace-template-install', function(Y) {
            var provider = Y.Squarespace.TemplateInstallRPC.createProvider({
              configureFn: function(opts) {
                SQUARESPACE_LANG = Y.merge(SQUARESPACE_LANG, opts.lang);
              }
            });

            Y.Squarespace.Signup.show = provider.installTemplate;
          });

          var designTitlesNode = Y.one('.designs-body .designs-title');
          if (designTitlesNode) {
            designTitlesNode.setContent('Select a template');
          } else {
            console.warn('Could not find the element .designs-title to change copy.');
          }

          Y.one('body').addClass('mode-template-install');
        } else {
          console.error('?mode=template-install not available in this configuration.');
        }
      }

      // Prepare spinner
      Loader.init(16);

      // SQS Logo
      // Y.Squarespace.FrontSite.IESVGLoader.parse();
      Y.one('svg') && Y.all('svg').setStyle('display', null);
      Y.one('.sqslogo') && Y.one('.sqslogo').addClass('sqslogo--visible');

      // DEV mode
      if (this.getURLQueryValue('dev')) {
        console.log('###--- DEV MODE ---###');
        Y.one(document).on('keydown', this._keyEvents, this);
        var devCSS = Y.Node.create('<style type="text/css">.login-wrapper, .sqsp-chrome { display: none; }</style>');
        Y.one('head').append(devCSS);
      }

      if (!Y.Router.html5) {
        window.location.hash = window.location.pathname;
      }

      if (!Y.UA.ios && Y.UA.safari) {
        Y.one('html').addClass('safari');
        var v = navigator.appVersion.toString();
        var vx = parseFloat(v.substring(v.indexOf('Version/index.html') + 8, v.indexOf('Safari')));
        Y.one('html').addClass('safari' + vx);
      } else if (Y.UA.ios) {
        Y.one('html').addClass('ios');
        Y.one('html').addClass('not-safari');
      } else if (Y.UA.ie) {
        Y.one('html').addClass('ie-'+Y.UA.ie);
        Y.one('html').addClass('not-safari');
      } else if (Y.UA.gecko) {
        Y.one('html').addClass('firefox');
        Y.one('html').addClass('not-safari');

      // Microsoft Edge browser
      } else if (navigator.userAgent.match(/\bEdge\/\b/)) {
        Y.one('html').addClass('ms-edge');
        Y.one('html').addClass('not-safari');
      } else {
        Y.one('html').addClass('not-safari');
      }

      this.router = new Y.Router();
      this.lazyLoader = new Y.Squarespace.FrontSite.Lazy();
      this.retinaLoader = new Y.Squarespace.FrontSite.Retina();
      this.currentPage = '';
      this.currentUrl = '';
      this.body = Y.one('body');
      this.header = Y.one('.header');
      this.logo = Y.one('.logo');
      this.moreArrow = Y.one('.hero-more-arrow');
      this.pageViews = 0;
      this.productSelector = new Y.Squarespace.FrontSite.ProductSelector();

      this.mainNav = Y.one('.navigation--main');
      this.navGetStarted = Y.one('.getstarted');
      this.mainNavNY = Y.one('.navigation--main .made-in-ny');

      this.navigationActions = Y.one('.navigation-actions');
      this.injectPoint = Y.one('.inject-point');
      this.navigationTrigger = Y.one('.navigation-trigger');
      this.navigationClose = Y.one('.navigation-close');

      if (this.navigationActions) {
        this.customerLogin = this.navigationActions.one('.customer-login');
        this.navTour = this.navigationActions.one('.navigation-tour');
        this.designsBack = this.navigationActions.one('.designs-details-back');
        this.secondaryGetStarted = this.navigationActions.one('.button');
      }

      this.sidebarNav = Y.one('.sidebar-navigation');
      this.currentY = 0;

      if (this.getURLQueryValue('signup')) {
        var overlay = Y.one('.signup-fake-overlay');

        // Used to be Y.Squarespace.Utils.advancedBrowserCheck(), inlined here
        if (! ( !Y.UA.ie || Y.UA.ie >= 9 ) ) {
          overlay && overlay.remove();
        } else {
          this.fixedLayout(true);
          Y.Squarespace.Signup.show({
            cloneIdentifier: this.getURLQueryValue('signup') + '-demo'
          });

          Y.Squarespace.Signup.signupDialog.on('dismiss', function() {
            overlay && overlay.remove();

            Y.later(500, this, function () {
              this.fixedLayout(false);
            });
          }, this);
        }
      }

      this.designsPageViews = 0;
      this.headerHeight = 132 + (Y.one('.hero') ? 105 : 0);
      this.siteFilter = new Y.Squarespace.FrontSite.SiteFilter();

      this.navigationTrigger && this._bindEvents();
      this._createRoutes();
      //this.siteFilter.load();

      if (force) {
        YUI.Env.windowLoaded = true;
        this.router.fire('ready');
        this.router.dispatch();
      } else {
        Y.on('domready', function () {
          this.router.dispatch();
        }, this);
      }
    },


    /*
     * Use Modernizr and also detect support for Webm with VP9 support
     * TODO: extend this to determine alpha channel support (is it possible?)
     */
    _supportsVP9Video: function () {
      if (Modernizr && Modernizr.video) {
        var v = document.createElement('video');
        return v.canPlayType('video/webm; codecs="vp9"');
      }
    },

    /*
     * Window scroll Top
     */
    _winY: function () {
      return Y.Squarespace.FrontSiteUtils.winY();
    },


    /*
     * Show/hide login link
     */
    loginLink: function (mode) {
      if (mode) {
        this.customerLogin && this.customerLogin.removeClass('is--hidden');
      } else {
        this.customerLogin && this.customerLogin.addClass('is--hidden');
      }
    },


    /*
     * Show/hide tour link
     */
    tourLink: function (mode) {
      if (mode) {
        this.navTour && this.navTour.removeClass('is--hidden');
      } else {
        this.navTour && this.navTour.addClass('is--hidden');
      }
    },


    /*
     * Show/hide designs back link
     */
    designsBackLink: function (mode) {
      if (mode) {
        this.designsBack && this.designsBack.removeClass('is--hidden');
      } else {
        this.designsBack && this.designsBack.addClass('is--hidden');
      }
    },


    /*
     * All events grouped by pagetype
     */
    marketingEvents: function (mode) {
      // Everywhere
      if (mode === 'hits') {
        // SB Tracking
        Y.Squarespace.Analytics.trackInternal('frontsite_view');

        if (this.pageViews > 1) {
          // SB Tracking
          __sqsp_mktg.trackLanding();
        }
      // Homepage
      } else if (mode === 'home') {
        if (this.getURLQueryValue('source', 'american')) {
          var popup = new Y.Squarespace.OfferPopup({
            code: "AMERICAN",
            description: {
              header: "Welcome to Squarespace",
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional website, blog, or portfolio. We\'ve teamed up with <strong>This American Life</strong> to bring you a special offer - try us free for 14 days and receive 10% off your first purchase.'
            }
          });

          popup.render();
        } else if (this.getURLQueryValue('source', 'freakonomics')) {
          var popup = new Y.Squarespace.OfferPopup({
            code: 'FREAK',
            description: {
              header: "Welcome to Squarespace",
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional website, blog, or portfolio. We\'ve teamed up with <strong>Freakonomics Radio</strong> to bring you a special offer - try us free for 14 days and receive 10% off your first purchase.'
            }
          });

          popup.get('boundingBox').addClass('freakonomics');
          popup.render();

        } else if (this.getURLQueryValue('subchannel', 'mike')) {
          var popup = new Y.Squarespace.OfferPopup({
            code: 'MIKE',
            description: {
              header: "Welcome to Squarespace",
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional website, blog, or portfolio. We\'ve teamed up with <strong>Mike and Mike</strong> to bring you a special offer - try us free for 14 days and receive 10% off your first purchase.'
            }
          });

          popup.get('boundingBox').addClass('mike');
          popup.render();
        } else if (this.getURLQueryValue('source', 'froknowsphoto')) {
          var popup = new Y.Squarespace.OfferPopup({
            code: 'FRO',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Creating a beautiful photography portfolio has never been easier. <strong>Jared Polin</strong> trusts us for his photography portfolio and has asked us to provide his viewers with a special offer. Get started for free and receive 10% off your first purchase by using the code below at checkout.'
            }
          });

          popup.get('boundingBox').addClass('froknowsphoto');
          popup.render();
        } else if (this.getURLQueryValue('source', 'bullseye')) {
          var popup = new Y.Squarespace.OfferPopup({
            code: 'BULLSEYE',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional website, blog, or portfolio. We\'ve teamed up with <strong>Bullseye</strong> to bring you a special offer - try us free for 14 days and receive 10% off your first purchase.'
            }
          });

          popup.get('boundingBox').addClass('bullseye');
          popup.render();
        } else if (this.getURLQueryValue('source', 'radiolab')) {
          var popup = new Y.Squarespace.OfferPopup({
            code: 'RADIOLAB',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional website, blog, or portfolio. We\'ve teamed up with <strong>Radiolab</strong> to bring you a special offer - try us free for 14 days and receive 10% off your first purchase.'
            }
          });

          popup.get('boundingBox').addClass('radiolab');
          popup.render();

        } else if (this.getURLQueryValue('source', 'animoto')) {
          var animotoPopup = new Y.Squarespace.OfferPopup({
            code: 'ANIMOTO',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Creating a beautiful website has never been easier. With our new integration with Animoto, ' +
                'photographers and businesses can easily showcase their Animoto videos on their sites. Get started ' +
                'for free and receive 10% off your first purchase by using the code below at checkout.'
            }
          });

          animotoPopup.get('boundingBox').addClass('animoto');
          animotoPopup.render();
        } else if (this.getURLQueryValue('source', 'karltaylor')) {
          var karlPopup = new Y.Squarespace.OfferPopup({
            code: 'KARL',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Creating a beautiful photography portfolio has never been easier. Karl trusts us for his ' +
                    'photography portfolio and has asked us to provide his viewers with a special offer. Get started ' +
                    'for free and recieve 10% off your first purchase by using the code below at checkout.'
            }
          });
          karlPopup.get('boundingBox').addClass('karl');
          karlPopup.render();
        } else if (this.getURLQueryValue('source', 'photoserge')) {
          var sergePopup = new Y.Squarespace.OfferPopup({
            code: 'PHOTOSERGE',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Creating a beautiful photography portfolio has never been easier. Serge trusts us for his ' +
                    'photography portfolio and has asked us to provide his viewers with a special offer. Get started ' +
                    'for free and receive 10% off your first purchase by using the code below at checkout.'
            }
          });
          sergePopup.get('boundingBox').addClass('serge');
          sergePopup.render();
        } else if (this.getURLQueryValue('source', 'mkbhd')) {
          var mkbhdPopup = new Y.Squarespace.OfferPopup({
            code: 'MKBHD',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Creating a beautiful and functional website has never been easier. Marques trusts us for his ' +
                    'personal website and has asked us to provide his viewers with a special offer. Get started for ' +
                    'free and receive 10% off your first purchase by using the code below at checkout.'
            }
          });

          mkbhdPopup.get('boundingBox').addClass('mkbhd');
          mkbhdPopup.render();

        } else if (this.getURLQueryValue('source', 'cgpgrey')) {
          var greyPop = new Y.Squarespace.OfferPopup({
            code: 'GREY',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Creating a beautiful and functional website has never been easier. Grey trusts us for his personal ' +
                    'website and has asked us to provide his viewers with a special offer. Get started for free and ' +
                    'receive 10% off your first purchase by using the code below at checkout.'
            }
          });

          greyPop.get('boundingBox').addClass('grey');
          greyPop.render();

        } else if (this.getURLQueryValue('source', 'phildefranco')) {
          var philPopup = new Y.Squarespace.OfferPopup({
            code: 'PHIL',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Creating a beautiful and functional website has never been easier. Phil trusts us for his personal ' +
                    'website and has asked us to provide his viewers with a special offer. Get started for free and ' +
                    'receive 10% off your first purchase by using the code below at checkout.'
            }
          });

          philPopup.get('boundingBox').addClass('phil');
          philPopup.render();

        } else if (this.getURLQueryValue('source', 'shaycarl')) {
          var shayPopup = new Y.Squarespace.OfferPopup({
            code: 'SHAY',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Creating a beautiful and functional website has never been easier. Get started for free and ' +
                    'receive 10% off your first purchase by using the code below at checkout.'
            }
          });

          shayPopup.get('boundingBox').addClass('shay');
          shayPopup.render();

        } else if (this.getURLQueryValue('source', 'fenchel')) {
          var fenchelPopup = new Y.Squarespace.OfferPopup({
            code: 'FENCHEL',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Creating a beautiful photography portfolio has never been easier. Fenchel & Janisch trust us ' +
                    'for their video portfolio and have asked us to provide their viewers with a special offer. ' +
                    'Get started for free and receive 10% off your first purchase by using the code below at checkout.'
            }
          });

          fenchelPopup.get('boundingBox').addClass('fenchel');
          fenchelPopup.render();

        } else if (this.getURLQueryValue('source', 'cobus')) {
          var cobusPopup = new Y.Squarespace.OfferPopup({
            code: 'COBUS',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Creating a beautiful and functional website has never been easier. Cobus trusts us for his ' +
                    'personal website and has asked us to provide his viewers with a special offer. Get started for ' +
                    'free and receive 10% off your first purchase by using the code below at checkout.'
            }
          });

          cobusPopup.get('boundingBox').addClass('cobus');
          cobusPopup.render();

        } else if (this.getURLQueryValue('source', 'istock')) {
          var iStockPopup = new Y.Squarespace.OfferPopup({
            code: 'ISTOCK',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your business or gallery to life online with Squarespace, the easiest way to create an ' +
                    'exceptional website, portfolio or online store. We\'ve teamed up with iStock to give you a ' +
                    'special offer - try us free for 14 days and receive 20% off your first purchase.'
            },
            customPct: 20
          });

          var bb = iStockPopup.get('boundingBox');
          bb.addClass('istock')
          iStockPopup.render();

        } else if (this.getURLQueryValue('source', 'kiip')) {

          var kiipPopup = new Y.Squarespace.OfferPopup({
            code: 'KIIP',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog or portfolio. We\'ve teamed up with Kiip to bring you a special offer - ' +
                    'try Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = kiipPopup.get('boundingBox');
          bb.addClass('kiip');
          kiipPopup.render();
        } else if (this.getURLQueryValue('source', 'npr')) {

          var nprPopup = new Y.Squarespace.OfferPopup({
            code: 'NPR',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog or portfolio. We\'ve teamed up with NPR to bring you a special offer - ' +
                    'try Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = nprPopup.get('boundingBox');
          bb.addClass('npr');
          nprPopup.render();

        } else if (this.getURLQueryValue('source', 'tytnetwork')) {

          var tytPopup = new Y.Squarespace.OfferPopup({
            code: 'TYT',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog or portfolio. We\'ve teamed up with TYT to bring you a special offer - ' +
                    'try Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = tytPopup.get('boundingBox');
          bb.addClass('tyt');
          tytPopup.render();
        } else if (this.getURLQueryValue('source', 'photoweek')) {

          var clPopup = new Y.Squarespace.OfferPopup({
            code: 'CREATIVELIVE',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog or portfolio. We\'ve teamed up with CreativeLive to bring you a special offer - ' +
                    'try Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = clPopup.get('boundingBox');
          bb.addClass('creativelive');
          clPopup.render();
        } else if (this.getURLQueryValue('source', 'goodmythicalmorning')) {

          var gmmPopup = new Y.Squarespace.OfferPopup({
            code: 'GMM',
            description: {
              header: 'Welcome to Squarespace',
              body: "Try Squarespace free for 14 days and receive 10% off your first purchase! Create your own weird " +
                "website for a chance to win a limited edition t-shirt and be featured on GMM. Make sure to submit " +
                "your site back at TheInternetIsAWeirdPlace.com after you've finished making it!"
            }
          });

          var bb = gmmPopup.get('boundingBox');
          bb.addClass('gmm');
          gmmPopup.render();

        } else if (this.getURLQueryValue('source', 'adamlerner')) {

          var adamPopup = new Y.Squarespace.OfferPopup({
            code: 'ADAM',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog or portolfio. We\'ve teamed up with Adam Lerner to bring you a special offer - ' +
                    'try Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = adamPopup.get('boundingBox');
          bb.addClass('adamlerner');
          adamPopup.render();

        } else if (this.getURLQueryValue('source', 'thedefineschool')) {

          var definePopup = new Y.Squarespace.OfferPopup({
            code: 'DEFINE',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog or portfolio. We\'ve teamed up with The Define School to bring you a special offer - ' +
                    'try Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = definePopup.get('boundingBox');
          bb.addClass('define');
          definePopup.render();

        } else if (this.getURLQueryValue('source', 'russellbrand')) {

          var giltPopup = new Y.Squarespace.OfferPopup({
            code: 'BRAND',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Easily create an exceptional website, blog or portfolio with Squarespace. We\'ve teamed up with ' +
                    'Russell Brand to bring you a special offer - try Squarespace free for 14 days and receive 10% off ' +
                    'your first purchase.'
            },
            textLogo: 'russell brand'
          });
          var bb = giltPopup.get('boundingBox');
          bb.addClass('brand');

          giltPopup.render();

        } else if (this.getURLQueryValue('subchannel', 'giltcity')) {

          var giltPopup = new Y.Squarespace.OfferPopup({
            code: 'GILTCITY',
            noPct: true,
            description: {
              header: 'Welcome to Squarespace',
              body: 'Easily create an exceptional website, blog or portfolio with Squarespace. We\'ve teamed up with ' +
                    'Gilt City to bring you a special offer - try Squarespace free for 14 days and receive 2 ' +
                    'months worth of free service when you sign up for any annual plan.'
            },
            textLogo: 'gilt city'
          });
          var bb = giltPopup.get('boundingBox');
          bb.addClass('gilt');

          giltPopup.render();

        } else if (this.getURLQueryValue('source', 'camerarectoby')) {

          var cameraRecPopup = new Y.Squarespace.OfferPopup({
            code: 'TOBY',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog or portfolio. We\'ve teamed up with Toby to bring you a special offer - try ' +
                    'Squarespace free for 14 days and receive 10% off your first purchase.'
              }
          });

          var bb = cameraRecPopup.get('boundingBox');
          bb.addClass('toby');

          cameraRecPopup.render();

        } else if (this.getURLQueryValue('source', 'sporkful')) {

          var sporkPopup = new Y.Squarespace.OfferPopup({
            code: 'sporkful',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog or portfolio. We\'ve teamed up with Sporkful to bring you a special offer - try ' +
                    'Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = sporkPopup.get('boundingBox');
          bb.addClass('spork');

          sporkPopup.render();

        } else if (this.getURLQueryValue('source', 'newtechcity')) {

          var newTechPopup = new Y.Squarespace.OfferPopup({
            code: 'ntc',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog or portfolio. We\'ve teamed up with New Tech City to bring you a special offer - ' +
                    'try Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = newTechPopup.get('boundingBox');
          bb.addClass('ntc');

          newTechPopup.render();
        } else if (this.getURLQueryValue('source', 'serial')) {

          var serialPopup = new Y.Squarespace.OfferPopup({
            code: 'SERIAL',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog, portfolio or online store. We\'ve teamed up with Serial to bring you a special ' +
                    'offer - try Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = serialPopup.get('boundingBox');
          bb.addClass('serial');
          serialPopup.render();
        } else if (this.getURLQueryValue('source', 'heresthething')) {

          var baldwinPopup = new Y.Squarespace.OfferPopup({
            code: 'THING',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog, or portfolio. We\'ve teamed up with Alec Baldwin to bring you a special offer - ' +
                    'try Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = baldwinPopup.get('boundingBox');
          bb.addClass('thing');

          baldwinPopup.render();

        } else if (this.getURLQueryValue('source', 'sundance')) {

          var sunPopup = new Y.Squarespace.OfferPopup({
            code: 'SUNDANCE10',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your stories to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog, portfolio or online store. We\'ve teamed up with the Sundance Institute to bring ' +
                    'you a special offer - try Squarespace free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = sunPopup.get('boundingBox');
          bb.addClass('sundance');

          sunPopup.render();

        } else if (this.getURLQueryValue('subchannel', 'producthunt')) {

          var phPopup = new Y.Squarespace.OfferPopup({
            code: 'HUNT10',
            description: {
              header: 'Welcome to Squarespace',
              body: 'Bring your ideas to life online with Squarespace, the easiest way to create an exceptional ' +
                    'website, blog or online store. We\'ve teamed up with Product Hunt to bring you a special offer ' +
                    '- try us free for 14 days and receive 10% off your first purchase.'
            }
          });

          var bb = phPopup.get('boundingBox');
          bb.addClass('producthunt');

          phPopup.render();

        } else if (this.getURLQueryValue('schoolname')) {
          var schoolName = this.getURLQueryValue('schoolname');
          if (schoolName) {
            var popup = new Y.Squarespace.EduOfferPopup({
              header: schoolName + " Discount",
              body: 'As part of a special relationship with ' + schoolName + ', we are pleased to offer you <strong>50% off</strong> your first year of Squarespace service.',
              footer: "You must sign up with your school email to qualify for this discount."
            });
            popup.render();
          }
        } else {

          // Render a marketing landing if the 'source' query parameter matches something in the configuration.
          var source = this.getURLQueryValue('source');
          var foundBySource = Y.Lang.isValue(source);
          if (!foundBySource) {
            source = this.getURLQueryValue('subcampaign');
            if (!source) {
              source = this.getURLQueryValue('subchannel');
            }
          }

          if (Y.Lang.isValue(source))  {
            var landingPage = MARKETING_LANDINGS[source];
            if (!Y.Lang.isValue(landingPage)) {
              var subcamp = this.getURLQueryValue('subcampaign');
              if (Y.Lang.isValue(subcamp)) {
                var subcampLanding = MARKETING_LANDINGS[subcamp];
                if (Y.Lang.isValue(subcampLanding)) {
                  source = subcamp;
                  landingPage = subcampLanding;
                } else {
                  // TODO: fix this duplication with the below subchannel search.
                  var subchan = this.getURLQueryValue('subchannel');
                  if (Y.Lang.isValue(subchan)) {
                    source = subchan;
                    landingPage = MARKETING_LANDINGS[subchan];
                  }
                }
              } else {
                var subchan = this.getURLQueryValue('subchannel');
                if (Y.Lang.isValue(subchan)) {
                  source = subchan;
                  landingPage = MARKETING_LANDINGS[subchan];
                }
              }
            } else if (foundBySource) {
              // If the ?source param exists and matches, a landing, but so does the subcampaign,
              // take the subcampaign landing instead.
              //
              // This is for scenarios where the only disambiguating factor in a landing URL is its subcampaign. (ugh)
              var subcamp = this.getURLQueryValue('subcampaign');
              if (Y.Lang.isValue(subcamp)) {
                var subLanding = MARKETING_LANDINGS[subcamp];
                if (Y.Lang.isValue(subLanding)) {
                  source = subcamp;
                  landingPage = subLanding;
                }
              }
            }

            if (Y.Lang.isValue(landingPage)) {

              var genericPopup = new Y.Squarespace.OfferPopup({
                code: landingPage.code,
                description: {
                  header: landingPage.header || 'Welcome to Squarespace',
                  subHeader: landingPage.descriptionHeader,
                  body: landingPage.description
                }
              });


              genericPopup.get('boundingBox')
                .addClass(source)
                .addClass('with-banner');

              genericPopup.render();
              genericPopup._snowBox.get('boundingBox').addClass(source);
            }
          }
        }

        //Y.Squarespace.Marketing.doubleClickEvent('homepage');
      } else if (mode === 'video') {
        //Y.Squarespace.Analytics.trackInternal("frontsite_landing_video_view", { 'pagePath': window.location.pathname });
      }
    },


    /*
     * TEST Split signup
        TODO: improve
     */
    splitSignup: function () {
      Y.one('body').prepend('<div class="signup-wrapper"><div class="trigger-close">close</div></div>');
      if (!this.splitSignupContent) {
        Y.Data.get({
          url: '/test-signup', //this.router.getPath(),
          responseFormat: 'raw',
          failure: Y.bind(function (data) {
            this.changeUrl('moved/index.html');
          }, this),
          success: Y.bind(function (data) {
            var dom = Y.DOM.create(data);
            this.splitSignupContent = Y.Selector.query('.signup-overlay', dom, true);
            _appendSplit(this.splitSignupContent);
          }, this)
        });
      }
      else {
        _appendSplit(this.splitSignupContent);
      }

      function _appendSplit (content) {
        Y.one('.signup-wrapper').append(content);
        Y.later(200, content, function() {
          Y.one(this).removeClass('is-transparent');
        });

        Y.one('.signup-wrapper .trigger-close').once('click', function(e) {
          e.currentTarget.ancestor().one('.signup-overlay').addClass('is-transparent');
          Y.later(250, e.currentTarget, function() {
            this.ancestor().remove();
          })
        }, this);
      }
    },

    /*
     * Use route or window.location
     */
    changeUrl: function (url) {
      if (!Y.Router.html5) {
        window.location.href = url;
      } else {
        this.router.save(url);
      }
    },

    /*
     * Check for external links
     */
    _isExternalLink: function (path) {
      // TODO: improve
      return path.indexOf('assets/index.html') !== -1 ||
             path.indexOf('.zip') !== -1 ||
             (path.indexOf('//squarespace.com') === -1 &&
              path.indexOf('.squarespace.com') === -1 && path.indexOf('.sqsp.com') === -1 && (path.indexOf('.com') !== -1 || path.indexOf('.org') !== -1));
    },

    /*
     * Check for link to legacy templates page
     */
    _isOldTemplatesPage: function (path) {
      return path.indexOf('/templates') !== -1;
    },

    /*
     * Check hard link
     */
     // possibly should be moved to this.router.hasRoute?
    _shouldHardLink: function (path) {
      // home page should hard link
      if (document.location.origin + '/' === path) return true;

      return (path.indexOf('/commerce') !== -1 ||
             path.indexOf('/websites') !== -1 ||
             path.indexOf('/coverpage') !== -1 ||
             path.indexOf('/domains') !== -1 ||
             path.indexOf('/pricing') !== -1);
    },


    /*
     * Check for <a> clicks and pass them on to the router
     */
    _routeBodyClicks: function (e) {
      var link = e.target.get('tagName') === 'A' ? e.target : e.target.ancestor('a'), // Catch <a href=""><span class="icon"></span></a>
          path = link && link.get('href') && !link.get('target') && link.get('href'); // && this.router.removeRoot(link.get('href'));

      if (path) {
        if (!Y.Router.html5) {
          return;
        }


        e.preventDefault();

        /*if (ABTest && landingABtest && landingABtestRedirect && (this.router.removeRoot(path) === '/')) {
          landingABtestRedirect(path);
        }*/
        this._navClick = e.target.ancestor('.navigation') ? true : false;


        if (this._isOldTemplatesPage(path)){

          var currentPage = document.location.pathname;

          // tours should go to their appropriate template grid pages
          if (currentPage.indexOf('tour') !== -1){
            currentPage = currentPage.split('index.html');
            // /tour/overview vs /tour/overview/
            currentPage = (currentPage[currentPage.length - 1].length === 0)? currentPage[currentPage.length - 2]: currentPage[currentPage.length - 1];

            switch (currentPage){
              case 'ecommerce-website':
                document.location = 'templates/online-stores.html';
                break;
              default:
                document.location = 'websites.html';
            }
          }
          else {
            this.productSelector.reveal();
          }
        }
        else if (this._shouldHardLink(path)){
          document.location = path;
        }
        // TODO: improve external link checking
        else if (this._isExternalLink(path)) {

        // if (this._isExternalLink(path)){
          link.set('target', '_blank');
          link.simulate('click');
        } else if (this.router.hasRoute(path)) {
          this.changeUrl(this.router.removeRoot(path));
        }
        else if (this._navClick) {
          document.location = path;
        }
      }
    },


    /*
     * Height of main menu, including social icons
     */
    _getMenuHeight: function () {
      return this.mainNavNY.get('offsetTop') + this.mainNavNY.get('clientHeight');
    },


    /*
     * Fullscreen Hero across mobile
     */
    _resizeHero : function() {
      var hero = Y.one('.hero'); /* TODO: cleanup this on resize */

      if (!hero || hero.hasClass('hero-calculated-height')) {
        return false;
      }

      if (hero) {
        if (Y.one(window).get('winWidth') <= 600 && Y.one(window).get('winHeight') <= 600) {
          hero.setStyles({
            'height' : (parseInt(Y.one(window).get('viewportRegion').height) * .75) + 42,
            'box-sizing' : 'border-box'
          });
        }
        else {
          hero.setStyles({
            'height' : null,
            'box-sizing' : null
          });
        }
      }
    },


    /*
     * Tap to scroll on < 600 screen sizes
     */
    _tapToScroll : function(){
      var windowScroll = new Y.Anim({
        node: (Y.UA.gecko || Y.UA.ie >= 10) ? 'html' : 'body',
        to: {
          scroll: [0, (parseInt(Y.one('.hero-image').getComputedStyle('height'), 10) - 21)]
        },
        duration: 0.3,
        easing: 'easeBoth'
      });

      windowScroll.run();
    },


    /*
     * Window resize across all pages
     */
    _windowResize: function () {
      this.disableTransitions(this.header, 800);
      this.disableTransitions(this.navigationActions, 800);
      this._resizeHero();

      Y.all('img[data-src]').each(function (img) {
        ImageLoader.load(img);
      });
    },


    /*
     * Shortcuts
     */
    _keyEvents: function (e) {
      var code = e.keyCode;

      if (e.target.get('tagName') !== 'INPUT' && e.target.get('tagName') !== 'TEXTAREA') {
        if (code === 71) {
          Y.one('.grid--baseline').setStyle('height', this.body.get('clientHeight')).toggleClass('grid--off');
        } else if (code === 72) {
          Y.all('.grid').toggleClass('grid--transparent');
        } else if (code === 70) {
          Y.one('.grid--col12').setStyle('height', this.body.get('clientHeight')).toggleClass('grid--off');
        } else if (code === 77 || code ===78) {
          window.scrollTo(0, 0);
          this.animateMenu();
        } else if (code === 190) {
          Y.all('.inject-point h1, .inject-point h2, .inject-point h3').each(function (h) {
            if (!h.get('innerHTML').endsWith('.')) {
              h.set('innerHTML', h.get('innerHTML') + '.');
            }
          });
        /*} else if (code === 81) {
          var button = Y.one('.hero .button');
          if (button) {
            button.setStyle('position', 'fixed');
            button.setStyle('zIndex', 999999);
            document.body.onmousemove = function (e) {
              button.setStyles({
                'left': e.x - button.get('clientWidth') / 2,
                'top': e.y - button.get('clientHeight') * 2
              });
            }
          }*/
        }
      }
    },


    /*
     * Left/right swipe
     */
    _registerGestures: function (element) {
      var target,
          gestureStart,
          gestureEnd,
          verticalDelta,
          horizontalDelta;

      if (typeof(element) == 'string') {
        element = Y.one(element);
      }

      if (!element) {
        return;
      }

      element.on('gesturemovestart', function (e) {
        gestureStart = [e.pageX, e.pageY];

        e.currentTarget.once('gesturemoveend', function (e) {
          gestureEnd = [e.pageX, e.pageY];
          verticalDelta = Math.abs(gestureStart[1] - gestureEnd[1]);
          horizontalDelta = gestureStart[0] - gestureEnd[0];

          //console.log(e.target);
          //console.log('Swipe - dx:' + horizontalDelta + '  dy:' + verticalDelta);

          if (verticalDelta < 25 && Math.abs(horizontalDelta) > 75) {
            if (horizontalDelta > 0) {
              console.log('swipeRight');
              element.fire('swipeRight', e.target);
            }
            else if (horizontalDelta < 0) {
              console.log('swipeLeft');
              element.fire('swipeLeft', e.target);
            }
          }

          else if (horizontalDelta < 25 && Math.abs(verticalDelta) > 75) {
            if (verticalDelta > 0) {
              element.fire('swipeDown');
            }
            else if (verticalDelta < 0) {
              element.fire('swipeUp');
            }
          }
        }, null, this);
      }, null, this);
    },


    /*
     * Events
     */
    _bindEvents: function () {
      this.navigationTrigger.on('click', this.animateMenu, this);

      if (!Modernizr.touch) {
        this.navigationTrigger.on('click', function (e) {
          if (e.currentTarget.hasClass('navigation-trigger--active')) {
            this.navGetStarted.simulate('mouseover');
          }
          else {
            this.navGetStarted.simulate('mouseout');
          }
        }, this);
        this.navGetStarted.on('mouseover', function (e) {
          e.currentTarget.addClass('hover');
        }, this);
        this.navGetStarted.on('mouseout', function (e) {
          e.currentTarget.removeClass('hover');
        }, this);
      }

      this.navGetStarted.on('click', function (e) {
        this.trackEvent('frontsite_get_started_click', {
          'mainNav': true
        });
      }, Y.Squarespace.FrontSite.Core);

      Y.one('document').on('keydown', function(e) {
        if (e.keyCode === 27) {
          Y.Squarespace.FrontSite.Core.trackEvent('frontsite_escape_key');
        }
      });


      //Modernizr.touch && this._gestures();

      this.mainNav.delegate('click', function (e) {
        var navText = e.currentTarget.one('a').get('innerText');
        if (navText !== undefined && navText !== '') {
          this.trackEvent('frontsite_main_nav_click', {
            'nav_item': navText
          });
        }

        if (!e.currentTarget.hasClass('navigation-item--active') && !e.currentTarget.one('[target="_blank"]')) {
          this.mainNav.addClass('navigation--loading');

          Y.later(1000, this, function () {
            Loader.play(e.currentTarget._node);
          });
        }
      }, '.navigation-item', this);

      this.mainNav.one('.getstarted').on('click', function(e) {
        if (e.currentTarget.getAttribute('href') === document.location.pathname) {
          this.animateMenu(false);
        }
      }, this);

      this.navigationClose.on('click', function () {
        this.animateMenu(false);
      }, this);

      this.mainNav.on('click', function (e) {
        if (e.clientY > this._getMenuHeight()) {
          this.animateMenu(false);
        }
      }, this);

      this.injectPoint && this.injectPoint.on('click', function () {
        this.animateMenu(false);
      }, this);

      this.injectPoint && this.injectPoint.on('click', this._routeBodyClicks, this);
      this.header && this.header.on('click', this._routeBodyClicks, this);
      this.navigationActions.on('click', this._routeBodyClicks, this);
      this.mainNav.on('click', this._routeBodyClicks, this);

      Y.one(window).on(window.orientation !== undefined ? 'orientationchange' : 'resize', this._windowResize, this);

      this.customerLogin && this.customerLogin.on('click', function (e) {
        e.halt();
        SQUARESPACE_LOGIN.iFrameLoginShow();
      });

      window.setInterval(function() {
        Y.all('.designs-details-shots img[data-src]').each(function (img) {
          ImageLoader.load(img);
        });
      }, 500);

    },


    /*
     * Invoke router on special pages, plus a catch-all for the rest
     */
    _createRoutes: function () {
      this.router.route(/(?:^\/home\/overview\/?$)|(?:^\/home\/coverpages\/?$)|(?:^\/home\/commerce\/?$)|(?:^\/home\/usertesting-a\/?$)|(?:^\/home\/typography\/?$)|(?:^\/home\/customers\/?$)|(?:^\/home\/dreamingwithjeff\/?$)|(?:^\/home\/build-it-beautiful\/?$)/, Y.bind(function () {
        if (this.currentPage.name === 'FullscreenSlider') {
          //return;
        }
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.FullscreenSlider();
          }, this)
        });
      }, this));


      this.router.route(/(?:^\/details\/?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.Details();
          }, this)
        });
      }, this));


      this.router.route(/(?:^\/abetterweb\/?$)/, Y.bind(function () {
        if (this.currentPage.name === 'Details') {
          return;
        }

        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.BetterWeb();
          }, this)
        });
      }, this));


      this.router.route(/(?:^\/stories\/?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.Stories();
          }, this)
        });
      }, this));


      this.router.route(/(?:^\/about-old\/?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.About();
          }, this)
        });
      }, this));


      this.router.route(/(?:^\/tour\/?$)|(?:^\/tour\/cover-page\/?$)|(?:^\/tour\/overview\/?$)|(?:^\/tour\/bloggers\/?$)|(?:^\/tour\/create-a-blog\/?$)|(?:^\/tour\/photographers\/?$)|(?:^\/tour\/photography-websites\/?$)|(?:^\/tour\/artists\/?$)|(?:^\/tour\/artist-websites\/?$)|(?:^\/tour\/ecommerce\/?$)|(?:^\/tour\/ecommerce-website\/?$)|(?:^\/tour\/restaurants\/?$)|(?:^\/tour\/restaurant-websites\/?$)|(?:^\/tour\/musicians\/?$)|(?:^\/tour\/band-websites\/?$)|(?:^\/tour\/weddings\/?$)|(?:^\/tour\/wedding-website\/?$)/, Y.bind(function () {
        if (this.currentPage.args && this.currentPage.args.sectionConfig['data-page-label'] === "tour-" ) {
          return;
        }

        var routePartial = this.router.getPath().match(/tour\/(\D+)/);
        routePartial = routePartial ? routePartial[1].replace('index.html','') : 'overview';

        this._switchPage({
          secondaryInject: '.page-content',
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.SlideshowHeader({ slideConfig: Y.Squarespace.FrontSite.TourHeros, sectionConfig: Y.Squarespace.FrontSite.TourHeros.sectionConfig, mode: routePartial });
          }, this)
        });

      }, this));


      this.router.route(/(?:^\/about\/?$)|(?:^\/about\/company\/?$)|(?:^\/about\/values\/?$)|(?:^\/about\/team\/?$)|(?:^\/about\/careers\/?$)|(?:^\/about\/contact\/?$)/, Y.bind(function () {

        if (this.currentPage.args && this.currentPage.args.sectionConfig['data-page-label'] === "about-" ) {
          if (!this._navClick) {
            return;
          }
        }

        var routePartial = this.router.getPath().match(/about\/(\D+)/);
        routePartial = routePartial ? routePartial[1].replace('index.html','') : 'company';

        this._switchPage({
          secondaryInject: '.page-content',
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.SlideshowHeader({ slideConfig: Y.Squarespace.FrontSite.AboutHeros, sectionConfig: Y.Squarespace.FrontSite.AboutHeros.sectionConfig, mode: routePartial });
          }, this)
        });

      }, this));


      this.router.route(/(?:^\/login\/?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.LoginPage();
          }, this)
        });
      }, this));


      this.router.route(/(?:^\/pricing\/?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.Pricing();
          }, this)
        });
      }, this));


      this.router.route(/^(?:\/templates\/?(.*)\/?)|(?:\/portfolios\/?)|(?:\/blogs\/?)|(?:\/websites\/?)$/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.Templates();
          }, this)
        });
      }, this));


      this.router.route(/(?:^\/customers\/?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.Customers();
          }, this)
        });
      }, this));

      this.router.route(/(?:^\/students\/?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.Students();
          }, this)
        });
      }, this));

      this.router.route(/(?:^\/weddings\/?$)|(?:^\/weddingsnew\/?$)|(?:^\/weddings?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.Weddings();
          }, this)
        });
      }, this));

      this.router.route(/(?:^\/start\/?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.PPCPages({
              render: true
            });
          }, this)
        });
      }, this));


      this.router.route(/(?:^\/apps\/?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.MobileAppsNew();
          }, this)
        });
      }, this));


      this.router.route(/(?:^\/$)|(?:^\/logo\/?$)|(?:^\/logomark\/?$)/, Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = new Y.Squarespace.FrontSite.Logomark();
          }, this)
        });
      }, this));


      this.router.route(/(javascript)/, function (e) {
        console.log('?');
      });


      this.router.route(/(?:\/seven\/?(.*)\/?)/, function (e) {
        document.location = e.path;
      });


      this.router.route('*', Y.bind(function () {
        this._switchPage({
          ready: Y.bind(function () {
            this.currentPage = 'otherpage';
          }, this)
        });
      }, this));
    },


    /*
     * Close Footer on Scroll
     */
    _closeFooterOnScroll: function (e) {
      if (this.body.height() - (this._winY() + window.innerHeight) > 350) {
        this._switchFooter(false);
      }
    },


    /*
     * Close menu on scroll
     */
    _closeMenuOnScroll: function (e) {
      if (!Modernizr.touch && this._winY() > this._getMenuHeight()) {
        this.animateMenu(false);
        Y.one(window).detach('scroll', this._closeMenuOnScroll);
      }
    },


    /*
     * Switch between footer states
     */
    _switchFooter: function (mode) {
      var layoutBody = Y.one('.layout-body'),
          overlay = Y.one('.footer-overlay'),
          text = Y.one('.footer-overlay-text'),
          delta = text && text.get('clientHeight');

      if (mode === undefined) {
        this.body.toggleClass('is--pushed-upwards');
      } else if (mode === true) {
        this.body.addClass('is--pushed-upwards');
      } else if (mode === false) {
        this.body.removeClass('is--pushed-upwards');
      }

      if (this.body.hasClass('is--pushed-upwards')) {
        overlay && overlay.setStyle('maxHeight', delta);
        layoutBody && layoutBody.setStyles({
          'webkitTransform': 'translate3d(0, -' + delta + 'px, 0)',
          'mozTransform': 'translate3d(0, -' + delta + 'px, 0)',
          'msTransform': 'translate3d(0, -' + delta + 'px, 0)',
          'oTransform': 'translate3d(0, -' + delta + 'px, 0)',
          'transform': 'translate3d(0, -' + delta + 'px, 0)'
        });

        Y.one(window).on('scroll', this._closeFooterOnScroll, this);
        this.escTarget('add', 'footer');
      } else {
        overlay && overlay.setStyle('maxHeight', null);
        layoutBody && layoutBody.setStyles({
          'webkitTransform': null,
          'mozTransform': null,
          'msTransform': null,
          'oTransform': null,
          'transform': null
        });

        Y.one(window).detach('scroll', this._closeFooterOnScroll);
        this.escTarget('remove', 'footer');
      }
    },


    /*
     * Open/close footer
     */
    _animateFooter: function () {
      var footer = Y.one('.footer'),
          overlay = Y.one('.footer-overlay'),
          layoutBody = Y.one('.layout-body'),
          trigger = footer && footer.one('.footer-link');

      if (overlay && trigger) {
        trigger.on('click', function () {
          this._switchFooter();
        }, this);

        overlay.on('click', function () {
          this._switchFooter(false);
        },this);

        layoutBody.on('click', function () {
          this._switchFooter(false);
        }, this);
      }
    },


    _moveSidebarOnScroll: function () {
      var distanceTop = this.sidebarNav && Y.one('#collectionWrapper').getY(), // Improve after cleanup
          distanceBottom = this.sidebarNav && (Y.one('.footer').getY() - this.sidebarNav.height()),
          scrollTop = this._winY(),
          horizontalNav = Y.one(window).get("winWidth") < 1020 ? true : false;

      if (scrollTop < distanceTop) {
        this.sidebarNav.removeClass('fixed');
        if (horizontalNav) {
          this._slideNav('reset');
        }
      } else if (scrollTop >= distanceTop && scrollTop < distanceBottom ) {
        if(!this.sidebarNav.hasClass('fixed')) {
          this.sidebarNav.addClass('fixed').removeClass('absolute');
        }
        else if (this.sidebarNav.hasClass('fixed')){
          if (horizontalNav) {
            if(this.currentY > this._winY()){
              this._slideNav('down');
            }
            else if (this.currentY < this._winY()) {
              this._slideNav('up');
            }
          }
        }
      } else {
        this.sidebarNav.removeClass('fixed').addClass('absolute');
        if (horizontalNav) {
          this._slideNav('reset');
        }
      }
      if (this.sidebarNav.hasClass('sidebar-nav-wrapper--open')){
        this.sidebarNav.removeClass('sidebar-nav-wrapper--open');
        this.sidebarNav.setStyle('height', parseInt(this.sidebarNav.one('.sidebar-navigation-more').getComputedStyle('height'), 10));
        this.sidebarNav.one('.sidebar-navigation').setStyle('height', parseInt(this.sidebarNav.one('.sidebar-navigation-more').getComputedStyle('height'), 10));
      }
      this.currentY = this._winY();
    },


    /*
     * Handle sidebar on folder pages
     */
    _sidebarNav: function () {
      this.sidebarNav = Y.one('.sidebar-nav-wrapper');

      if (this.sidebarNav) {
        Y.one(window).on('scroll', this._moveSidebarOnScroll, this);
        this._moveSidebarOnScroll();
        this._secondaryNavFolder();

        Y.all('.press-list-collection').on('click', function (e) {
          if (!e.currentTarget.hasClass('sidebar-navigation-more') && !e.currentTarget.ancestor().hasClass('loading') && !e.currentTarget.one('.active-link')) {
            Loader.play(e.currentTarget._node, true);
            e.currentTarget.ancestor().addClass('loading');
          }
        }, this);

      } else {
        Y.one(window).detach('scroll', this._moveSidebarOnScroll, this);
      }
    },


    /*
     * Handle sidebar on folder pages for mobile screen sizes
     */
    _secondaryNavFolder: function() {
      if (!this.sidebarNav) {
        return;
      }
      this.sidebarMore = this.sidebarNav.one('.sidebar-navigation-more');
      if(this.sidebarMore) {
        this.sidebarMore.on('click', function(e){
          if (this.sidebarNav.hasClass('sidebar-nav-wrapper--open')){
            this.sidebarNav.removeClass('sidebar-nav-wrapper--open');
            this.resetNavHeight();
          }
          else if (!this.sidebarNav.hasClass('sidebar-nav-wrapper--open')){
            this.sidebarNav.addClass('sidebar-nav-wrapper--open');
            var newHeight = (parseInt(this.sidebarNav.one('.press-list-collection:not(.sidebar-navigation-more)').getComputedStyle('height'), 10) * this.sidebarNav.all('.press-list-collection:not(.sidebar-navigation-more)').size()) + (parseInt(this.sidebarMore.getComputedStyle('height'), 10)) + (parseInt(this.sidebarMore.getComputedStyle('margin-bottom'), 10) * 2) + 32;
            this.sidebarNav.setStyle('height', newHeight);
            this.sidebarNav.one('.sidebar-navigation').setStyle('height', newHeight);
          }
        }, this);
        this.resetNavHeight = function (){
          if (Y.one(window).get('winWidth') < 1020) {
            var newHeight = parseInt(this.sidebarMore.getComputedStyle('height'), 10);
            this.sidebarNav.setStyle('height', newHeight);
            this.sidebarNav.one('.sidebar-navigation').setStyle('height', newHeight);
          }
          else if (Y.one(window).get('winWidth') >= 1020) {
            this._slideNav('none');
          }
        }
        Y.one(window).on('resize', this.resetNavHeight, this);
      }
    },


    /*
     * Handle sidebar sliding on folder pages for mobile screen sizes
     */
    _slideNav : function (dir){
      if (!this.sidebarNav) {
        return;
      }
      var translationValue = parseInt(this.sidebarNav.one('.sidebar-navigation-more').getComputedStyle('height'), 10);
      if (dir === 'up'){
        var transValue = 'translateY('+ (0 - translationValue) + 'px)';
      }
      else if (dir === 'down'){
        var transValue = 'translateY('+ 0 +'px)';
      }
      else if (dir === 'reset') {
        var transValue = 'translateY(0)';
      }
      else {
        var transValue = null;
      }
      this.sidebarNav.setStyles(
      {
        '-webkit-transform' : transValue,
        '-moz-transform' : transValue,
        '-ms-transform' : transValue,
        '-o-transform' : transValue,
        'transform' : transValue
      })
    },


    /*
     * Align .button--centered
     */
    /*centerButtons: function (el) {
      el = el ? el.all('.button--centered') : Y.all('.button--centered');

      el.each(function (button) {
        button.setStyle('marginLeft', -button.get('clientWidth') / 2);
        button.setStyle('marginTop', -button.get('clientHeight') / 2);
      });
    },*/


    /*
     * Custom lightbox
     */
    attachCustomLightbox: function (close) {
      if (close) {
        var lightbox = Y.one('.custom-lightbox');
        lightbox && lightbox.remove();
        this.escTarget('remove', 'lightbox');
      } else {
        Y.all('[data-custom-lightbox]').each(function (trigger) {
          var content = trigger.getAttribute('data-custom-lightbox');

          if (content != 'ready') {
            trigger.setAttribute('data-custom-lightbox','ready');

            // Make sure autoplay is set to true
            content = content.replace(/(src)=["']([^"']*)["']/gi, function (match, name, value) {
              if (value.indexOf('autoplay') === -1) {
                value += '&autoplay=true';
              }
              return 'src="' + value + '"';
            });

            trigger.on('click', function (e) {
              var html = Y.Node.create('<div></div>').set('innerHTML', content);
              html = html.get('innerText') || html.get('textContent');

              if (!html) {
                html = Y.Node.create(content).get('outerHTML');
              }

              var lightbox = Y.Node.create('<div class="custom-lightbox is--transparent">' + html + '<div class="custom-lightbox-close"><div class="icon"></div></div></div>');
              lightbox.appendTo(Y.one('body'));

              if (trigger.getAttribute('data-custom-class')) {
                lightbox.addClass(trigger.getAttribute('data-custom-class'));
              }

              // Attach call to action if required
              if (trigger.getAttribute('data-custom-lightbox-action') === 'true') {
                lightbox.addClass('has-action');

                var action = Y.Node.create('<div class="call-to-action"><span>Everything you need to create an exceptional website</span><a href="/templates/" class="button button--small">Get Started</a></div>')
                action.appendTo(lightbox);
              }

              setTimeout(function () {
                lightbox.removeClass('is--transparent');
              }, 100);

              this.escTarget('add', 'lightbox');

              lightbox.on('click', function (e) {
                e.preventDefault();
                if (e.target.hasClass('button')) {
                  this.changeUrl('templates/index.html');
                }
                this.attachCustomLightbox(true);
              }, this);

            }, this);
          }
        }, this);
      }
    },


    /*
     * Modify hero through codes plus change context depending on hero status
     */
    _superHero: function () {
      var heros = Y.Squarespace.FrontSite.Heros,
          hero = Y.one('.hero'),
          title = hero && hero.one('.hero-title'),
          tagline = hero && hero.one('.hero-tagline'),
          video = Y.one('.sqs-layout .row:first-child .video-block'),
          url = this.router.getPath().replace(/\/|-/ig, '') || 'tour',
          originalText,
          link,
          params;

      originalText = tagline && tagline.get('innerHTML');
      params = originalText && originalText.substring(originalText.indexOf('{'), originalText.indexOf('}') + 1);

      if (params || heros[url]) {
        originalText && tagline.set('innerHTML', tagline.get('innerHTML').replace(params, ''));

        if (heros[url]) {
          params = heros[url];

          if (tagline && params.description) {
            tagline.set('innerHTML', params.description);
          }
        } else {
          params = JSON.parse(params);
        }
      }

      this.moreArrow = Y.one('.hero-more-arrow');
      this.moreArrow && this.moreArrow.on('click', this._tapToScroll, this);

      if (params) {
        if (params.title && title) {
          title.set('innerHTML', params.title);
        }
        if (params.hero) {
          hero.addClass('hero--' + params.hero);
        }
        if (tagline && params.tagline) {
          tagline.addClass('hero-tagline--' + params.tagline);
        }
        if (tagline && !params.tagline) {
          tagline.addClass('hero-tagline--light');
        }
        if (params.subtitle) {
          var block = Y.Node.create('<span class="marketing-sub-title">' + params.subtitle + '</span>');
          title.insert(block, 'before');
        }
        if (params.attribution) {
          var block = Y.Node.create('<div class="marketing-attribution"><span class="marketing-attribution-name">' + params.attribution.name + '</span><span class="marketing-attribution-sub">' + params.attribution.title + '</span></div>');
          hero.append(block);
        }
        if (params.buttonLink) {
          link = Y.Node.create('<a href="' + params.buttonLink + '" class="button button-square button-square-large button-square-filled button-square-light">' + params.buttonText + '</a>');
          this.moreArrow && this.moreArrow.insert(link, 'before');

          if (params.button) {
            link.addClass('button--' + params.button);
          }
        }
        if (video && params.promoteVideo) {
          var block = Y.Node.create('<div class="hero-video"><div class="hero-video-overlay content-fill"><img data-src="' + video.one('img[data-src]').getAttribute('data-src') + '" /></div><div class="hero-video-play"><div class="icon"></div></div></div>')
          block.one('.hero-video-play').setAttribute('data-custom-lightbox', video.one('.sqs-video-wrapper').getAttribute('data-html'));
          if (tagline) {
            tagline.addClass('hero-tagline--light');
          }
          hero.prepend(block);
          hero.addClass('hero--video');
          video.ancestor('.sqs-row').remove();
        }
        if (params.promoteVideoIframe) {
          var block = Y.Node.create('<div class="watch-video">Watch Demo<span class="icon"></span></div>')
          block.setAttribute('data-custom-lightbox', params.promoteVideoIframe);
          block.setAttribute('data-custom-lightbox-action', 'true');
          this.moreArrow && this.moreArrow.insert(block, 'before');
        }
      }

      if (tagline) {
        if (tagline.get('innerHTML') === '') {
          tagline.remove();
        } else {
          // Custom line breaks using |
          if(tagline.get('innerHTML').indexOf('|:') != -1){
            tagline.set('innerHTML', tagline.get('innerHTML').replace(/(\|\:)(\d+)/g, '<span class="responsive-break responsive-break--$2"></span>'));
          }
          tagline.set('innerHTML', tagline.get('innerHTML').replace(/\|/g, '<br>'));
        }
      }
      if (title) {
        if(title.get('innerHTML').indexOf('|:') != -1){
          title.set('innerHTML', title.get('innerHTML').replace(/(\|\:)(\d+)/g, '<span class="responsive-break responsive-break--$2"></span>'));
          title.set('innerHTML', title.get('innerHTML').replace(/(\|\:)(\D+)(\^)/g, '<span class="responsive-break responsive-break--$2"></span>'));
        }
        title.set('innerHTML', title.get('innerHTML').replace(/\|/g, '<br>'));
      }

      // Adjust context depending on state of hero
      if (hero && (hero.hasClass('hero--white') || hero.hasClass('hero--light') || hero.hasClass('hero--coolgrey'))) {
        this.switchHeader('dark', false, true);

        if (link) {
          link.addClass('button--dark');
        }
      } else if (hero) {
        this.switchHeader('light', false, true);
      }

      this._resizeHero();

      hero && hero.all('img').each(function (img) {
        ImageLoader.load(img, { load: true });
        img.removeAttribute('data-load');
      });

      Y.fire('superherocomplete');
    },


    /*
     * Check if both values are essentially the same
     */
    /*_isSameUrl: function (a, b) {
      return (a + (!a.endsWith('/') ? '/' : '')) === (b + (!b.endsWith('/') ? '/' : ''));
    },*/


    /*
     * Do stuff before injecting the next page
     */
    _switchPage: function (params) {
      if (this.router.getPath().endsWith('index.html') && !this.currentUrl.endsWith('index.html')) {
        var curUrl = this.currentUrl + '/';
      }
      else if (!this.router.getPath().endsWith('index.html') && this.currentUrl.endsWith('index.html')) {
        var curUrl = this.currentUrl.substring(0, this.currentUrl.length - 1);
      }
      else {
        var curUrl = this.currentUrl;
      }

      if (curUrl && curUrl === this.router.getPath() && this.currentPage && this.currentPage.name === 'mobileAppsNew') {
        return;
      }

      if (curUrl && curUrl === this.router.getPath() && this.currentPage && this.currentPage.name === 'Details') {
        return;
      }

      function adjustPos () {
        if (window.location.hash && Y.one(window.location.hash)) {
          if(Y.one('.collection-layout-folder-view .sidebar-content-wrapper')) {
            window.scrollTo(0, Y.one(window.location.hash).getY() - (parseInt(Y.one('.collection-layout-folder-view .sidebar-content-wrapper').getComputedStyle('padding-top'), 10) + 1 || 48));
          }
          else {
             window.scrollTo(0, Y.one(window.location.hash).getY());
          }
        } else {
          window.scrollTo(0, 0);
        }
      }

      function ready () {
        var layout = Y.one('.layout'),
            layoutBody = layout && layout.one('.layout-body'),
            footer = Y.one('.footer'),
            pageTitle = layout && layout.getAttribute('data-page-title');


        var curPath = window.location.pathname;

        if (Y.Lang.isString(curPath) && !curPath.startsWith('/login') && this.body && this.body.hasClass('squarespace-login')) {
          this.body.removeClass('squarespace-login');
          this.body.removeClass('login-visible');
        }

        this.body.setStyle('overflow', null);
        this.marketingEvents('hits');
        (Y.one('.homepage') || Y.one('.layout.home')) && this.marketingEvents('home');

        this.injectPoint && this.injectPoint.addClass('inject-point--ready');
        this.loginLink(false);
        this.designsBackLink(false);
        this.tourLink(false);

        Y.Squarespace.GalleryManager._galleries = [];

        this._responsiveBreaks();

        if (params && params.ready) {
          params.ready();
        }

        if (Y.UA.ie !== 8 && layout && !layout.hasClass('layout--fixed') && layoutBody) {
          var min = window.innerHeight - (footer ? footer.get('clientHeight') : 0);
          layoutBody.setStyle('minHeight', min);
        }

        this.header && this.header.removeClass('is--invisible');
        this.navigationActions && this.navigationActions.removeClass('is--invisible');

        this._animateFooter();
        layout && layout.removeClass('is--invisible');
        Y.later(1500, this, function() {
          this.mainNav && this.mainNav.removeClass('is--invisible');
        });
        layout && layout.addClass('is--loaded');

        pageTitle += pageTitle ? ' — ' : '';
        document.title = pageTitle.capitalize() + (Static && Static.SQUARESPACE_CONTEXT.website.siteTitle);

        Squarespace.initializeLayoutBlocks(Y);
        this._sidebarNav();
        this._superHero();
        this.attachCustomLightbox();
        //this.centerButtons(); Uncomment this if button--centered is ever used on pages outside of /designs

        this.lazyLoader.purge();
        this.retinaLoader._unbindEvents();
        this.retinaLoader._bindEvents();

        Y.all('img[data-src]:not([src])').each(function (img) {
          if (img.getAttribute('data-load') === 'viewport') {
            this.lazyLoader.push(img);
          } else {
             if (!img.ancestor('.hero')){
              ImageLoader.load(img);
            }
          }
        }, this);

        // Make sure that the fetched page is tracked
        if (window.pSUPERFLY) {
          pSUPERFLY.virtualPage(url, document.title);
        }

        if (window._gaq) {
          _gaq.push(['_trackPageview', url]);
        }

        // 404
        if (layout && layout.one('.moved')) {
          this.switchHeader('light');

          Y.later(3000, this, function () {
            if (layout && layout.one('.moved')) {
              this.animateMenu(true);
            }
          })
        }

        adjustPos();
        this.mainNav && this.mainNav.setStyle('height', null);
        this.animateMenu(false);

        Y.later(1000, this, function () {
          Loader.stop();
          this.mainNav && this.mainNav.removeClass('navigation--loading');
        });
      }


      var activeItem,
          url = this.router.getPath();

      this.pageViews++;

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

      var paging = (window.location.search && window.location.search.indexOf('?offset') !== -1) ? window.location.search : '';
      if (this.currentUrl !== (window.location.pathname + (!window.location.pathname.endsWith('index.html') ? '/' : '')) || paging) {

        oldReferrer = this.currentUrl;

        this.currentUrl = window.location.pathname + (!window.location.pathname.endsWith('index.html') ? '/' : '') + paging;
        this.injectPoint && this.injectPoint.removeClass('inject-point--ready');

        if (this.currentPage) {
          if (this.currentPage.destroy) {
            this.currentPage.destroy();
          }

          Y.Data.get({
            url: this.currentUrl, //this.router.getPath(),
            responseFormat: 'raw',
            failure: Y.bind(function (data) {
              this.changeUrl('moved/index.html');
            }, this),
            success: Y.bind(function (data) {
              var dom = Y.DOM.create(data);

              this.injectPoint.empty();
              this.injectPoint.setContent(Y.Selector.query('.layout', dom, true));

              Y.bind(ready, this)();
            }, this)
          });
        } else {
          Y.bind(ready, this)();
        }
      } else {
        adjustPos();
      }
    },


    /*
     * Replace secondary content section with new data
     */
   _switchContent: function (el, path) {
      // ELEMENTS
      var secondaryInject = Y.one('.inject-point--secondary'),
          path = this.router.removeRoot(path);

      //make sure the current content is different than requested content
      if (window.location.pathname === path) {
        return;
      }

      oldReferrer = this.currentUrl;
      this.currentUrl = path;

      if (Y.one('html').hasClass('touch')) {
        var loadingClass = 'is--invisible';
      }
      else {
        var loadingClass = 'is--faded';
      }
      //change content

      // Do this after MarketingTours._tapToScroll is finished (1s).
      // TODO: change this to bet triggered on an event fired by _tapToScroll
      //Y.later((window.scrollY === 0 ? 0 : 1000), this, function(){
        secondaryInject.addClass(loadingClass);

        Y.Data.get({
          url: path, //this.router.getPath(),
          responseFormat: 'raw',
          failure: Y.bind(function (data) {
            this.changeUrl('moved/index.html');
          }, this),
          success: Y.bind(function (data) {
            var dom = Y.DOM.create(data);

            secondaryInject.empty();
            secondaryInject.setContent(Y.Selector.query(el, dom, true));

            Y.bind(ready, this)();
          }, this)
        });
      //});

      function ready() {
        // do the whole URL building stuff
        this.router.save(path);
        // TODO: replaceValue instead of save
        Y.one('.page-content') && Y.one('title').setHTML(Y.one('.page-content').getAttribute('data-page-title'));

        this.body.setStyle('overflow', null);
        this._responsiveBreaks();
        this.marketingEvents('hits');
        this.lazyLoader.purge();
        this.retinaLoader._unbindEvents();
        this.retinaLoader._bindEvents();

        Y.all('img[data-src]:not([src])').each(function (img) {
          if (img.getAttribute('data-load') === 'viewport') {
            this.lazyLoader.push(img);
          } else {
             if (!img.ancestor('.hero')){
               ImageLoader.load(img, {load: true});
            }
          }
        }, this);

        Y.one('.layout').setAttribute('data-page-label', this.currentPage.args.sectionConfig['data-page-label'] + this.currentPage._getActiveMode());

        Y.later(100, this, function() {
          this.currentPage._pageModeFunctions();
          secondaryInject.removeClass(loadingClass);
          if (typeof this.currentPage._bindMoreEvents() === 'function') {
            this.currentPage._bindMoreEvents();
          }
        });
      }
     },


    /*
     * Write CSS based on responsive BR elements
     */
    _responsiveBreaks: function () {
       var breaksCSS = Y.one('style[data-for="responsive-breaks"]'),
           breaks = Y.all('br[data-break-over]'),
           cssRules = '';

       for (var ii = 0; ii < breaks.size(); ii++) {
         var b = parseInt(breaks.item(ii).getAttribute('data-break-over'));
         cssRules += '@media (max-width: ' + b + 'px) { br[data-break-over="' + b + '"] { display: none; } }';
       }

       if (breaksCSS) {
         breaksCSS.setHTML(cssRules);
       }
       else {
         breaksCSS = Y.Node.create('<style type="text/css" data-for="responsive-breaks"></style>');
         breaksCSS.setHTML(cssRules);
         Y.one('head').append(breaksCSS);
       }
    },


    /*
     * Convert single div's to complete chromes
     */
    renderChromes: function (el) {
      Y.Squarespace.FrontSiteUtils.renderChromes(el);
    },


    /*
     * Temporarily disable transforms
     */
    disableTransforms: function (node) {
      Y.Squarespace.FrontSiteUtils.disableTransforms(node);
    },


    /*
     * Temporarily disable transitions
     */
    disableTransitions: function (node, timeout) {
      node.addClass('no-transition');

      if (timeout) {
        setTimeout(function () {
          if (node && node._node) {
            node.removeClass('no-transition');
          }
        }, timeout);
      }
    },


    /*
     * Enable transitions
     */
    enableTransitions: function (node) {
      node.removeClass('no-transition');
    },


    /*
     * Enable/disable scrolling on layout
     */
    fixedLayout: function (mode, timeout, force) {
      Y.Squarespace.FrontSiteUtils.fixedLayout(mode, timeout, force);
    },


    /*
     * Light/dark versions of the header
     */
    switchHeader: function (mode, animate, force) {
      this.moreArrow = Y.one('.hero-more-arrow');

      if (mode === 'light' && (force || (this.logo && !this.logo.hasClass('logo--light')))) {
        this.moreArrow && this.moreArrow.addClass('hero-more-arrow--light');

        if (animate) {
          this.logo.addClass('is--transparent');
          this.navigationActions.addClass('is--transparent');

          Y.later(500, this, function () {
            this.logo && this.logo.addClass('logo--light').removeClass('is--transparent');
            this.navigationActions.addClass('navigation-actions--light').removeClass('is--transparent');
          });
        } else {
          this.logo && this.logo.addClass('logo--light');
          this.navigationActions.addClass('navigation-actions--light');
        }
      } else if (mode === 'dark' && (force || (this.logo && this.logo.hasClass('logo--light')))) {
        this.moreArrow && this.moreArrow.removeClass('hero-more-arrow--light');

        if (animate) {
          this.logo && this.logo.addClass('is--transparent');
          this.navigationActions.addClass('is--transparent');

          Y.later(500, this, function () {
            this.logo && this.logo.removeClass('logo--light').removeClass('is--transparent');
            this.navigationActions.removeClass('navigation-actions--light').removeClass('is--transparent');
          });
        } else {
          this.logo && this.logo.removeClass('logo--light');
          this.navigationActions.removeClass('navigation-actions--light');
        }
      }
    },


    /*
     * Return value of any URL param ex: ?q=test
     */
    getURLQueryValue: function (query, value) {
      if (value) {
        return Y.QueryString.parse(document.location.search.substring(1))[query] === value;
      } else {
        return Y.QueryString.parse(document.location.search.substring(1))[query];
      }
    },


    /*
     * Keep track of when certain intro animations are no longer required
     */
    supressAnimations: function () {
      this.injectPoint.addClass('is--loaded-no-animation');
    },


    /*
     * Show designs
     */
    renderSiteFilter: function () {
      this.siteFilter.render();
    },


    /*
     * Go back to templates view
     */
    resetSiteFilter: function () {
      this.siteFilter.setValue('');
    },


    /*
     * Add/remove ESC targets
     */
    escTarget: function (mode, desc, context) {
      Y.Squarespace.FrontSiteUtils.escTarget(mode, desc, context);
    },


    /*
     * Close main menu
     */
    close: function () {
      this.animateMenu(false);
      this._switchFooter(false);
      this.attachCustomLightbox(true);
    },


    /*
     * Track Events
     */
    trackEvent: function (eventName, eventParams) {
      if (window.__templateVersion) {
        if (eventParams && typeof eventParams === 'object'){
          eventParams["templateVersion"] = window.__templateVersion;
        }
        else if (typeof eventParams === 'undefined') {
          eventParams = {
            templateVersion: window.templateVersion
          };
        }
        else {
          console.warn('Invalid type for eventParams');
        }
      }

      Y.Squarespace.Analytics.trackInternal(eventName, eventParams);
    },


    /*
     * Open/close side menu
     */
    animateMenu: function (mode) {
      if (Y.UA.ios) {
        this.body.setStyle('backgroundColor', '#0c0c0c');
      }

      if (mode === false) {
        this.body.removeClass('is--pushed-left');
      } else if (mode === true) {
        this.body.addClass('is--pushed-left');
      } else {
        this.body.toggleClass('is--pushed-left');
      }

      if (this.body.hasClass('is--pushed-left')) {
        Y.later(400, this, function () {
          this.mainNav.addClass('navigation--open');
        });

        this.navigationTrigger.addClass('navigation-trigger--active');

        if (Modernizr.touch) {
          this.mainNav.setStyles({
            'position': 'fixed',
            'top': 0,
            'height': window.innerHeight,
            'overflow-y': 'auto'
          });
        } else {
          Y.one(window).on('scroll', this._closeMenuOnScroll, this);

          if (Y.one('.layout--fixed')) {
            this.mainNav.setStyles({
              'overflow-y': 'scroll',
              'height': window.innerHeight
            });

            //this.body.setStyle('overflow', 'hidden');
          } else {
            this.mainNav.setStyles({
              'overflow': null,
              'height': this.body.get('clientHeight')
            });
          }
        }

        this.escTarget('add', 'menu');
      } else {
        this.mainNav && this.mainNav.removeClass('navigation--open');
        this.navigationTrigger && this.navigationTrigger.removeClass('navigation-trigger--active');
        this.escTarget('remove', 'menu');

        Y.later(700, this, function () {
          this.mainNav && this.mainNav.setStyles({
            'position': null,
            'top': null,
            'height': null,
            'overflow-y': null
          });
        });
      }
    }

  });
});
