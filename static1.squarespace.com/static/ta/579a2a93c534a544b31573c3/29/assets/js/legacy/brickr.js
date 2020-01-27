/*
 * Squarespace Brickr
 *
 * That shit bananas.
 */

YUI.add('squarespace-brickr', function (Y) {

  // hold an object positions on the screen, and then animate it
  // used to animate re-ordering images in the gallery manager
  Y.namespace('Squarespace.FrontSite').PositionAnimator = Y.Base.create("PositionAnimator", Y.Plugin.Base, [], {
    initializer: function() {

    },

    hold: function() {

      this.set('originalTop', this.get('host').get('offsetTop'));
      this.set('originalLeft', this.get('host').get('offsetLeft'));

      this.previousPosition = this.get('host').getStyle('position');

    },

    release: function() {

      // calculate the difference
      var offsetTop = this.get('host').get('offsetTop');
      var offsetLeft = this.get('host').get('offsetLeft');

      this.get('host').setStyles({
        position: 'relative',
        top: this.get('originalTop') - offsetTop,
        left: this.get('originalLeft') - offsetLeft
      });

      var ctx = this;

      var anim = this.get('host').anim({
        top: 0,
        left: 0
      }, {
        duration: 0.6 + (Math.random() * 0.2),
        end: function() {
          if (!this.get('node')._node) { return; }
          this.get('node').setStyles({
            position: this.previousPosition,
            top: null,
            left: null
          });

          if (this.get('releasedFn')) {
            this.get('releasedFn')();
          }

          ctx.fire('released');
        }
      });

      setTimeout(function() {
        anim.run();
      }, 200 * Math.random());

    },

    destructor: function() {

    }
  }, {
    NS: 'positionAnimator',
    ATTRS: {
      'originalTop': {},
      'originalLeft': {},
      'releasedFn': { value: false }
    }
  });


  Y.namespace('Squarespace.FrontSite').Brickr = Y.Base.create("Brickr", Y.Plugin.Base, [], {

    initializer: function() {

      // them stylesheets
      this.stylesheet = Y.Node.create('<style type="text/css"></style>');
      Y.one('body').appendChild(this.stylesheet);
      
      // animate them positions
      this.get('host').all(this.get('selector')).each(function(el) {
        el.plug(Y.Squarespace.FrontSite.PositionAnimator);
        el.plug(Y.Squarespace.Animations.Scalable);
      });

    },

    filter: function(onlyShow) {

      var elementsToHide = [];
      var elementsToShow = [];
      var elementsToReposition = [];

      // evaluate!
      this.get('host').all(this.get('selector')).each(function(el) {

        var currentlyVisible = el.getData('visible');
        var shouldBeVisible = el.getData('visible');

        if (el.test(onlyShow) || onlyShow == '') {
          shouldBeVisible = true;
        } else {
          shouldBeVisible = false;
        }

        if (currentlyVisible != shouldBeVisible) {
          if (shouldBeVisible) {
            elementsToShow.push(el);
            // console.log('show', el.one('h1').getContent(), ['currentState', currentlyVisible], ['newState', shouldBeVisible]);
          } else {
            elementsToHide.push(el);
            // console.log('hide', el.one('h1').getContent(), ['currentState', currentlyVisible], ['newState', shouldBeVisible]);
          }
        } else {
          elementsToReposition.push(el);
        }

      });

      // 1. remove elements to hide

      for (var i = 0; i < elementsToHide.length; i++) {
        var el = elementsToHide[i];
        //el.hide();
        el.setStyle('opacity', 0);
      }

      setTimeout(function() {

        for (var i = 0; i < elementsToReposition.length; i++) {
          var el = elementsToReposition[i];
          el.positionAnimator.hold();
        }

        for (var i = 0; i < elementsToHide.length; i++) {
          var el = elementsToHide[i];
          el.setStyles({display: 'none'});
          el.setData('visible', false);
        }

        for (var i = 0; i < elementsToShow.length; i++) {
          var el = elementsToShow[i]
          //el.hide(true);
          el.setStyles({display: 'block'});
          //el.one('img').fire('refresh');
          //el.show();
          el.setData('visible', true);
          el.setStyle('opacity', null);
        }

        for (var i = 0; i < elementsToReposition.length; i++) {
          elementsToReposition[i].positionAnimator.release()
        }

        // 2. hold the displaying ones position

        // 3. fade in elements to show, and animate the new positions of the displaying ones

      }, 300);


    },

    destructor: function() { }

  }, {
    NS: 'brickr',
    ATTRS: {
      mode: {},
      minColumnWidth: {},
      maxColumnWidth: {},
      selector: {
        value:'> *'
      }
    }
  });

}, '1.0', {
  requires: [
  "base-build",
  "plugin",
  "squarespace-ui-base"
  ]
});