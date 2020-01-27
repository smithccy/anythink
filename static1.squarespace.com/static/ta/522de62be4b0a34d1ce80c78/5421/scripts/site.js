var Book = {};

Y.use([
  'node',
  'anim',
  'router',
  'node-event-delegate',
  'node-event-simulate',
  'squarespace-gallery-ng'
], function (Y) {

  Y.Get.load(Y.Object.values(Static.SQUARESPACE_CONTEXT.rollups['squarespace-search-page']), function() {
    Y.Get.load(Y.Object.values(Static.SQUARESPACE_CONTEXT.rollups['squarespace-search-preview']), function() {
      Y.use('squarespace-search-fullscreen', function() {});
    });
  });

  var router = new Y.Router({
    root: '/'
  });

  Y.Event.define("quadclick", {
    on: function (node, sub, notifier) {
      var count = 0,
        timer;

      sub._handle = node.on('click', function (e) {
        count++;

        if (timer) {
          timer.cancel();
        }

        timer = Y.later(200, null, function () {
          if (count === 4) {
            notifier.fire(e);
          }

          e.clicks = count;
          count = 0;
        });
      });
    },

    detach: function (node, subscription, notifier) {
      subscription._handle.detach();
    }
  });

  Book.getPage = function (path, node) {
    // todo: loading class to prevent keying to fast through articles
    Y.one('.article') && Y.one('.article').addClass('loading');
    Y.Data.get({
      url: path,
      responseFormat: 'raw',
      failure: Y.bind(function (data) {
        document.location = '/moved'
      }, this),
      success: Y.bind(function (data) {
        Book.guts._AVBlocksDestroy();
        var dom = Y.DOM.create(data);
        var contentId = Y.Selector.query('#layout', dom, true).getAttribute('data-content-id');
        Y.one('body').setAttribute('id', contentId);
        Y.one('#layout').setAttribute('data-content-id', contentId);
        Y.one(node).replace(Y.Selector.query(node, dom, true));
        Y.one('title').replace(Y.Selector.query('title', dom, true));

        Book.guts._reinitialize();
        Y.later(250, this, function () {
          Book.guts._toggleList('hide')
        });
        Y.one('.article').removeClass('loading');
      }, this)
    });
  }

  Book.getMore = function (path) {
    Book.guts.list.addClass('loading');
    Y.Data.get({
      url: path, //this.router.getPath(),
      responseFormat: 'raw',
      failure: Y.bind(function (data) {
        //console.log('failed')
      }, this),
      success: Y.bind(function (data) {
        var dom = Y.DOM.create(data);
        var list = Y.Selector.query('.list-content-wrapper', dom, true);
        Book.guts.list.one('.list-content-wrapper').append(Y.one(list).all('.col'));
        Book.guts._sizeElements();
        Book.guts._setActiveListItem();
        Book.guts.list.one('.load-next').setAttribute('href', list.getAttribute('data-pagination-url'));
        Book.guts._loadImages('.list-content-wrapper img');
        Book.guts.list.removeClass('loading');
        Y.later(100, this, function () { Book.guts._touchScroll() });
      }, this)
    });

  }

  Book.getList = function (path) {
    Y.Data.get({
      url: path, //this.router.getPath(),
      responseFormat: 'raw',
      failure: Y.bind(function (data) {
        //console.log('failed')
      }, this),
      success: Y.bind(function (data) {
        var dom = Y.DOM.create(data);
        var newPagination = Y.Selector.query('.list-content-pagination', dom, true);
        var paginationNode = Book.guts.list.one('.list-content-pagination');
        Book.guts.list.one('.list-content-wrapper').replace(Y.Selector.query('.list-content-wrapper', dom, true));
        if (newPagination) {
          if (paginationNode) {
           paginationNode.replace(newPagination);
          }
          else {
            Book.guts.list.append(newPagination);
          }
        }
        else {
          paginationNode && paginationNode.empty();
        }
        Book.guts._sizeElements();
        Book.guts._setActiveFilter();
        Book.guts._toggleList('show');
        Book.guts._touchScroll();
        Book.guts._watchListScroll();
        Book.guts._loadImages('.list-content-wrapper img');
      }, this)
    });
  }

  Book.overrides = function () {
    if (Y.one('body').getAttribute('id') === 'item-525440f6e4b05048ea3b41c1') {
      Book.sqsClassOverride('.site-branding', 'color-weight-dark', 'color-weight-light');
      Book.sqsClassOverride('.header', 'color-weight-dark', 'color-weight-light');
    }
  }

  Book.sqsClassOverride = function (targetSelector, classNameToRemove, classNameToAdd) {
    Y.one(targetSelector + '.' + classNameToRemove).addClass(classNameToAdd).removeClass(classNameToRemove);
  }

  // ONLY FOR DESIGN A/B TESTING
  Book.swapMore = function () {
    this.guts.article.toggleClass('more-left');
  }


  Book.guts = {

    _initialize: function () {
      // Local variables
      this.body = Y.one('body');
      this.layout = Y.one('#layout');
      this.siteBranding = this.layout.one('.site-branding');
      this.content = this.layout.one('.content');
      this.list = this.content && this.content.one('.list');
      this.article = this.content && this.content.one('.article');
      this.header = this.content && this.content.one('.header');
      this.mainImage = this.header && this.header.one('.main-image');
      this.abstract = this.header && this.header.one('.abstract');
      this.section = this.content && this.content.one('.section');
      this.comments = this.section && this.section.one('.comments-wrapper');
      this.mainNav = Y.one('.navigation--main');
      this.galleries = [];

      // Config
      this.scaleFonts = true;
      this.resizeEvent = typeof window.orientation === 'undefined' ? 'resize' : 'orientationchange';
      this.winWidth = Y.one(window).get('winWidth');

      if (Y.one('.not-found-page')) {
        Book.getPage('/moved', '.content');
        router.save('/moved');
        return;
      }

      if (document.location.pathname === '/search' || document.location.pathname === '/search/') {
        /*Book.getPage('/blog', '.content');
        Book.getList('/blog');
        router.save('/blog');*/
        document.location.pathname = '/blog';
        return;
      }

      // Setup

      // OS/Browser sniffing
      if (!Y.UA.ios && Y.UA.safari) {
        Y.one('html').addClass('safari');
        var v = navigator.appVersion.toString();
        var vx = parseFloat(v.substring(v.indexOf('Version/') + 8, v.indexOf('Safari')));
        Y.one('html').addClass('safari' + vx);
      } else if (Y.UA.ios) {
        Y.one('html').addClass('ios');
        Y.one('html').addClass('not-safari');
      }
      else if (Y.UA.ie) {
        Y.one('html').addClass('ie' + Y.UA.ie);
      }
      else if (navigator.appName === "Netscape") {
        new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null &&  Y.one('html').addClass('ie11');
      } else {
        Y.one('html').addClass('not-safari');
      }

      this.header && this._setColors(this.header, this.siteBranding);
      this.section && this._setColors(this.section);
      this.comments && this._setCommentControl(this.comments);
      if(this.section && this.section.one('.item-content--gallery')) {
        this._fullGallery();
      }
      this._routeBodyClicks();
      if (Book.guts.scaleFonts && this.header) {
        this._scaleFonts(this.header.one('.title'));
      }
      this._touchScroll();
      this._bindEvents();
      //this._setMoreButton();
      this._clonePagination();
      this._setActiveFilter();
      this._setActiveListItem();
      Y.one('.collection-type-blog') && this._articleStamp();
      Y.one('.collection-type-blog') && this._setFilterLinks();
      Book.overrides();
      //this._marryWidows();
      this._sizeElements();
      this.mainImage && this._loadMainImage();
      this._showPageContent();
      document.location.search && document.location.search != '?showComments' && Y.later(1000, this, function () { this._toggleList() });
    },

    _reinitialize: function () {
      // Redefine local variables after dynamic content change
      this.content = this.layout.one('.content');
      this.list = this.content && this.content.one('.list');
      this.article = this.content && this.content.one('.article');
      this.header = this.content && this.content.one('.header');
      this.mainImage = this.header && this.header.one('.main-image');
      this.abstract = this.header && this.header.one('.abstract');
      this.section = this.content && this.content.one('.section');
      this.comments = this.section && this.section.one('.comments-wrapper');
      this.mainNav = Y.one('.navigation--main');

      this.header && this._setColors(this.header, this.siteBranding);
      this.section && this._setColors(this.section);
      this.comments && this._setCommentControl(this.comments);
      if(this.section.one('.item-content--gallery')) {
        this._fullGallery();
      }
      if (Book.guts.scaleFonts) {
        this._scaleFonts(this.header.one('.title'));
      }
      //this._marryWidows();
      this._sizeElements(); //todo: resize all of the element or just some?
      this._touchScroll();
      this.mainImage && this._loadMainImage();
      this._bindEvents();
      this._setActiveListItem();
      //this._setMoreButton();
      this._clonePagination();

      // Social Buttons
      //Y.all('.squarespace-social-buttons').empty(true);
      new Y.Squarespace.SocialButtons();

      // TODO: hide share button wrapper when sharing is disabled from backend
      Y.all('.sqs-simple-like').each(function (n) {
        Y.one('.social-tools').setStyle('visibility', 'hidden');
        Y.Squarespace.SimpleLike.renderLikeCount(n);

        // todo: fix this hack
        Y.later(100, this, function () {
          this.setStyle('width', parseInt(this.getComputedStyle('width')) + 50);
        });
        Y.later(150, this, function () {
          this.setStyle('width', null);
          Y.one('.social-tools').setStyle('visibility', null);
        });
      });

      this._loadImages('.article:not(.gallery) .section img');
      Y.one('.collection-type-blog') && this._articleStamp();
      Y.one('.collection-type-blog') && this._setFilterLinks();
      this.section && this._AVBlocksInit();
      Book.overrides();
      this._showPageContent();

      (Book.guts.winWidth < 1024) && Y.later(300, this, function () {
        this._animateScroll(0, .1);
      });
    },

    _bindEvents: function () {
      Y.one(window).detach(Book.guts.resizeEvent);
      Y.one(window).on(Book.guts.resizeEvent, function () {
        // list stacked
        // todo: separate function?
        // clean this mess up with guards
        // todo: separate function? resued code in _initialize
        Book.guts.winWidth = Y.one(window).get('winWidth');
        if (Book.guts.winWidth < 1900 && Book.guts.winWidth > 1024) {
          Y.all('.list-item').each(function (i) {
            i.addClass('list-item--stacked')
          }, this);
        }
        else {
          Y.all('.list-item').each(function (i) {
            i.removeClass('list-item--stacked')
          }, this);
        }

        if (Book.guts.scaleFonts) {
          this._scaleFonts(this.header.one('.title'));
        }

        this._sizeElements();
        this._touchScroll();
        this.mainImage && Y.later(200, this, function () {
          this._loadMainImage();
        });

        Y.all('img[data-src]:not(.main-image)').each(function (img) {
          ImageLoader.load(img);
        });

      }, this);

      Y.all('.trigger').each(function (i) {
        i.detach('click');
        i.on('click', function (e) {
          this._toggleList();
        }, this);
      }, this);

      this._watchListScroll();

      this.section.on('scroll', function (e) {
        window.scrollTimer && window.scrollTimer.cancel();
        !this.section.hasClass('no--interaction') && this.section.addClass('no--interaction');
        window.scrollTimer = Y.later(100, this, function () {
          this.section.removeClass('no--interaction');
        });
      }, this);

      Y.one('.collection-type-blog') && Book.guts.winWidth >= 1024 && this.header.on('quadclick', function () {
        //this._fullScreenMainImage();
      }, this);

      Y.one('.touch') && Book.guts.winWidth > 480 && this._gestures();
    },

    _syncUI: function () {
      // todo: shared code between _initialize and _reinitialize
    },

    _sizeElements: function () {
      var wHeight = Y.one(window).get('winHeight');

      this.content && this.content.setStyle('height', wHeight);
      if (Book.guts.winWidth >= 1024) {
        this.layout.setStyle('height', wHeight);
        if (this.abstract) {
          this.abstract.prepend(this.abstract.one('.abstract-top'));
          this.abstract.setStyle('height', 'auto');
          this.abstract.removeClass('is--invisible');
          this.abstract.setStyle('top', null);
        }
        this.article && this.article.setStyle('height', wHeight);
        this.header && this.header.setStyle('height', wHeight);
        this.section && this.section.setStyle('height', wHeight);

        if (Y.one('.collection-type-blog')) {
          this.article.one('.item-content-wrapper').setStyle('min-height', this.article.one('.line-bottom').get('region').top - (this.article.one('.item-content-wrapper').get('region').top + parseInt(this.article.one('.item-content-wrapper').getComputedStyle('margin-bottom')) + parseInt(this.section.one('.social-tools').getComputedStyle('height')) + parseInt(this.section.one('.social-tools').getComputedStyle('margin-bottom')) + parseInt(this.section.one('.social-tools').getComputedStyle('margin-top')) + parseInt(this.article.one('.comments-wrapper').getComputedStyle('height')) + parseInt(this.article.one('.comments-wrapper').getComputedStyle('margin-bottom'))) );
        }
      }
      else if (Y.one('.cover') || Y.one('.moved')) {
        this.header && this.header.setStyle('height', wHeight);
        this.article && this.article.setStyle('height', wHeight);

      }
      else {
        this.abstract && this.abstract.prepend(this.abstract.one('.title'));
        if (Book.guts.winWidth <= 568) {
          this.header && this.header.setStyle('height', null);
        }
        else {
          this.header && this.header.setStyle('height', wHeight * .67);
          this.abstract && this.abstract.setStyle('height', ( this.abstract.one('.abstract-top').get('region').bottom - this.abstract.get('region').top) );
          var nTop = this.header.get('region').bottom / 2 - parseInt(this.abstract.one('.title').getComputedStyle('height')) / 2;
          nTop = nTop < this.siteBranding.one('.site-title-text').get('region').bottom ? this.siteBranding.one('.site-title-text').get('region').bottom + 24 : nTop;
          this.abstract && this.abstract.setStyle('top', nTop);
        }
        Y.later(100, this, function () {
          this.abstract.removeClass('is--invisible');
        });
      }

      if (this.header.get('region').height < this.abstract.get('region').bottom) {
        Y.one('.header').setStyle('height', Y.one('.abstract').get('region').bottom + 50 + 'px')
      }

      this.list && this.list.setStyles({'min-height': wHeight, 'height': wHeight});

      if (Book.guts.winWidth < 1900 && Book.guts.winWidth > 1024) {
        Y.all('.list-item').each(function (i) {
          i.addClass('list-item--stacked')
        }, this);
      }
      else if (Book.guts.winWidth <= 640) {
        Y.all('.list-item').each(function (i) {
          i.addClass('list-item--stacked')
        }, this);
      }
      else {
        Y.all('.list-item.list-item--stacked').each(function (i) {
          i.removeClass('list-item--stacked')
        }, this);
      }
    },

    _marryWidows: function() {
      var h = this.abstract.all('.title a');
      h && _replaceSpace(h);

      function _replaceSpace(elements) {
        for (var i = 0; i < elements.size(); i++) {
          var t = elements.item(i).get('innerHTML');
          var pos = t.lastIndexOf(' ');
          if (pos > 0 && pos !== t.length - 1) {
            t = t.substr(0, pos) + '&nbsp;' + t.substr(pos+1);
            elements.item(i).set('innerHTML', t);
          }
        }
      }
    },

    _touchScroll: function () {
      // TODO: fix hack for native momentum scrolling
      if (Y.one('.touch') && !Y.one('.cover') && !Y.one('.moved')) {
        if (Book.guts.winWidth == 1024) {
          Y.later(100, this, function () {
            Y.one('.section') && Y.one('.section').setStyle('-webkit-overflow-scrolling', 'touch');
          });
        }
        else {
          Y.one('.section') && Y.one('.section').setStyle('-webkit-overflow-scrolling', null);
          //Y.one('.list') && Y.one('.list').setStyle('-webkit-overflow-scrolling', null);
        }
      }
    },

    _gestures: function () {
      var target,
          gestureStart,
          gestureEnd,
          verticalDelta,
          horizontalDelta,
          direction;
      Y.one('body').on('gesturemovestart', function (e) {
        gestureStart = [e.pageX, e.pageY];

        e.currentTarget.once('gesturemoveend', function (e) {
          gestureEnd = [e.pageX, e.pageY];
          verticalDelta = Math.abs(gestureStart[1] - gestureEnd[1]);
          horizontalDelta = gestureStart[0] - gestureEnd[0];

          if (verticalDelta < 25 && Math.abs(horizontalDelta) > 75) {
            direction = horizontalDelta > 0 ? 'left' :'right';
            if (direction == 'left') {
              if (this.body.hasClass('is--pushed-left')) {
                return;
              }
              else if (this.body.hasClass('is--pushed-right')) {

                this._toggleList('hide');
              }
              else {
                this._toggleMenu('show');
              }
            }
            else if (direction == 'right') {
              if (this.body.hasClass('is--pushed-left')) {
                this._toggleMenu('hide');
              }
              else if (this.body.hasClass('is--pushed-right')) {
                return;
              }
              else {
                this._toggleList('show');
              }
            }
          }
        }, null, this);
      }, null, this);
    },

    _loadMainImage: function () {
      this.mainImage.setAttribute('data-load', 'true');
      ImageLoader.load(this.mainImage);
      this.mainImage.on('load', function (e) {
        e.currentTarget.addClass('loaded');
      }, this);
      // todo: dial-in fade in image
    },

    _setMoreButton: function () {
      if (!Y.one('.collection-type-blog') && this.list.all('.list-item').size() <= 1) {
        this.section.one('.more-link .trigger').setStyle('display', 'none');
      }
      else {
        this.section.one('.more-link .trigger').setStyle('display', null);
      }
    },

    _setFilterLinks: function () {
      var collectionContext = JSON.parse(document.getElementById('collection-context').textContent);

      var blogRoot = this.article.getAttribute('data-blog-root') + collectionContext.urlId;

      function _setFilterLinks(links) {
        for(var ii = 0; ii < links.size(); ii++) {
          var link = links.item(ii);
          // todo: fix the scoping issue for partials and substring won't be needed
          var href = link.getAttribute('href');
          var filterLink = blogRoot + href.substring(href.indexOf('?'));
          link.setAttribute('href', filterLink);
        }
      }

      _setFilterLinks(this.header.all('.contributor'));
      _setFilterLinks(this.list.all('.category-filters a'));
      _setFilterLinks(this.header.all('.category'));
      _setFilterLinks(this.section.all('.tag'));
    },

    _clonePagination: function () {
      if (Y.one('.moved') || Y.one('.cover')) {
        return;
      }

      if (this.section.one('.pagination')) {
        var newPagination = this.section.one('.pagination').cloneNode(true);
        newPagination.addClass('flex-none');
        this.header.one('.abstract-bottom').append(newPagination);
      }
    },

    _showPageContent: function () {
      this.layout.removeClass('is--invisible');
    },

    _setColors: function (el, target) {
      var currentColor = el.getAttribute('data-color-suggestedbg') || el.getComputedStyle('background-color');
      if (currentColor) {
        var rgba = currentColor.match(new RegExp('rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)'));

        if (rgba) {
          currentColor = this._rgb2hex(rgba[1],rgba[2],rgba[3]);
        }

        var weight = this._getLightness(currentColor);
        el.addClass('color-weight-' + weight);
        if (target) {
          //target = Y.one(target);
          target.removeClass('color-weight-dark').removeClass('color-weight-light').addClass('color-weight-' + weight);
        }

        if (el === this.header) {
          var percentLuma = this._getLuma(currentColor)/255;

          if (weight === 'dark') {
            //console.log('dark: ' + percentLuma);
          }
          else if (weight === 'light') {
            //console.log('light: ' + percentLuma);
            percentLuma = 1 - percentLuma;
          }

          if (percentLuma > .25) {
            var l = .25;
          }
          else if (percentLuma < .1) {
            var l = .1;
          }
          else {
            var l = percentLuma;
          }
          this.mainImage ? el.one('.scrim').setStyle('opacity', l) : el.one('.scrim').setStyle('opacity', 0); // percentLuma > .5 ? percentLuma - .5 : percentLuma

        }
      }
    },

    _rgb2hex: function (r, g, b) {
      var parts = [r,g,b];

      for (var i = 0; i <= 2; ++i) {
        parts[i] = parseInt(parts[i], 10).toString(16);

        if (parts[i].length == 1)
          parts[i] = '0' + parts[i];
      }

      return '#'+parts.join('');
    },

    _getLightness: function(hexcolor) {
      if (hexcolor && hexcolor.length > 0 && hexcolor.length <= 7) {
        hexcolor = hexcolor.replace('#', '');
        //return ((parseInt(hexcolor, 16) > 0xffffff * .75) ? 'light' : 'dark');
        // todo: tweak settings to black, white, or smart
        return (this._getLuma(hexcolor) / 255 > .99) ? 'light' : 'dark';
      } else {
        return '';
      }
    },

    _getLuma: function(hex) {
      hex = hex.replace(/^\s*#|\s*$/g, '');

      if(hex.length == 3){
        hex = hex.replace(/(.)/g, '$1$1');
      }

      var r = parseInt(hex.substr(0, 2), 16),
          g = parseInt(hex.substr(2, 2), 16),
          b = parseInt(hex.substr(4, 2), 16),
          y = (.2126 * r) + (.7152 * g) + (.0722 * b);

      return y;
    },

    _scaleFonts: function (el) {
      if (Book.guts.winWidth >= 1024) {
        el.setAttribute('style', 'font-size: ' + this._percentagesOfPercentages([2400,1024], [9,5], Book.guts.winWidth, 'rem'));
      }
      else if (Book.guts.winWidth < 1024) {
        el.setAttribute('style', 'font-size: ' + this._percentagesOfPercentages([1023, 320], [6,3.5], Book.guts.winWidth, 'rem'));
      }
    },

    _setActiveListItem: function () {
      this.list.all('.list-item').each(function (i){
        i.removeClass('active');
        if (i.getAttribute('href') === document.location.pathname) {
          i.addClass('active');
        }
        else if (Y.one('.blog-list')) {
          this.list.one('.list-item').addClass('active');
        }

        i.on('click', function (e) {
          if (e.currentTarget.hasClass('active')) {
            e.preventDefault();
            this._toggleList('hide');
          }
        }, this);
      }, this);
    },

    _setActiveFilter: function () {
      if (!Y.one('.list-content-categories .category-filter')) {
        return;
      }
      else {
        Y.one('.category-filter.active') && Y.one('.category-filter.active').removeClass('active');
        if (document.location.search.indexOf('category=') == -1) {
          Y.one('.category-filter.category-filter-showall') && Y.one('.category-filter.category-filter-showall').addClass('active');
        }
        else {
          var catName = document.location.search.substring(document.location.search.indexOf('category=') + 9);
          catName && Y.one('.category-filter.category-filter-' + catName).addClass('active');
        }
      }
    },

    _setCommentControl: function (comments) {
      if (document.location.search.indexOf('showComments') == - 1) {
        comments.addClass('collapsed');
      }
      else {
        comments.one('.comments-content').addClass('col--8');
        // todo: scroll to comments
      }
      comments.on('click', function (i) {
        if (comments.one('.new-comment-area') && (comments.one('.comment-count span').get('innerHTML').indexOf('()') == -1)) {
          comments.toggleClass('collapsed');
          comments.one('.new-comment-area').show(true);
          comments.one('.comment-list').show(true);
        }
        else {
          document.location = this.header.one('.title a').getAttribute('href') + "?showComments";
        }

      }, this);
    },

    _fullGallery: function() {
      if (Book.guts.galleries[0]) {
        Book.guts.galleries[0].destroy();
      }
      var bookGallery = new Y.Squarespace.Gallery2({
        autoplay: false,
        autoplayOptions: {
          timeout: 5000
        },
        container: Y.one('.item-content--gallery .col'),
        loop: true,
        design: 'grid',
        designOptions: {
          speed: 1,
          autoHeight: true
        },
        loaderOptions: {
          mode: 'fill' // todo: tweak
        }
      });
      Book.guts.galleries.push(bookGallery);
    },

    _AVBlocksDestroy: function () {
      Y.fire('audioPlayer:stopAll');
    },

    _AVBlocksInit: function () {
      if (this.section.one('.item-content-wrapper .sqs-layout')) {
        Squarespace.initializeLayoutBlocks(Y);
      }

      if (this.section.one('.audio-block')) {
        Squarespace.initializeAudioBlock(Y);
      }

      if (this.section.one('.sqs-video-wrapper')) {
        Squarespace.initializeVideo(Y);
      }
    },

    _routeBodyClicks: function () {
      Y.one('body').delegate('click', function (e) {
        e.preventDefault();
        var path = e.currentTarget.getAttribute('href');
        if (e.currentTarget.getAttribute('target')) {
          var win = window.open(path, '_blank');
        }
        else {
          document.location = path;
        }
      }, '.navigation--main a');

      Y.one('body').delegate('click', function (e) {
        Book.guts._toggleMenu('hide');
      }, '.navigation-close');

      Y.one('body').delegate('click', function (e) {
        Book.guts._handleClick(e);
      }, '.list-item');

      Y.one('body').delegate('click', function (e) {
        Book.guts._handleClick(e);
      }, '.category-filter');

      Y.one('body').delegate('click', function (e) {
        Book.guts._handleClick(e);
      }, '.abstract .meta a');

      Y.one('body').delegate('click', function (e) {
        Book.guts._handleClick(e);
      }, '.pagination-item a');

      Y.one('body').delegate('click', function (e) {
        if (Y.one('body').hasClass('is--pushed-right')) {
          e.preventDefault();
          Book.guts._toggleList('hide');
        }
      }, '.site-branding');

      Y.one('body').delegate('click', function (e) {
        if (Y.one('body').hasClass('is--pushed-right') && !e.target.hasClass('trigger')) {
          e.preventDefault();
          Book.guts._toggleList('hide');
        }
      }, '.header');

      Y.one('body').delegate('click', function (e) {
        if (e.target.hasClass('navigation-main-trigger')) {
          return;
        }
        if (!e.target.hasClass('icon') && !e.target.ancestor().hasClass('navigation-main-trigger') && Y.one('body').hasClass('is--pushed-left')) {
          e.preventDefault();
          Book.guts._toggleMenu('hide');
        }
        else if (Y.one('body').hasClass('is--pushed-right') && !e.target.hasClass('trigger')) {
          e.preventDefault();
          Book.guts._toggleList('hide');
        }
      }, '.article .section');

      Y.one('body').delegate('click', function (e) {
        if (Y.one('body').hasClass('is--pushed-left')) {
          Book.guts._toggleMenu('hide');
        }
        else {
          Book.guts._toggleMenu();
        }
      }, '.navigation-main-button');

      Y.one('body').delegate('touchend', function (e) {
        if (!e.target.hasClass('icon') && !e.target.ancestor().hasClass('navigation-main-trigger') && Y.one('body').hasClass('is--pushed-left')) {
          e.preventDefault();
          Book.guts._toggleMenu('hide');
        }
        else if (Y.one('body').hasClass('is--pushed-right') && !e.target.hasClass('trigger')) {
          e.preventDefault();
          Book.guts._toggleList('hide');
        }
      }, '.article');
    },

    _handleClick: function (e) {
      if (e.button !== 1 || e.ctrlKey || e.metaKey) {
        return;
      }

      if (e.currentTarget.hasClass('active')) {
        return;
      }

      if (e.currentTarget.hasClass('category-filter-search')) {
        return;
      }

      e.preventDefault();

      // todo: remove this?
      if (e.currentTarget.hasClass('navigation-main-button')) {
        Book.guts._toggleMenu();
        return;
      }

      var path = router.removeRoot(e.currentTarget.get('href'));

      if (e.currentTarget.hasClass('load-next')) {
        if (Book.guts.list.hasClass('loading')) {
          return;
        }
        Book.getMore(path);
      }
      else if (e.currentTarget.hasClass('category-filter')) {
        router.save(path);
        Book.getList(path);
      }
      else if (e.currentTarget.hasClass('category') || e.currentTarget.hasClass('contributor')) {
        router.save(path);
        Book.getList(path);
      }
      else if (e.currentTarget.hasClass('list-item') || e.currentTarget.hasClass('next-item') || e.currentTarget.hasClass('prev-item')) {
        router.save(path);
        Book.getPage(path, '.article');
      }
      else {
        if (router.removeRoot(document.location.href) !== path) {
          Book.getPage(path, '.article');
          router.save(path);
        }
      }
    },

    _toggleList: function (force) {
      var isTouch = Y.one('.touch');
      if (force && force === 'show') {
        this.list.removeClass('is--hidden');
        this._loadImages('.image-wrapper img');
        this.body.addClass('is--pushed-right');
        isTouch && this.list.setStyle('-webkit-overflow-scrolling', 'touch');
        return;
      }
      else if (force && force === 'hide') {
        Y.later(500, this, function () {
          !this.body.hasClass('is--pushed-right') && this.list.addClass('is--hidden');
        })
        this.body.removeClass('is--pushed-right');
        isTouch && this.list.setStyle('-webkit-overflow-scrolling', null);
        return;
      }
      else {
        if (this.body.hasClass('is--pushed-right')) {
          Y.later(500, this, function () {
            !this.body.hasClass('is--pushed-right') && this.list.addClass('is--hidden');
          })
          this.body.removeClass('is--pushed-right');
          isTouch && this.list.setStyle('-webkit-overflow-scrolling', null);
          return;
        }
        else {
          this.list.removeClass('is--hidden');
          this._loadImages('.image-wrapper img');
          if (this.body.hasClass('is--pushed-left')) {
            this._toggleMenu('hide');
            Y.later(parseFloat(this.layout.getComputedStyle('transition-duration')) * 1000 || 500, this, function () {
              this.body.addClass('is--pushed-right');
              isTouch && this.list.setStyle('-webkit-overflow-scrolling', 'touch');
            });
          }
          else {
            this.body.addClass('is--pushed-right');
            isTouch && this.list.setStyle('-webkit-overflow-scrolling', 'touch');
          }
        }
      }
    },

    _toggleMenu: function (force) {
      if (force && force === 'show') {
        Y.one('.navigation--main').removeClass('is--invisible');
        this.body.addClass('is--pushed-left');
      }
      else if (force && force === 'hide') {
        Y.later(500, this, function () {
          Y.one('.navigation--main').addClass('is--invisible');
        })
        this.body.removeClass('is--pushed-left');
      }
      else {
        Y.one('.navigation--main').toggleClass('is--invisible');
        this.body.toggleClass('is--pushed-left');
      }
    },

    _loadImages: function (el) {
      Y.all(el).each(function (i) {
        i.setAttribute('data-load', 'true');
        ImageLoader.load(i);
        i.setAttribute('data-load', null);
      }, this);
    },

    _articleStamp: function () {
      var htmlBlocks = this.section.all('.html-block');
      for (var ii = htmlBlocks.size() - 1; ii >= 0; ii--) {
        if (htmlBlocks.item(ii).one('p')) {
          htmlBlocks.item(ii).one('p:not(:empty):last-of-type').append('&nbsp;&nbsp;<span class="article-stamp"></span>');
          return;
        }
      }
    },

    _getScrollPercentage: function (el, callback, threshold) {
      if (!el) {
        return;
      }

      var threshold = parseFloat(threshold) || .5;
      var per = el.get('scrollTop')/(el.get('scrollHeight') - parseInt(el.getComputedStyle('height')));

      if (per >= threshold) {
        callback && callback();
      }
    },

    /*
      As the container's dimension (i.e. width) changes, the inside element's dimension
      will change within a range.

      container: Array, [lower bound (number), upper bound (number)]
      inside: Array, [lower bound (number), upper bound (number)]
      value: Number, value to test

      Returns: Number, value within the inside range
     */
    _percentagesOfPercentages: function (container, inside, value, unit) {
      if (container instanceof Array && container.length === 2 && inside instanceof Array && inside.length === 2 && typeof value === 'number') {
        var cStart = container[0];
        var cEnd = container[1];
        var cLower = cStart < cEnd ? cStart : cEnd;
        var cUpper = cStart < cEnd ? cEnd : cStart;
        var inStart = inside[0];
        var inEnd = inside[1];
        var inLower = inStart < inEnd ? inStart : inEnd;
        var inUpper = inStart < inEnd ? inEnd : inStart;


        if (value > cUpper || value < cLower) {
          return null;
        }

        cDiff = Math.abs(cStart - cEnd);
        inDiff = Math.abs(inStart - inEnd);

        if (cStart === cUpper) {
          if (inStart === inUpper) {
            var mod = inEnd;
          }
          else {
            var mod = 0 - inEnd;
          }
        }
        else {
          if (inStart === inUpper) {
            var mod = 0 - inStart;
          }
          else {
            var mod = inStart;
          }
        }
        // todo: round using argument for number of decimal places
        //console.log(Math.abs( ( (value - cLower) / cDiff ) * inDiff + mod).toString() + (unit || ''));
        return Math.abs( ( (value - cLower) / cDiff ) * inDiff + mod).toString() + (unit || '');
      }
    },

    // todo: scroll inside a DIV
    _animateScroll: function (top, duration) {
      var windowScroll = new Y.Anim({
        node: Y.UA.gecko ? 'html' : 'body',
        to: {
          scroll: [0, top]
        },
        duration: duration,
        easing: 'easeBoth'
      });

      var scrollTimer = setTimeout(function() {
        windowScroll.run();
      }, 0);
    },

    _watchListScroll: function () {
      this.list && this.list.on('scroll', function (e) {
        var next = Book.guts.list.one('.load-next');
        !e.currentTarget.hasClass('loading') && this._getScrollPercentage(e.currentTarget, (function () {
          if (next && next.getAttribute('href') != '') {
            next.simulate('click');
          }
          else {
            e.currentTarget.detach('scroll');
          }
        }), 0.9);
      }, this);
    },

    _fullScreenMainImage: function () {
      this.layout.toggleClass('full-screen-main-image');
      if (!this.layout.hasClass('full-screen-main-image')) {
        this.mainImage.addClass('shrinking');
        Y.later(300, this, function () {
          this.mainImage.addClass('shrinking');
          this.mainImage && ImageLoader.load(this.mainImage);
          Y.later(200, this, function () {
            this.mainImage.removeClass('shrinking');
          });
        })
      }
      else {
        this.mainImage && ImageLoader.load(this.mainImage)
      }
      //this.abstract && this.abstract.toggleClass('is--invisible');
      //this.header.one('.scrim') && this.header.one('.scrim').toggleClass('is--invisible');
      //this.header.one('.line-bottom') && this.header.one('.line-bottom').toggleClass('is--invisible');
    }
  }

	Y.on('domready', function () {
    Book.guts._initialize();
	});

  function keyEvents(e) {
    var code = e.keyCode;

    if (!Y.one('.sqs-lightbox-open') && e.target.get('tagName') !== 'INPUT' && e.target.get('tagName') !== 'TEXTAREA') {
      // 37 left
      if (code === 37) {
        var prev = Y.one('.prev-item');
        prev && prev.simulate('click');
      }

      // 39 right
      if (code === 39) {
        var next = Y.one('.next-item');
        next && next.simulate('click');
      }
    }
  }

  Y.one(document).on('keydown', keyEvents, this);

});
