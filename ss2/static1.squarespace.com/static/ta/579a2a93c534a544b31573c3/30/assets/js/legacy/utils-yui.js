YUI.add('squarespace-utils-yui', function(Y) {

  var STORE_TEMPLATES = ['hyde', 'marta', 'thorne', 'brine', 'supply', 'galapagos', 'fulton', 'adirondack'];

  Y.namespace('Squarespace.FrontSiteUtils');

  Y.Squarespace.FrontSiteUtils.winY = function() {
    return (Y.config.win.scrollY || Y.one('body').get('docScrollY'));
  };

  Y.Squarespace.FrontSiteUtils.fixedLayout = function(mode, timeout, force) {
    var body = Y.one('body');
    if (mode === true && (this.injectPoint && !this.injectPoint.hasClass('is--loaded-no-animation') || force)) {
      window.scrollTo(0, 0);
      body.setStyle('height', window.innerHeight);
      Y.one('html').setStyle('height', window.innerHeight);
      Y.one('html').addClass('is--noscroll');

      if (timeout) {
        Y.later(timeout, this, function () {
          Y.Squarespace.FrontSiteUtils.fixedLayout(false);
        });
      }
    } else {
      body.setStyle('overflow', null);
      body.setStyle('height', null);
      Y.one('html').setStyle('height', null);
      Y.one('html').removeClass('is--noscroll');
    }
  };

  Y.Squarespace.FrontSiteUtils.disableTransforms = function(node) {
    node.addClass('no-transforms');
  };

  Y.Squarespace.FrontSiteUtils.escTarget = function(mode, desc, context) {
    context = !context ? this : context;

    if (mode === 'add') {
      context.ignoreBodyClicks = true;
      Y.Squarespace.EscManager.addTarget(context);
      Y.Squarespace.EscManager.source = desc;
    } else if (mode === 'remove' && Y.Squarespace.EscManager.source === desc) {
      Y.Squarespace.EscManager.removeTarget(context);
    }
  };

  Y.Squarespace.FrontSiteUtils.renderChromes = function(el) {
    if (el) {
      el.all('.browser').each(function (browser) {
        var chrome = Y.Node.create('<div class="browser-bar"><div class="browser-button"></div><div class="browser-button"></div><div class="browser-button"></div></div><div class="cinema-display"></div><div class="browser-content"></div>');
        chrome.one('.browser-content').set('innerHTML', browser.get('innerHTML'));
        browser.empty();
        chrome.appendTo(browser);
      });

      el.all('.iphone').each(function (iphone) {
        var chrome = Y.Node.create('<div class="iphone-content"></div>');
        chrome.set('innerHTML', iphone.get('innerHTML'));
        iphone.empty();
        chrome.appendTo(iphone);
      });
    }
  };

  Y.Squarespace.FrontSiteUtils.ShowProfile = function(data) {
    if ((data.customer || data.identifier || data.customDomain) && document.body.clientWidth <= 1020) {
      if (data.customDomain) {
        data.customDomain = data.customDomain.replace('http://', '');
      }

      var url = data.customDomain ? 'http://' + data.customDomain : data.url || 'http://' + data.identifier + '.squarespace.com' + (data.deepLink ? data.deepLink : "");

      var link = Y.Node.create('<a target="_blank" href="' + url + '""></a>');
      link.simulate('click');
    } else {
      if (data.specs || data.cloneId) {
        this.profileEl = Y.DB.DIV('designs-details-overlay' + (data.customer ? ' designs-details-overlay--customer' : ' designs-details-overlay--features'), {
          "data-websiteId": data.cloneId
        }, data.specs ? Y.Node.create('<div class="sitefilter-profile-title"><h1 class="logo logo--light"><a href="index.html"><div class="svg-icon-sqsp-logo"><svg viewBox="0 0 64 64"><use class="use-icon" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="universal/images-v6/www/squarespace-logo.svg#squarespace-logo"></use></svg></div>Squarespace</a></h1></div>') : Y.DB.DIV('designs-details-overlay-signup button button-square button-square-filled button-square-dark', {
          html: "Create a Site Like This"
        }), Y.DB.A('designs-details-overlay-link'), Y.DB.DIV('designs-details-overlay-close', Y.DB.SPAN('icon')));
      } else {

        var baseTemplate;

        if (Y.config.win.SQUARESPACE_IS_AWESOME && Y.config.win.SQUARESPACE_IS_AWESOME.siteFilter.storeTemplatesByTag) {
          baseTemplate = Y.config.win.SQUARESPACE_IS_AWESOME.siteFilter.storeTemplatesByTag[data.baseTemplate.toLowerCase()];
        } else {
          console.warn('complete sitefilter data is not loaded, so hashing the baseTemplate');
          baseTemplate = {
            templateWebsiteIdentifier: data.baseTemplate
          };
        }

        var buttonHTML = '';

        this.scrollPositionClose = Y.Squarespace.FrontSiteUtils.winY();
        this.currentProfile = null;


        if (baseTemplate) {

          // never show CTA if developer/custom site
          if (baseTemplate.templateWebsiteIdentifier === 'Developer') data.cta = 'hide';

          switch (data.cta) {
            case 'view':

              var href;
              var templateWebsiteIdentifier = data.baseTemplate.toLowerCase();
              if (STORE_TEMPLATES.indexOf(templateWebsiteIdentifier) !== -1) {
                href = '/commerce/templates/' + data.baseTemplate.toLowerCase();
              } else {
                href = '/websites/templates/' + data.baseTemplate.toLowerCase();
              }

              buttonHTML = Y.Node.create('<a class="designs-details-overlay-signup designs-details-overlay-view button button-square button-square-filled button-square-dark" href="' + href + '">View Template</a>');
              break;
            case 'hide':
              buttonHTML = '';
              break;
            default:
              buttonHTML = Y.DB.DIV('designs-details-overlay-signup button button-square button-square-filled button-square-dark', {
                html: "Create a Site Like This"
              });
              break;
          }
        }

        var siteTitle = data.siteTitle && "<a class='designs-details-overlay-title' target='_blank'>" + data.siteTitle + "</a>";

        this.profileEl = Y.DB.DIV('designs-details-overlay designs-details-overlay--customer', {
          'data-websiteId': baseTemplate && baseTemplate.templateWebsiteId
        }, buttonHTML, siteTitle, Y.Node.create('<a class="designs-details-overlay-link"></a>'), Y.DB.DIV('designs-details-overlay-close', Y.DB.SPAN('icon')));

        if (data.cta === 'view') {
          this.profileEl.one('.designs-details-overlay-link').addClass('designs-details-overlay-link--small-gap');
        } else if (data.cta === 'hide') {
          this.profileEl.one('.designs-details-overlay-link').addClass('designs-details-overlay-link--no-gap');
        }
      }

      var link = this.profileEl.one('.designs-details-overlay-link');
      if (link) {
        link.setAttribute('target', '_blank');

        // Not used on tech specs
        if (data.identifier || data.customDomain) {
          if (data.customDomain) {
            data.customDomain = data.customDomain.replace('http://', '');
          }

          var url = data.customDomain ? 'http://' + data.customDomain : data.url || 'http://' + data.identifier + '.squarespace.com' + (data.deepLink ? data.deepLink : "");
          link.setAttribute('href', url);
          link.set('innerHTML', url.replace('http://', ''));
          siteTitle && this.profileEl.one('.designs-details-overlay-title').setAttribute('href', url);
        }
      }

      this.frameEl = Y.DB.DIV("sitefilter-profile" + (data.specs ? " sitefilter-profile--features" : "") + (data.customer ? " sitefilter-profile--customer" : "") + (data.iphone ? " site-filter-profile--iphone" : ""), {
        html: '<div class="browser browser--dark browser--fluid browser--full"><iframe src="about:blank" class="site-frame"></iframe></div>'
      });

      if (data.specs) {
        this.frameEl.setStyle('marginTop', window.innerHeight);
      }

      this.profileEl.on("click", this.onProfileClick, this);

      Y.one(document.body).append(this.profileEl);
      Y.one(document.body).append(this.frameEl);
      Y.Squarespace.FrontSiteUtils.fixedLayout(true, null, true);


      var a = new Y.Anim({
        node: this.profileEl,
        to: {
          opacity: 1
        },
        duration: 0.3,
        easing: Y.Easing.easeOutStrong
      });


      a.on("end", function() {
        if (!data.specs) {
          this.frameEl.one(".site-frame").set("src", (data.identifier ? (document.location.protocol + '/' + '/' + data.identifier + ".squarespace.com" + (data.deepLink ? data.deepLink : "")) : document.location.protocol + '/' + '/' + data.customDomain) + (data.masterTemplate ? "?nochrome=true" : ""));

          this.profileEl.on('click', function(e) {
            if (!e.target.hasClass('designs-details-overlay-signup') && (!e.target.hasClass('designs-details-overlay-link')) && (!e.target.hasClass('designs-details-overlay-title'))) {
              this.closeProfile();
            } else if (e.target.hasClass('designs-details-overlay-signup')) {
              if (Y.config.win.SQUARESPACE_IS_AWESOME && Y.config.win.SQUARESPACE_IS_AWESOME.siteFilter) {
                Y.config.win.SQUARESPACE_IS_AWESOME.siteFilter.onClick(e);
              } else {
                var templateWebsiteIdentifier = data.baseTemplate.toLowerCase();
                if (STORE_TEMPLATES.indexOf(templateWebsiteIdentifier) !== -1) {
                  Y.config.win.location.href = '/commerce/templates/' + data.baseTemplate.toLowerCase();
                } else {
                  Y.config.win.location.href = '/websites/templates/' + data.baseTemplate.toLowerCase();
                }
              }
            }
          }, this);
        }
      }, this);


      if (data.specs) {
        this.frameEl.setContent(this.cachedSpecs);
        this.frameEl.addClass('sitefilter-profile--slidefeatures');

        Y.later(700, this, function() {
          this.frameEl.one('.layout .hero').remove();
          this.frameEl.one('.layout').removeClass('is--invisible');
          Y.Squarespace.FrontSiteUtils.disableTransforms(this.frameEl);
        });
      }

      a.run();


      if (data.customer || !data.cloneId) {
        Y.Squarespace.FrontSiteUtils.renderChromes(this.frameEl);
      }


      Y.Squarespace.FrontSiteUtils.escTarget('add', 'profile', this);
    }
  };

  Y.Squarespace.FrontSiteUtils.closeProfile = function() {
    Y.Squarespace.FrontSiteUtils.fixedLayout(false);

    if (this.scrollPositionClose) {
      window.scrollTo(0, this.scrollPositionClose);
      this.scrollPositionClose = null;
    }

    new Y.Anim({
      node: this.frameEl,
      to: {
        opacity: 0
      },
      duration: 0.2,
      easing: Y.Easing.easeOutStrong
    }).run();

    var a = new Y.Anim({
      node: this.profileEl,
      to: {
        opacity: 0
      },
      duration: 0.7,
      easing: Y.Easing.easeOutStrong
    });
    a.on("end", function() {
      if (this.profileEl && this.profileEl._node) {
        this.profileEl.remove();
        this.frameEl.remove();
        this.profileEl = null;
        this.frameEl = null;
      }
    }, this);
    a.run();

    Y.Squarespace.FrontSiteUtils.escTarget('remove', 'profile');
  };

}, '1.0', [
  'squarespace-dombuilder'
]);
