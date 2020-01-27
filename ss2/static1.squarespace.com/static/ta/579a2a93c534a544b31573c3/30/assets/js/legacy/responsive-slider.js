
Y.add('squarespace-responsive-slider', function (Y) {

  Y.namespace('Squarespace.FrontSite').ResponsiveSlider = Y.Base.create('ResponsiveSlider', Y.Base, [], {

    /*
     * Init
     */
    initializer: function () {
      this.container = this.get('container');
      this.slides = this.get('slides');
      this.dots;
      this.events = [];
      this.isSlider = false;
      this.slider;

      this._bindEvents();
      this._buildSlider();
    },


    /*
     * Convert existing markup into a slider
     */
    _buildSlider: function () {
      if (!this.isSlider && document.body.clientWidth <= this.get('breakpoint')) {
        this.isSlider = true;

        this.container.addClass('sqs-responsive-slider--loading');
        this.container.addClass('sqs-responsive-slider');
        this.container.setStyle('height', this.get('height'));

        this.slides.addClass('sqs-responsive-slider-slide');

        this.dots = Y.Node.create('<div class="sqs-responsive-slider-dots"></div>');
        for (var s = 0; s < this.slides.size(); s++) {
          var dot = Y.Node.create('<span class="sqs-responsive-slider-dot"><span class="icon"></span></span>');
          dot.appendTo(this.dots);
        }
        this.dots.appendTo(this.container.ancestor());

        this.slider = new Y.Squarespace.Gallery2({
          container: this.container,
          slides: this.slides,
          design: 'stacked',
          elements: {
            controls: this.dots
          },
          designOptions: {
            autoHeight: false,
            speed: 0.3
          }
        });

        this.container.removeClass('sqs-responsive-slider--loading');
      }
    },


    /*
     * Go back to original state
     */
    _destroySlider: function (destructor) {
      var activeSlide = this.slider && this.slider.get('currentIndex');

      if (this.isSlider && (destructor || document.body.clientWidth > this.get('breakpoint'))) {
        this.isSlider = false;

        this.slider.destroy();

        if (!destructor) {
          this.container.removeClass('sqs-responsive-slider')
          this.container.removeClass('sqs-gallery-design-stacked');
          this.container.setStyle('height', null);

          this.slides.removeClass('sqs-responsive-slider-slide');
          this.slides.removeClass('sqs-active-slide');
          this.slides.setStyle('visibility', null);

          this.dots.remove();
        } else {
          this.slides.each(function (s, index) {
            if (index !== activeSlide) {
              s.setStyle('display', 'none');
            }
          });
        }
      }
    },


    /*
     * Register events
     */
    _bindEvents: function () {
      this.events.push(Y.one(window).on(window.orientation !== undefined ? 'orientationchange' : 'resize', function (e) {
        this._buildSlider();
        this._destroySlider();
      }, this));
    },


    /*
     * Destroy
     */
    destructor: function () {
      for (var e = 0; e < this.events.length; e++) {
        this.events[e].detach();
      }

      this._destroySlider(true);
    }

}, {
    ATTRS: {
      container: {
        getter: function (value) {
          if (Y.Lang.isString(value)) {
            value = Y.one(value);
          }
          return value;
        }
      },

      slides: {
        getter: function (value) {
          if (value) {
            if (Y.Lang.isString(value)) {
              value = Y.one(value);
            }
            return value;
          } else {
            return this.get('container').get('children');
          }
        }
      },

      breakpoint: {
        value: 768
      },

      height: {
        value: 200
      }
    }
  });
}, '1.0', {
  requires: [
    'base-build'
  ]
});
